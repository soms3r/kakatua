// Next.js Server Actions: Missions (app/actions/missions.ts)
// Normalized per-user missions: prebuilt catalog, profile-driven auto-generation,
// custom mission creator, progress logging, and reward claiming.

'use server';

import { prisma } from './db';
import { ActionResponse } from './types';
import { logActivity } from './activity';

export type MissionCategory = 'DAILY' | 'CONVERSATION' | 'GOAL';
export type MissionSource = 'PREBUILT' | 'AUTO' | 'CUSTOM';

export interface MissionData {
  id: string;
  title: string;
  description: string;
  category: MissionCategory;
  progress: number;
  target: number;
  status: 'PENDING' | 'COMPLETED';
  expReward: number;
  rewardClaimed: boolean;
  isPrebuilt: boolean;
  source: MissionSource;
  completedAt: string | null;
}

export interface MissionProfileContext {
  learningLanguages: string[];
  goals: string[];
}

// ─── Curated Prebuilt Catalog ────────────────────────────────────────────────
const PREBUILT_MISSIONS: Omit<MissionData, 'id' | 'progress' | 'status' | 'rewardClaimed' | 'completedAt' | 'isPrebuilt' | 'source'>[] = [
  {
    title: 'First Flight',
    description: 'Complete your first video match with a language partner.',
    category: 'DAILY',
    target: 1,
    expReward: 50,
  },
  {
    title: 'Warm-Up Sparring',
    description: 'Hold your first 5-minute conversation in your learning language.',
    category: 'CONVERSATION',
    target: 1,
    expReward: 40,
  },
  {
    title: 'Canopy Chatter',
    description: 'Exchange a message with your matched partner in the target language.',
    category: 'CONVERSATION',
    target: 1,
    expReward: 20,
  },
  {
    title: 'Nest Check-In',
    description: 'Log in and review your daily flights.',
    category: 'DAILY',
    target: 1,
    expReward: 15,
  },
  {
    title: 'Cultural Explorer',
    description: 'Read a partner culture card and learn a new tradition.',
    category: 'CONVERSATION',
    target: 1,
    expReward: 30,
  },
  {
    title: 'Flight Chain',
    description: 'Complete missions on 3 consecutive days.',
    category: 'GOAL',
    target: 3,
    expReward: 100,
  },
];

// ─── Profile-Driven Auto-Generation Templates ────────────────────────────────
const GOAL_TEMPLATES: Record<string, (lang: string) => Omit<MissionData, 'id' | 'progress' | 'status' | 'rewardClaimed' | 'completedAt' | 'isPrebuilt' | 'source'>> = {
  TRAVEL: (lang) => ({
    title: `Travel Wings in ${lang}`,
    description: `Have a 5-minute conversation about travel plans in ${lang}.`,
    category: 'CONVERSATION',
    target: 1,
    expReward: 45,
  }),
  CAREER: (lang) => ({
    title: `Career Soar in ${lang}`,
    description: `Practice ${lang} for a job interview or workplace chat for 10 minutes.`,
    category: 'GOAL',
    target: 10,
    expReward: 45,
  }),
  TEST_PREP: (lang) => ({
    title: `${lang} Study Sprint`,
    description: `Complete a focused ${lang} study session with vocabulary and drills.`,
    category: 'GOAL',
    target: 15,
    expReward: 35,
  }),
  CULTURE: (lang) => ({
    title: `Culture Quest in ${lang}`,
    description: `Ask a partner about a tradition or festival in ${lang}.`,
    category: 'CONVERSATION',
    target: 1,
    expReward: 40,
  }),
  CONVERSATION: (lang) => ({
    title: `${lang} Small Talk`,
    description: `Hold a casual conversation in ${lang} about your day.`,
    category: 'CONVERSATION',
    target: 1,
    expReward: 35,
  }),
  FLUENCY: (lang) => ({
    title: `${lang} Shadow Practice`,
    description: `Shadow-echo common ${lang} phrases aloud for 10 minutes.`,
    category: 'GOAL',
    target: 10,
    expReward: 30,
  }),
};

const DEFAULT_TEMPLATE = GOAL_TEMPLATES.FLUENCY;

function toMissionData(m: {
  id: string;
  title: string;
  description: string;
  category: string;
  progress: number;
  target: number;
  status: string;
  expReward: number;
  rewardClaimed: boolean;
  isPrebuilt: boolean;
  source: string;
  completedAt: Date | null;
}): MissionData {
  return {
    id: m.id,
    title: m.title,
    description: m.description,
    category: (m.category || 'DAILY') as MissionCategory,
    progress: m.progress,
    target: m.target,
    status: (m.status === 'COMPLETED' ? 'COMPLETED' : 'PENDING') as MissionData['status'],
    expReward: m.expReward,
    rewardClaimed: m.rewardClaimed,
    isPrebuilt: m.isPrebuilt,
    source: (m.source || 'CUSTOM') as MissionSource,
    completedAt: m.completedAt ? m.completedAt.toISOString() : null,
  };
}

interface ProfileInput {
  learningLanguages: string[];
  goals: string[];
}

async function fetchProfileContext(userId: string): Promise<ProfileInput> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profileLanguages: { include: { language: true } },
      languageGoals: true,
    },
  });

  if (!user) return { learningLanguages: [], goals: [] };

  const learningLanguages = user.profileLanguages
    .filter((l) => l.type === 'LEARNING')
    .map((l) => l.language.name)
    .filter(Boolean);

  const goals = user.languageGoals.filter((g) => g.status === 'ACTIVE').map((g) => g.goalType);

  return { learningLanguages, goals };
}

/**
 * Seeds the curated prebuilt catalog and generates profile-driven auto missions.
 * Idempotent: never duplicates an existing mission with the same source + title.
 * Shared by getMissionsAction and profile settings updates.
 */
export async function regenerateMissionsForUser(userId: string): Promise<{ created: number }> {
  const existing = await prisma.mission.findMany({
    where: { userId },
    select: { source: true, title: true },
  });
  const existingKeys = new Set(existing.map((m) => `${m.source}::${m.title}`));

  const context = await fetchProfileContext(userId);
  const candidates: { title: string; description: string; category: MissionCategory; target: number; expReward: number; isPrebuilt: boolean; source: MissionSource }[] = [];

  for (const prebuilt of PREBUILT_MISSIONS) {
    const key = `PREBUILT::${prebuilt.title}`;
    if (existingKeys.has(key)) continue;
    candidates.push({ ...prebuilt, isPrebuilt: true, source: 'PREBUILT' });
  }

  const langs = context.learningLanguages.length > 0 ? context.learningLanguages : ['your learning language'];
  const goalTypes = context.goals.length > 0 ? context.goals : ['FLUENCY'];

  // Deduplicate templates: at most one mission per (goalType, language), cap at 3.
  const seenAuto = new Set<string>();
  for (const goalType of goalTypes) {
    if (seenAuto.size >= 3) break;
    const template = GOAL_TEMPLATES[goalType] ?? DEFAULT_TEMPLATE;
    for (const lang of langs) {
      if (seenAuto.size >= 3) break;
      const built = template(lang);
      const key = `AUTO::${built.title}`;
      if (seenAuto.has(built.title) || existingKeys.has(key)) continue;
      seenAuto.add(built.title);
      candidates.push({ ...built, isPrebuilt: false, source: 'AUTO' });
    }
  }

  if (candidates.length === 0) return { created: 0 };

  await prisma.mission.createMany({
    data: candidates.map((c) => ({
      userId,
      title: c.title,
      description: c.description,
      category: c.category,
      target: c.target,
      expReward: c.expReward,
      isPrebuilt: c.isPrebuilt,
      source: c.source,
      status: 'PENDING',
    })),
  });

  return { created: candidates.length };
}

// ─── 1. Fetch Missions (auto-seeds prebuilt + auto-generated on visit) ───────
export async function getMissionsAction(
  userId: string
): Promise<ActionResponse<{ missions: MissionData[]; profile: MissionProfileContext }>> {
  try {
    await regenerateMissionsForUser(userId);

    const [missions, context] = await Promise.all([
      prisma.mission.findMany({
        where: { userId },
        orderBy: [{ status: 'asc' }, { createdAt: 'asc' }],
      }),
      fetchProfileContext(userId),
    ]);

    return {
      success: true,
      message: 'Your flight deck is loaded.',
      data: {
        missions: missions.map(toMissionData),
        profile: {
          learningLanguages: context.learningLanguages,
          goals: context.goals,
        },
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to load your missions.' };
  }
}

// ─── 2. Create Custom Mission ─────────────────────────────────────────────────
export async function createCustomMissionAction(
  userId: string,
  input: { title: string; description: string; category?: MissionCategory; target?: number; expReward?: number }
): Promise<ActionResponse<MissionData>> {
  const title = input.title?.trim();
  const description = input.description?.trim();
  if (!title || !description) {
    return { success: false, error: 'Every custom mission needs a title and a description.' };
  }

  const target = Math.min(Math.max(Math.floor(input.target ?? 1), 1), 1000);
  const expReward = Math.min(Math.max(Math.floor(input.expReward ?? 25), 0), 1000);
  const category: MissionCategory = input.category ?? 'GOAL';

  try {
    const mission = await prisma.mission.create({
      data: {
        userId,
        title,
        description,
        category,
        target,
        expReward,
        status: 'PENDING',
        isPrebuilt: false,
        source: 'CUSTOM',
      },
    });

    await logActivity(userId, 'MISSION_CREATED', `Custom flight woven: ${title}`, description, {
      category,
      target,
      expReward,
    });

    return {
      success: true,
      message: 'Your custom flight has been added to the nest.',
      data: toMissionData(mission),
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create your custom mission.' };
  }
}

// ─── 3. Log Mission Progress ──────────────────────────────────────────────────
export async function updateMissionProgressAction(
  userId: string,
  missionId: string,
  increment: number
): Promise<ActionResponse<MissionData>> {
  const step = Math.max(Math.floor(increment ?? 1), 1);

  try {
    const mission = await prisma.mission.findUnique({ where: { id: missionId } });
    if (!mission || mission.userId !== userId) {
      return { success: false, error: 'This flight is not part of your nest.' };
    }

    if (mission.status === 'COMPLETED') {
      return {
        success: true,
        message: 'This flight is already complete.',
        data: toMissionData(mission),
      };
    }

    const nextProgress = Math.min(mission.target, mission.progress + step);
    const completed = nextProgress >= mission.target;

    const updated = await prisma.mission.update({
      where: { id: missionId },
      data: {
        progress: nextProgress,
        status: completed ? 'COMPLETED' : 'PENDING',
        completedAt: completed ? new Date() : null,
      },
    });

    if (completed) {
      const minutesByCategory: Record<string, number> = { DAILY: 2, CONVERSATION: 5, GOAL: 10 };
      await logActivity(
        userId,
        'MISSION_COMPLETED',
        `Flight accomplished: ${updated.title}`,
        'You completed a mission on your flight deck.',
        {
          category: updated.category,
          expReward: updated.expReward,
          source: updated.source,
          minutes: minutesByCategory[updated.category] ?? 2,
        }
      );
    }

    return {
      success: true,
      message: completed
        ? `Flight accomplished! "${updated.title}" is complete.`
        : `Progress logged: ${nextProgress}/${updated.target} on "${updated.title}".`,
      data: toMissionData(updated),
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to log flight progress.' };
  }
}

// ─── 4. Claim Mission Reward ──────────────────────────────────────────────────
export async function claimMissionRewardAction(
  userId: string,
  missionId: string
): Promise<ActionResponse<{ mission: MissionData; expAwarded: number }>> {
  try {
    const mission = await prisma.mission.findUnique({ where: { id: missionId } });
    if (!mission || mission.userId !== userId) {
      return { success: false, error: 'This flight is not part of your nest.' };
    }

    if (mission.status !== 'COMPLETED') {
      return { success: false, error: 'The flight must be complete before claiming its reward.' };
    }

    if (mission.rewardClaimed) {
      return {
        success: true,
        message: 'This reward has already been collected.',
        data: { mission: toMissionData(mission), expAwarded: 0 },
      };
    }

    const updated = await prisma.mission.update({
      where: { id: missionId },
      data: { rewardClaimed: true },
    });

    return {
      success: true,
      message: `You collected +${updated.expReward} EXP!`,
      data: { mission: toMissionData(updated), expAwarded: updated.expReward },
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to claim your reward.' };
  }
}

// ─── 5. Delete Custom Mission ─────────────────────────────────────────────────
export async function deleteCustomMissionAction(
  userId: string,
  missionId: string
): Promise<ActionResponse<{ missionId: string }>> {
  try {
    const mission = await prisma.mission.findUnique({ where: { id: missionId } });
    if (!mission || mission.userId !== userId) {
      return { success: false, error: 'This flight is not part of your nest.' };
    }
    if (mission.source !== 'CUSTOM') {
      return { success: false, error: 'Only custom missions can be removed from the nest.' };
    }

    await prisma.mission.delete({ where: { id: missionId } });
    return { success: true, message: 'Custom flight removed from the nest.', data: { missionId } };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to remove the custom mission.' };
  }
}
