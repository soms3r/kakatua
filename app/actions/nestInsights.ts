'use server';

// Next.js Server Actions: Personalized Nest Insights (app/actions/nestInsights.ts)
// Gathers analytics + user context, then runs the pure rule engine in
// app/lib/nestInsights.ts and hands back warm, actionable "Nest Tips".

import { prisma } from './db';
import { ActionResponse } from './types';
import { fetchActivityAnalytics } from './activity';
import { buildNestTips, NestTip, NestTipContext } from '../lib/nestInsights';

export type { NestTip, NestTipContext } from '../lib/nestInsights';

// ─── Server action: gather context, run the rules, hand back tips ────────────
export async function getNestTipsAction(
  userId: string
): Promise<ActionResponse<NestTip[]>> {
  try {
    const [analytics, pendingMissionCount, unclaimedRewardCount, lastMatch, user] =
      await Promise.all([
        fetchActivityAnalytics(userId),
        prisma.mission.count({ where: { userId, status: 'PENDING' } }),
        prisma.mission.count({ where: { userId, status: 'COMPLETED', rewardClaimed: false } }),
        prisma.userActivity.findFirst({
          where: { userId, actionType: 'VIDEO_MATCH_COMPLETED' },
          orderBy: { createdAt: 'desc' },
          select: { createdAt: true },
        }),
        prisma.user.findUnique({
          where: { id: userId },
          select: {
            referralCode: true,
            learningLanguages: true,
            profile: { select: { bio: true } },
          },
        }),
      ]);

    let learningLanguageCount = 0;
    try {
      const legacy = JSON.parse(user?.learningLanguages ?? '[]');
      if (Array.isArray(legacy)) learningLanguageCount += legacy.length;
    } catch {
      /* legacy field was empty/invalid — fall through to normalized count */
    }
    if (learningLanguageCount === 0) {
      learningLanguageCount = await prisma.userLanguage.count({
        where: { userId, type: 'LEARNING' },
      });
    }

    const daysSinceLastMatch =
      lastMatch?.createdAt != null
        ? Math.max(0, Math.floor((Date.now() - lastMatch.createdAt.getTime()) / 86400000))
        : null;

    let referralClickCount = 0;
    if (user?.referralCode) {
      referralClickCount = await prisma.referralClick.count({
        where: { referralCode: user.referralCode },
      });
    }

    const ctx: NestTipContext = {
      pendingMissionCount,
      unclaimedRewardCount,
      daysSinceLastMatch,
      referralClickCount,
      learningLanguageCount,
      hasBio: Boolean(user?.profile?.bio?.trim()),
    };

    return {
      success: true,
      message: 'The nest has gathered its wisdom.',
      data: buildNestTips(analytics, ctx),
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to gather nest insights.' };
  }
}
