// Next.js Server Action: Nest Overview (app/actions/nest.ts)
// Lightweight summary for the Nest dashboard — missions in dashboard shape
// plus the user's consecutive-day flight streak.

'use server';

import { prisma } from './db';
import { ActionResponse } from './types';
import { computeStreak } from './streak';

export interface NestMission {
  id: string;
  title: string;
  description: string;
  expReward: number;
  progress: number; // 0-100
  completed: boolean;
  icon: string;
}

export interface NestOverview {
  streakDays: number;
  missions: NestMission[];
}

const CATEGORY_ICONS: Record<string, string> = {
  DAILY: 'wb_sunny',
  CONVERSATION: 'forum',
  GOAL: 'flag',
};

export async function getNestOverviewAction(userId: string): Promise<ActionResponse<NestOverview>> {
  try {
    const [missions, completions] = await Promise.all([
      prisma.mission.findMany({
        where: { userId },
        orderBy: [{ status: 'asc' }, { createdAt: 'asc' }],
      }),
      prisma.mission.findMany({
        where: { userId, status: 'COMPLETED', completedAt: { not: null } },
        select: { completedAt: true },
        orderBy: { completedAt: 'desc' },
      }),
    ]);

    const data: NestOverview = {
      streakDays: computeStreak(completions.map((c) => c.completedAt!)),
      missions: missions.map((m) => ({
        id: m.id,
        title: m.title,
        description: m.description,
        expReward: m.expReward,
        progress: m.target > 0 ? Math.min(100, Math.round((m.progress / m.target) * 100)) : 0,
        completed: m.status === 'COMPLETED',
        icon: CATEGORY_ICONS[m.category] ?? 'flag',
      })),
    };

    return { success: true, message: 'Nest overview ready.', data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to load your nest overview.' };
  }
}
