'use server';

// Next.js Server Action: Profile Settings (app/actions/profileSettings.ts)
// Reads/writes the normalized profile architecture (profiles, user_languages,
// language_goals, match_preferences, user_interests, availability, privacy_settings).

import { prisma } from './db';
import {
  ActionResponse,
  AvailabilityEntry,
  LanguageGoalEntry,
  ProfileSettingsPayload,
  ProfileSettingsProfile,
  ProfileSettingsSnapshot,
  UserLanguageEntry,
} from './types';
import { guardAgainstAmbassadorMutation } from './ambassadors';
import { regenerateMissionsForUser, trackUserAction } from './missions';
import { logActivity } from './activity';

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

function safeIso(date: string | null | undefined): Date | null {
  if (!date) return null;
  const d = new Date(date);
  return Number.isNaN(d.getTime()) ? null : d;
}

function normalizeString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function normalizeLanguageEntries(
  entries: UserLanguageEntry[] | null | undefined
): UserLanguageEntry[] {
  const seen = new Set<string>();
  const result: UserLanguageEntry[] = [];
  for (const entry of entries ?? []) {
    const languageId = entry?.languageId?.trim();
    if (!languageId || seen.has(languageId)) continue;
    seen.add(languageId);
    result.push({ languageId, proficiency: entry.proficiency || null });
  }
  return result;
}

function normalizeGoals(goals: LanguageGoalEntry[] | null | undefined): LanguageGoalEntry[] {
  const result: LanguageGoalEntry[] = [];
  for (const goal of goals ?? []) {
    if (!goal || typeof goal.goalType !== 'string' || !goal.goalType.trim()) continue;
    result.push({
      goalType: goal.goalType,
      languageId: goal.languageId || null,
      targetLevel: goal.targetLevel || null,
      targetDate: goal.targetDate || null,
      status: goal.status || 'ACTIVE',
    });
  }
  return result;
}

function normalizeAvailability(
  slots: AvailabilityEntry[] | null | undefined
): AvailabilityEntry[] {
  const result: AvailabilityEntry[] = [];
  for (const slot of slots ?? []) {
    if (
      !slot ||
      typeof slot.dayOfWeek !== 'number' ||
      !slot.startTime ||
      !slot.endTime
    ) {
      continue;
    }
    result.push({
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
      timezone: slot.timezone || null,
    });
  }
  return result;
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
  if (!userId) {
    return { success: false, error: 'You must be signed in to update your settings.' };
  }

  try {
    await guardAgainstAmbassadorMutation(userId, 'modified');
  } catch (e: any) {
    return { success: false, error: e?.message || 'This account cannot be modified.' };
  }

  const rawProfile: Partial<ProfileSettingsProfile> = input?.profile ?? {};
  const username = normalizeString(rawProfile.username);
  const displayName = normalizeString(rawProfile.displayName);
  const nativeLanguages = normalizeLanguageEntries(input?.nativeLanguages);
  const learningLanguages = normalizeLanguageEntries(input?.learningLanguages);

  const errors: string[] = [];
  if (!username) errors.push('Username is required.');
  if (!displayName) errors.push('Display name is required.');
  if (nativeLanguages.length === 0) errors.push('Select at least one native language.');
  if (learningLanguages.length === 0) errors.push('Select at least one learning language.');
  if (errors.length > 0) {
    return { success: false, error: errors.join(' ') };
  }

  const nativeSet = new Set(nativeLanguages.map((l) => l.languageId));
  const learning = learningLanguages.filter((l) => !nativeSet.has(l.languageId));
  const goals = normalizeGoals(input?.goals);
  const interestIds = Array.from(
    new Set((input?.interestIds ?? []).filter((id) => typeof id === 'string' && id.trim()))
  );
  const availability = normalizeAvailability(input?.availability);
  const matchPreference = input?.matchPreference ?? {};
  const privacySettings = input?.privacySettings ?? {};
  const conversationTopics = Array.isArray(matchPreference.conversationTopics)
    ? matchPreference.conversationTopics.map(String).map((t) => t.trim()).filter(Boolean)
    : [];

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Profile (1:1)
      await tx.profile.upsert({
        where: { userId },
        create: {
          userId,
          username,
          displayName,
          profilePhoto: normalizeString(rawProfile.profilePhoto),
          bio: normalizeString(rawProfile.bio),
          dateOfBirth: safeIso(rawProfile.dateOfBirth),
          gender: normalizeString(rawProfile.gender),
          country: normalizeString(rawProfile.country),
          city: normalizeString(rawProfile.city),
          timezone: normalizeString(rawProfile.timezone),
          nativeLanguage: normalizeString(rawProfile.nativeLanguage),
          interfaceLanguage: normalizeString(rawProfile.interfaceLanguage),
        },
        update: {
          username,
          displayName,
          profilePhoto: normalizeString(rawProfile.profilePhoto),
          bio: normalizeString(rawProfile.bio),
          dateOfBirth: safeIso(rawProfile.dateOfBirth),
          gender: normalizeString(rawProfile.gender),
          country: normalizeString(rawProfile.country),
          city: normalizeString(rawProfile.city),
          timezone: normalizeString(rawProfile.timezone),
          nativeLanguage: normalizeString(rawProfile.nativeLanguage),
          interfaceLanguage: normalizeString(rawProfile.interfaceLanguage),
        },
      });

      // 2. User Languages (native + learning)
      await tx.userLanguage.deleteMany({ where: { userId } });
      const languageEntries: UserLanguageEntry[] = [...nativeLanguages, ...learning];
      for (const entry of languageEntries) {
        await tx.userLanguage.create({
          data: {
            userId,
            languageId: entry.languageId,
            type: nativeSet.has(entry.languageId) ? 'NATIVE' : 'LEARNING',
            proficiency: entry.proficiency,
            isPrimary: nativeSet.has(entry.languageId),
          },
        });
      }

      // 3. Language Goals
      await tx.languageGoal.deleteMany({ where: { userId } });
      for (const goal of goals) {
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
          seeking: matchPreference.seeking || null,
          partnerGenderPreference: matchPreference.partnerGenderPreference || null,
          partnerAgeMin: typeof matchPreference.partnerAgeMin === 'number' ? matchPreference.partnerAgeMin : null,
          partnerAgeMax: typeof matchPreference.partnerAgeMax === 'number' ? matchPreference.partnerAgeMax : null,
          callPreference: matchPreference.callPreference || null,
          conversationTopics: JSON.stringify(conversationTopics),
        },
        update: {
          seeking: matchPreference.seeking || null,
          partnerGenderPreference: matchPreference.partnerGenderPreference || null,
          partnerAgeMin: typeof matchPreference.partnerAgeMin === 'number' ? matchPreference.partnerAgeMin : null,
          partnerAgeMax: typeof matchPreference.partnerAgeMax === 'number' ? matchPreference.partnerAgeMax : null,
          callPreference: matchPreference.callPreference || null,
          conversationTopics: JSON.stringify(conversationTopics),
        },
      });

      // 5. User Interests
      await tx.userInterest.deleteMany({ where: { userId } });
      for (const interestId of interestIds) {
        await tx.userInterest.create({ data: { userId, interestId } });
      }

      // 6. Availability
      await tx.availability.deleteMany({ where: { userId } });
      for (const slot of availability) {
        await tx.availability.create({
          data: {
            userId,
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
            timezone: slot.timezone ?? normalizeString(rawProfile.timezone),
          },
        });
      }

      // 7. Privacy Settings (1:1)
      const privacy = {
        showProfile: privacySettings.showProfile ?? true,
        showOnlineStatus: privacySettings.showOnlineStatus ?? true,
        showLastActive: privacySettings.showLastActive ?? true,
        showEmail: privacySettings.showEmail ?? false,
        showAge: privacySettings.showAge ?? true,
        showLocation: privacySettings.showLocation ?? true,
        allowDMs: privacySettings.allowDMs ?? true,
        allowVideoCalls: privacySettings.allowVideoCalls ?? true,
      };
      await tx.privacySettings.upsert({
        where: { userId },
        create: { userId, ...privacy },
        update: privacy,
      });

      // 8. Mirror into legacy user columns (backward compatibility)
      const allLanguageIds = Array.from(
        new Set(nativeLanguages.concat(learning).map((l) => l.languageId))
      );
      const [langRows, interestRows] = await Promise.all([
        tx.language.findMany({ where: { id: { in: allLanguageIds } }, select: { id: true, name: true } }),
        tx.interest.findMany({ where: { id: { in: interestIds } }, select: { id: true, name: true } }),
      ]);
      const nameById = new Map(langRows.map((r) => [r.id, r.name]));
      const interestNameById = new Map(interestRows.map((r) => [r.id, r.name]));

      await tx.user.update({
        where: { id: userId },
        data: {
          name: displayName || undefined,
          avatarUrl: normalizeString(rawProfile.profilePhoto),
          bio: normalizeString(rawProfile.bio),
          nativeLanguages: JSON.stringify(nativeLanguages.map((l) => nameById.get(l.languageId)).filter(Boolean)),
          learningLanguages: JSON.stringify(learning.map((l) => nameById.get(l.languageId)).filter(Boolean)),
          interests: JSON.stringify(interestIds.map((id) => interestNameById.get(id)).filter(Boolean)),
          timezoneOffset: timezoneToOffset(normalizeString(rawProfile.timezone)),
        },
      });
    });

    // Regenerate profile-driven missions based on the updated learning goals
    try {
      await regenerateMissionsForUser(userId);
    } catch (e: any) {
      console.warn('[Kakatua] Missions: auto-generation after profile update skipped:', e?.message);
    }

    await logActivity(userId, 'PROFILE_UPDATED', 'Nest settings refreshed', 'Profile, languages, goals, and preferences updated.');
    await trackUserAction(userId, 'PROFILE_UPDATED', { label: 'Nest settings refreshed' });

    return {
      success: true,
      message: 'Your nest settings have been updated.',
      data: { userId },
    };
  } catch (error: any) {
    console.error('=== UPDATE PROFILE SETTINGS ERROR ===');
    console.error('Message:', error?.message);
    console.error('Code:', error?.code);
    console.error('Meta:', error?.meta);
    console.error('=====================================');
    if (error?.code === 'P2002') {
      return { success: false, error: 'That username is already taken by another bird.' };
    }
    if (error?.code === 'P2003') {
      return { success: false, error: 'One of the selected languages or interests is no longer available. Please refresh and try again.' };
    }
    return { success: false, error: 'We could not save your settings right now. Please try again.' };
  }
}
