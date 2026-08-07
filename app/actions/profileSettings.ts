'use server';

// Next.js Server Action: Profile Settings (app/actions/profileSettings.ts)
// Reads/writes the normalized profile architecture (profiles, user_languages,
// language_goals, match_preferences, user_interests, availability, privacy_settings).

import { prisma } from './db';
import {
  ActionResponse,
  ProfileSettingsPayload,
  ProfileSettingsSnapshot,
  UserLanguageEntry,
} from './types';
import { guardAgainstAmbassadorMutation } from './ambassadors';

function timezoneToOffset(timezone: string | null): number {
  if (!timezone) return 0;

  const utcMatch = timezone.trim().match(/^UTC([+-])(\d{1,2})(?::?(\d{2}))?$/i);
  if (utcMatch) {
    const hours = parseInt(utcMatch[2], 10);
    const minutes = utcMatch[3] ? parseInt(utcMatch[3], 10) : 0;
    const sign = utcMatch[1] === '-' ? -1 : 1;
    return sign * (hours + minutes / 60);
  }

  try {
    const parts = Intl.DateTimeFormat('en-US', { timeZone: timezone, timeZoneName: 'shortOffset' })
      .formatToParts(new Date())
      .find((p) => p.type === 'timeZoneName');
    const raw = parts?.value ?? '';
    const m = raw.match(/^GMT([+-])(\d{1,2})(?::?(\d{2}))?$/);
    if (m) {
      const hours = parseInt(m[2], 10);
      const minutes = m[3] ? parseInt(m[3], 10) : 0;
      const sign = m[1] === '-' ? -1 : 1;
      return sign * (hours + minutes / 60);
    }
  } catch {
    // fall through to 0
  }

  return 0;
}

function parseTopics(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function safeIso(date: string | null): Date | null {
  if (!date) return null;
  const d = new Date(date);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function getProfileSettingsAction(
  userId: string
): Promise<ActionResponse<ProfileSettingsSnapshot>> {
  try {
    const [profile, user, languages, interests] = await Promise.all([
      prisma.profile.findUnique({ where: { userId } }),
      prisma.user.findUnique({
        where: { id: userId },
        include: {
          profileLanguages: true,
          languageGoals: true,
          matchPreference: true,
          userInterests: true,
          availability: true,
          privacySettings: true,
        },
      }),
      prisma.language.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
      prisma.interest.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
    ]);

    if (!user) {
      return { success: false, error: 'User not found.' };
    }

    const payload: ProfileSettingsPayload = {
      profile: {
        username: profile?.username ?? null,
        displayName: profile?.displayName ?? null,
        profilePhoto: profile?.profilePhoto ?? user.avatarUrl,
        bio: profile?.bio ?? user.bio,
        dateOfBirth: profile?.dateOfBirth ? profile.dateOfBirth.toISOString() : null,
        gender: profile?.gender ?? null,
        country: profile?.country ?? null,
        city: profile?.city ?? null,
        timezone: profile?.timezone ?? null,
        nativeLanguage: profile?.nativeLanguage ?? null,
        interfaceLanguage: profile?.interfaceLanguage ?? null,
      },
      nativeLanguages: user.profileLanguages
        .filter((l) => l.type === 'NATIVE')
        .map((l) => ({ languageId: l.languageId, proficiency: l.proficiency })),
      learningLanguages: user.profileLanguages
        .filter((l) => l.type === 'LEARNING')
        .map((l) => ({ languageId: l.languageId, proficiency: l.proficiency })),
      goals: user.languageGoals.map((g) => ({
        goalType: g.goalType,
        languageId: g.languageId,
        targetLevel: g.targetLevel,
        targetDate: g.targetDate ? g.targetDate.toISOString() : null,
        status: g.status,
      })),
      matchPreference: {
        seeking: user.matchPreference?.seeking ?? null,
        partnerGenderPreference: user.matchPreference?.partnerGenderPreference ?? null,
        partnerAgeMin: user.matchPreference?.partnerAgeMin ?? null,
        partnerAgeMax: user.matchPreference?.partnerAgeMax ?? null,
        callPreference: user.matchPreference?.callPreference ?? null,
        conversationTopics: parseTopics(user.matchPreference?.conversationTopics ?? null),
      },
      interestIds: user.userInterests.map((i) => i.interestId),
      availability: user.availability.map((a) => ({
        dayOfWeek: a.dayOfWeek,
        startTime: a.startTime,
        endTime: a.endTime,
        timezone: a.timezone,
      })),
      privacySettings: {
        showProfile: user.privacySettings?.showProfile ?? true,
        showOnlineStatus: user.privacySettings?.showOnlineStatus ?? true,
        showLastActive: user.privacySettings?.showLastActive ?? true,
        showEmail: user.privacySettings?.showEmail ?? false,
        showAge: user.privacySettings?.showAge ?? true,
        showLocation: user.privacySettings?.showLocation ?? true,
        allowDMs: user.privacySettings?.allowDMs ?? true,
        allowVideoCalls: user.privacySettings?.allowVideoCalls ?? true,
      },
    };

    return {
      success: true,
      message: 'Profile settings loaded.',
      data: { payload, languages, interests },
    };
  } catch (error: any) {
    console.error('=== GET PROFILE SETTINGS ERROR ===');
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    console.error('===================================');
    return { success: false, error: error.message || 'Failed to load profile settings.' };
  }
}

export async function updateProfileSettingsAction(
  userId: string,
  input: ProfileSettingsPayload
): Promise<ActionResponse<{ userId: string }>> {
  try {
    await guardAgainstAmbassadorMutation(userId, 'modified');
  } catch (e: any) {
    return { success: false, error: e.message };
  }

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Profile (1:1)
      await tx.profile.upsert({
        where: { userId },
        create: {
          userId,
          username: input.profile.username,
          displayName: input.profile.displayName,
          profilePhoto: input.profile.profilePhoto,
          bio: input.profile.bio,
          dateOfBirth: safeIso(input.profile.dateOfBirth),
          gender: input.profile.gender,
          country: input.profile.country,
          city: input.profile.city,
          timezone: input.profile.timezone,
          nativeLanguage: input.profile.nativeLanguage,
          interfaceLanguage: input.profile.interfaceLanguage,
        },
        update: {
          username: input.profile.username,
          displayName: input.profile.displayName,
          profilePhoto: input.profile.profilePhoto,
          bio: input.profile.bio,
          dateOfBirth: safeIso(input.profile.dateOfBirth),
          gender: input.profile.gender,
          country: input.profile.country,
          city: input.profile.city,
          timezone: input.profile.timezone,
          nativeLanguage: input.profile.nativeLanguage,
          interfaceLanguage: input.profile.interfaceLanguage,
        },
      });

      // 2. User Languages (native + learning)
      await tx.userLanguage.deleteMany({ where: { userId } });
      const languageEntries: UserLanguageEntry[] = [
        ...input.nativeLanguages,
        ...input.learningLanguages,
      ];
      const nativeIds = input.nativeLanguages.map((l) => l.languageId);
      for (const entry of languageEntries) {
        await tx.userLanguage.create({
          data: {
            userId,
            languageId: entry.languageId,
            type: nativeIds.includes(entry.languageId) ? 'NATIVE' : 'LEARNING',
            proficiency: entry.proficiency,
            isPrimary: nativeIds.includes(entry.languageId),
          },
        });
      }

      // 3. Language Goals
      await tx.languageGoal.deleteMany({ where: { userId } });
      for (const goal of input.goals) {
        await tx.languageGoal.create({
          data: {
            userId,
            languageId: goal.languageId,
            goalType: goal.goalType,
            targetLevel: goal.targetLevel,
            targetDate: safeIso(goal.targetDate),
            status: goal.status,
          },
        });
      }

      // 4. Match Preferences (1:1)
      await tx.matchPreference.upsert({
        where: { userId },
        create: {
          userId,
          seeking: input.matchPreference.seeking,
          partnerGenderPreference: input.matchPreference.partnerGenderPreference,
          partnerAgeMin: input.matchPreference.partnerAgeMin,
          partnerAgeMax: input.matchPreference.partnerAgeMax,
          callPreference: input.matchPreference.callPreference,
          conversationTopics: JSON.stringify(input.matchPreference.conversationTopics),
        },
        update: {
          seeking: input.matchPreference.seeking,
          partnerGenderPreference: input.matchPreference.partnerGenderPreference,
          partnerAgeMin: input.matchPreference.partnerAgeMin,
          partnerAgeMax: input.matchPreference.partnerAgeMax,
          callPreference: input.matchPreference.callPreference,
          conversationTopics: JSON.stringify(input.matchPreference.conversationTopics),
        },
      });

      // 5. User Interests
      await tx.userInterest.deleteMany({ where: { userId } });
      for (const interestId of input.interestIds) {
        await tx.userInterest.create({ data: { userId, interestId } });
      }

      // 6. Availability
      await tx.availability.deleteMany({ where: { userId } });
      for (const slot of input.availability) {
        await tx.availability.create({
          data: {
            userId,
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
            timezone: slot.timezone ?? input.profile.timezone,
          },
        });
      }

      // 7. Privacy Settings (1:1)
      await tx.privacySettings.upsert({
        where: { userId },
        create: {
          userId,
          showProfile: input.privacySettings.showProfile,
          showOnlineStatus: input.privacySettings.showOnlineStatus,
          showLastActive: input.privacySettings.showLastActive,
          showEmail: input.privacySettings.showEmail,
          showAge: input.privacySettings.showAge,
          showLocation: input.privacySettings.showLocation,
          allowDMs: input.privacySettings.allowDMs,
          allowVideoCalls: input.privacySettings.allowVideoCalls,
        },
        update: {
          showProfile: input.privacySettings.showProfile,
          showOnlineStatus: input.privacySettings.showOnlineStatus,
          showLastActive: input.privacySettings.showLastActive,
          showEmail: input.privacySettings.showEmail,
          showAge: input.privacySettings.showAge,
          showLocation: input.privacySettings.showLocation,
          allowDMs: input.privacySettings.allowDMs,
          allowVideoCalls: input.privacySettings.allowVideoCalls,
        },
      });

      // 8. Mirror into legacy user columns (backward compatibility)
      const allLanguageIds = Array.from(
        new Set(input.nativeLanguages.concat(input.learningLanguages).map((l) => l.languageId))
      );
      const allInterestIds = input.interestIds;
      const [langRows, interestRows] = await Promise.all([
        tx.language.findMany({ where: { id: { in: allLanguageIds } }, select: { id: true, name: true } }),
        tx.interest.findMany({ where: { id: { in: allInterestIds } }, select: { id: true, name: true } }),
      ]);
      const nameById = new Map(langRows.map((r) => [r.id, r.name]));
      const interestNameById = new Map(interestRows.map((r) => [r.id, r.name]));

      await tx.user.update({
        where: { id: userId },
        data: {
          name: input.profile.displayName?.trim() || undefined,
          avatarUrl: input.profile.profilePhoto?.trim() || null,
          bio: input.profile.bio ?? null,
          nativeLanguages: JSON.stringify(input.nativeLanguages.map((l) => nameById.get(l.languageId)).filter(Boolean)),
          learningLanguages: JSON.stringify(input.learningLanguages.map((l) => nameById.get(l.languageId)).filter(Boolean)),
          interests: JSON.stringify(input.interestIds.map((id) => interestNameById.get(id)).filter(Boolean)),
          timezoneOffset: timezoneToOffset(input.profile.timezone),
        },
      });
    });

    return {
      success: true,
      message: 'Your nest settings have been updated.',
      data: { userId },
    };
  } catch (error: any) {
    console.error('=== UPDATE PROFILE SETTINGS ERROR ===');
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    console.error('Meta:', error.meta);
    console.error('=====================================');
    if (error.code === 'P2002') {
      return { success: false, error: 'That username is already taken by another bird.' };
    }
    return { success: false, error: error.message || 'Failed to update profile settings.' };
  }
}
