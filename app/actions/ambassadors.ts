// Ambassador Service Layer (app/actions/ambassadors.ts)
// Immutable system bot logic + Country Culture Library queries.

'use server';

import { prisma } from './db';
import { ActionResponse } from './types';

// ─── Constants ────────────────────────────────────────────────────────────────

export const AMBASSADOR_ROLES = {
  GUIDE: 'GUIDE',
  MATCHMAKER: 'MATCHMAKER',
  CULTURAL_ADVISOR: 'CULTURAL_ADVISOR',
} as const;

export type AmbassadorRole = typeof AMBASSADOR_ROLES[keyof typeof AMBASSADOR_ROLES];

const AMBASSADOR_EMAILS: Record<AmbassadorRole, string> = {
  GUIDE: 'guide@kakatua.app',
  MATCHMAKER: 'buddy@kakatua.app',
  CULTURAL_ADVISOR: 'dhaka@kakatua.app',
};

// ─── Detailed Content Types ──────────────────────────────────────────────────

export interface DetailedContent {
  languageInfo: { primaryLanguage: string; majorDialects: string[]; keyPhrases: string[] };
  culturalRituals: { festivalName: string; description: string }[];
  culinaryNarrative: { dishName: string; historicalOrigin: string; culturalSignificance: string }[];
  historicalContext: string;
  socialEtiquette: string[];
}

// ─── Role Queries ─────────────────────────────────────────────────────────────

export async function getAmbassadorByRole(
  role: AmbassadorRole
): Promise<ActionResponse<{ id: string; name: string; email: string } | null>> {
  try {
    const user = await prisma.user.findFirst({
      where: { ambassadorRole: role, isAmbassador: true },
      select: { id: true, name: true, email: true },
    });
    return { success: true, message: 'Ambassador lookup complete.', data: user };
  } catch (error: any) {
    return { success: false, error: error.message || 'Ambassador lookup failed.' };
  }
}

export async function getGuide() { return getAmbassadorByRole('GUIDE'); }
export async function getMatchmaker() { return getAmbassadorByRole('MATCHMAKER'); }
export async function getCulturalAdvisor() { return getAmbassadorByRole('CULTURAL_ADVISOR'); }

// ─── Discover Feed ────────────────────────────────────────────────────────────

export interface DiscoverAmbassador {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  nativeLanguages: string[];
  learningLanguages: string[];
  interests: string[];
  timezoneOffset: number;
  ambassadorRole: string | null;
  countrySlug: string | null;
  cultureCardId: string | null;
  loveCount: number;
  isUserCreated: boolean;
  cultureCard: {
    traditions: string;
    food: string;
    history: string;
    funFact: string;
  } | null;
}

export async function getDiscoverFeed(): Promise<ActionResponse<DiscoverAmbassador[]>> {
  try {
    const culturalAdvisor = await prisma.user.findFirst({
      where: { ambassadorRole: 'CULTURAL_ADVISOR', isAmbassador: true, countrySlug: 'bangladesh' },
      include: { cultureCard: true },
    });

    const others = await prisma.user.findMany({
      where: {
        isAmbassador: true,
        countrySlug: { not: null },
        NOT: { countrySlug: 'bangladesh' },
      },
      include: { cultureCard: true },
      orderBy: { createdAt: 'asc' },
    });

    // Include system bots (GUIDE, MATCHMAKER) without countrySlug
    const systemBots = await prisma.user.findMany({
      where: {
        isAmbassador: true,
        countrySlug: null,
      },
      include: { cultureCard: true },
      orderBy: { createdAt: 'asc' },
    });

    // Include non-ambassador users who have created a culture card
    const userCards = await prisma.user.findMany({
      where: {
        isAmbassador: false,
        cultureCard: { isNot: null },
      },
      include: { cultureCard: true },
      orderBy: { createdAt: 'desc' },
    });

    const all = [
      ...(culturalAdvisor ? [culturalAdvisor] : []),
      ...others,
      ...systemBots,
    ];

    const ambassadors: DiscoverAmbassador[] = all.map((a) => ({
      id: a.id,
      name: a.name,
      email: a.email,
      avatarUrl: a.avatarUrl,
      nativeLanguages: JSON.parse(a.nativeLanguages),
      learningLanguages: JSON.parse(a.learningLanguages),
      interests: JSON.parse(a.interests),
      timezoneOffset: Number(a.timezoneOffset),
      ambassadorRole: a.ambassadorRole,
      countrySlug: a.countrySlug,
      cultureCardId: a.cultureCard?.id ?? null,
      loveCount: a.cultureCard?.loveCount ?? 0,
      isUserCreated: false,
      cultureCard: a.cultureCard ? JSON.parse(a.cultureCard.data) : null,
    }));

    const users: DiscoverAmbassador[] = userCards.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      avatarUrl: u.avatarUrl,
      nativeLanguages: JSON.parse(u.nativeLanguages),
      learningLanguages: JSON.parse(u.learningLanguages),
      interests: JSON.parse(u.interests),
      timezoneOffset: Number(u.timezoneOffset),
      ambassadorRole: null,
      countrySlug: null,
      cultureCardId: u.cultureCard?.id ?? null,
      loveCount: u.cultureCard?.loveCount ?? 0,
      isUserCreated: true,
      cultureCard: u.cultureCard ? JSON.parse(u.cultureCard.data) : null,
    }));

    const data = [...ambassadors, ...users];

    return { success: true, message: 'Discover feed loaded.', data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to load Discover feed.' };
  }
}

// ─── Country Detail Page Query ────────────────────────────────────────────────

export interface CountryDetailData {
  id: string;
  name: string;
  countrySlug: string;
  nativeLanguages: string[];
  learningLanguages: string[];
  interests: string[];
  timezoneOffset: number;
  cultureCardId: string | null;
  loveCount: number;
  cultureCard: {
    traditions: string;
    food: string;
    history: string;
    funFact: string;
  } | null;
  detailedContent: DetailedContent | null;
}

export async function getCountryBySlug(
  slug: string
): Promise<ActionResponse<CountryDetailData | null>> {
  try {
    const user = await prisma.user.findFirst({
      where: { countrySlug: slug, isAmbassador: true },
      include: { cultureCard: true },
    });

    if (!user || !user.cultureCard) {
      return { success: true, message: 'Country not found.', data: null };
    }

    const data: CountryDetailData = {
      id: user.id,
      name: user.name,
      countrySlug: user.countrySlug!,
      nativeLanguages: JSON.parse(user.nativeLanguages),
      learningLanguages: JSON.parse(user.learningLanguages),
      interests: JSON.parse(user.interests),
      timezoneOffset: Number(user.timezoneOffset),
      cultureCardId: user.cultureCard?.id ?? null,
      loveCount: user.cultureCard?.loveCount ?? 0,
      cultureCard: JSON.parse(user.cultureCard.data),
      detailedContent: user.cultureCard.detailedContent
        ? JSON.parse(user.cultureCard.detailedContent)
        : null,
    };

    return { success: true, message: 'Country loaded.', data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to load country.' };
  }
}

// ─── Immutability Guards ──────────────────────────────────────────────────────

export async function isProtectedAmbassador(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isAmbassador: true, ambassadorRole: true },
  });
  return !!(user?.isAmbassador && user?.ambassadorRole);
}

export async function guardAgainstAmbassadorMutation(
  targetUserId: string,
  action: string
): Promise<void> {
  const isProtected = await isProtectedAmbassador(targetUserId);
  if (isProtected) {
    throw new Error(
      `This bird is a guardian of the flock and cannot be ${action}.`
    );
  }
}
