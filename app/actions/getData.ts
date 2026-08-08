'use server';

import { prisma } from './db';
import { ActionResponse } from './types';
import { getAuthSession } from '../lib/auth';
import { guardAgainstAmbassadorMutation } from './ambassadors';

interface AmbassadorData {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  nativeLanguages: string[];
  learningLanguages: string[];
  interests: string[];
  timezoneOffset: number;
  ambassadorRole: string | null;
  cultureCard: {
    traditions: string;
    food: string;
    history: string;
    funFact: string;
  } | null;
}

/**
 * Legacy ambassador loader — now delegates to getDiscoverFeed
 * which prioritizes CULTURAL_ADVISOR first.
 */
export async function getAmbassadorsAction(): Promise<ActionResponse<AmbassadorData[]>> {
  try {
    const ambassadors = await prisma.user.findMany({
      where: { isAmbassador: true },
      include: { cultureCard: true },
      orderBy: { createdAt: 'asc' },
    });

    const data: AmbassadorData[] = ambassadors.map((a) => ({
      id: a.id,
      name: a.name,
      email: a.email,
      avatarUrl: a.avatarUrl,
      nativeLanguages: JSON.parse(a.nativeLanguages),
      learningLanguages: JSON.parse(a.learningLanguages),
      interests: JSON.parse(a.interests),
      timezoneOffset: Number(a.timezoneOffset),
      ambassadorRole: a.ambassadorRole,
      cultureCard: a.cultureCard ? JSON.parse(a.cultureCard.data) : null,
    }));

    return { success: true, message: 'Ambassadors loaded.', data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to load ambassadors.' };
  }
}

interface UserProfileData {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  nativeLanguages: string[];
  learningLanguages: string[];
  interests: string[];
  timezoneOffset: number;
  status: string;
  isAmbassador: boolean;
  ambassadorRole: string | null;
  bio: string | null;
  traditions: string | null;
  favoriteFood: string | null;
  historyInterest: string | null;
  cultureCard: {
    traditions: string;
    food: string;
    history: string;
    funFact: string;
  } | null;
}

export async function getUserProfileAction(userId: string): Promise<ActionResponse<UserProfileData>> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { cultureCard: true },
    });

    if (!user) {
      return { success: false, error: 'User not found.' };
    }

    const data: UserProfileData = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      nativeLanguages: JSON.parse(user.nativeLanguages),
      learningLanguages: JSON.parse(user.learningLanguages),
      interests: JSON.parse(user.interests),
      timezoneOffset: Number(user.timezoneOffset),
      status: user.status,
      isAmbassador: user.isAmbassador,
      ambassadorRole: user.ambassadorRole,
      bio: user.bio,
      traditions: user.traditions,
      favoriteFood: user.favoriteFood,
      historyInterest: user.historyInterest,
      cultureCard: user.cultureCard ? JSON.parse(user.cultureCard.data) : null,
    };

    return { success: true, message: 'Profile loaded.', data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to load profile.' };
  }
}

interface UpdateProfileInput {
  bio?: string | null;
  traditions?: string | null;
  favoriteFood?: string | null;
  historyInterest?: string | null;
}

export async function updateUserProfileAction(
  userId: string,
  input: UpdateProfileInput
): Promise<ActionResponse<{ userId: string }>> {
  // Guard: cannot modify ambassador profiles
  try {
    await guardAgainstAmbassadorMutation(userId, 'modified');
  } catch (e: any) {
    return { success: false, error: e.message };
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        bio: input.bio ?? undefined,
        traditions: input.traditions ?? undefined,
        favoriteFood: input.favoriteFood ?? undefined,
        historyInterest: input.historyInterest ?? undefined,
      },
    });

    return { success: true, message: 'Your nest has been enriched.', data: { userId } };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update profile.' };
  }
}
