// Next.js Server Actions: Activity Log & Analytics (app/actions/activity.ts)
// Records user actions automatically and exposes a paginated timeline plus
// aggregated analytics for the signed-in user.

'use server';

import { Prisma } from '@prisma/client';
import { prisma } from './db';
import { ActionResponse } from './types';
import { computeStreak } from './streak';

export type ActivityActionType =
  | 'VIDEO_MATCH_COMPLETED'
  | 'MISSION_COMPLETED'
  | 'MISSION_CREATED'
  | 'PROFILE_UPDATED'
  | 'FEEDBACK_SUBMITTED'
  | 'REFERRAL_SIGNUP';

export interface ActivityData {
  id: string;
  actionType: ActivityActionType;
  title: string;
  description: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface ActivityAnalytics {
  totalPracticeMinutes: number;
  videoMatchesCompleted: number;
  missionsCompleted: number;
  currentStreak: number;
  totalExpEarned: number;
  activitiesThisWeek: number;
}

/**
 * Internal logger — invoked by other server actions as events occur.
 * Best-effort: never throws into the caller's flow.
 */
export async function logActivity(
  userId: string,
  actionType: ActivityActionType,
  title: string,
  description?: string | null,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    await prisma.userActivity.create({
      data: {
        userId,
        actionType,
        title,
        description: description ?? null,
        metadata: (metadata as Prisma.InputJsonValue | undefined) ?? undefined,
      },
    });
  } catch (error: any) {
    console.warn('[Kakatua] Activity: failed to log event', actionType, error?.message);
  }
}

function toActivityData(row: {
  id: string;
  actionType: string;
  title: string;
  description: string | null;
  metadata: Prisma.JsonValue | null;
  createdAt: Date;
}): ActivityData {
  return {
    id: row.id,
    actionType: row.actionType as ActivityActionType,
    title: row.title,
    description: row.description,
    metadata: (row.metadata as Record<string, unknown> | null) ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

// ─── Fetch Paginated Activity Timeline ───────────────────────────────────────
export async function getUserActivityAction(
  userId: string,
  cursor?: string,
  limit: number = 20
): Promise<ActionResponse<{ items: ActivityData[]; nextCursor: string | null }>> {
  try {
    const take = Math.min(Math.max(Math.floor(limit), 1), 50);

    const where: Prisma.UserActivityWhereInput = { userId };
    if (cursor) {
      const [cursorCreatedAt, cursorId] = cursor.split('::');
      if (cursorCreatedAt && cursorId) {
        where.OR = [
          { createdAt: { lt: new Date(cursorCreatedAt) } },
          { createdAt: new Date(cursorCreatedAt), id: { lt: cursorId } },
        ];
      }
    }

    const rows = await prisma.userActivity.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: take + 1,
    });

    const hasMore = rows.length > take;
    const items = rows.slice(0, take).map(toActivityData);
    const last = rows[Math.min(take, rows.length) - 1];

    return {
      success: true,
      message: 'Your activity log is ready.',
      data: {
        items,
        nextCursor: hasMore && last ? `${last.createdAt.toISOString()}::${last.id}` : null,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to load your activity log.' };
  }
}

// ─── Analytics Core ───────────────────────────────────────────────────────────
// Shared with the nest-insights logic layer so tips are computed from the same
// numbers the dashboard shows.
export async function fetchActivityAnalytics(userId: string): Promise<ActivityAnalytics> {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const [missionsCompleted, videoMatchesCompleted, activitiesThisWeek, expAgg, completions, activityRows] =
    await Promise.all([
      prisma.mission.count({ where: { userId, status: 'COMPLETED' } }),
      prisma.userActivity.count({ where: { userId, actionType: 'VIDEO_MATCH_COMPLETED' } }),
      prisma.userActivity.count({ where: { userId, createdAt: { gte: startOfWeek } } }),
      prisma.mission.aggregate({
        where: { userId, rewardClaimed: true },
        _sum: { expReward: true },
      }),
      prisma.mission.findMany({
        where: { userId, status: 'COMPLETED', completedAt: { not: null } },
        select: { completedAt: true },
        orderBy: { completedAt: 'desc' },
      }),
      prisma.userActivity.findMany({
        where: { userId },
        select: { metadata: true },
      }),
    ]);

  const totalPracticeMinutes = activityRows.reduce((sum, row) => {
    const minutes = (row.metadata as { minutes?: number } | null)?.minutes;
    return sum + (typeof minutes === 'number' && minutes > 0 ? minutes : 0);
  }, 0);

  return {
    totalPracticeMinutes,
    videoMatchesCompleted,
    missionsCompleted,
    currentStreak: computeStreak(completions.map((c) => c.completedAt!)),
    totalExpEarned: expAgg._sum.expReward ?? 0,
    activitiesThisWeek,
  };
}

// ─── Fetch Analytics Summary ──────────────────────────────────────────────────
export async function getUserAnalyticsAction(
  userId: string
): Promise<ActionResponse<ActivityAnalytics>> {
  try {
    const data = await fetchActivityAnalytics(userId);
    return {
      success: true,
      message: 'Analytics gathered from the nest.',
      data,
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to gather your analytics.' };
  }
}
