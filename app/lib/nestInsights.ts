// Personalized Nest Insights (app/lib/nestInsights.ts)
// A pure rule engine that turns raw analytics + user context into warm,
// actionable "Nest Tips". Kept framework-free so it can evolve and be tested
// without the data layer.

import { ActivityAnalytics } from '../actions/activity';

export type NestTipTone = 'moss' | 'clay' | 'bark' | 'sunrise';

export interface NestTip {
  id: string;
  priority: number; // lower = shown first
  icon: string; // material symbol
  tone: NestTipTone;
  title: string;
  message: string;
  cta?: { label: string; href: string };
}

export interface NestTipContext {
  pendingMissionCount: number;
  unclaimedRewardCount: number;
  daysSinceLastMatch: number | null;
  referralClickCount: number;
  learningLanguageCount: number;
  hasBio: boolean;
}

const MAX_TIPS = 4;

// ─── Rule engine (pure) ───────────────────────────────────────────────────────
export function buildNestTips(
  analytics: ActivityAnalytics,
  ctx: NestTipContext
): NestTip[] {
  const tips: NestTip[] = [];

  // 1. A quiet nest — no flights yet, or the winds have gone still.
  if (analytics.videoMatchesCompleted === 0) {
    tips.push({
      id: 'quiet-nest',
      priority: 1,
      icon: 'flight',
      tone: 'clay',
      title: 'Your nest is quiet',
      message:
        'Try a 5-minute flight to meet a new conversational partner and fill your canopy with voices.',
      cta: { label: 'Take Flight', href: '/' },
    });
  } else if (ctx.daysSinceLastMatch !== null && ctx.daysSinceLastMatch > 7) {
    tips.push({
      id: 'still-winds',
      priority: 1,
      icon: 'flight',
      tone: 'clay',
      title: 'The winds have gone still',
      message: `It has been ${ctx.daysSinceLastMatch} days since your last flight — one 5-minute match can rekindle the momentum.`,
      cta: { label: 'Take Flight', href: '/' },
    });
  }

  // 2. Missions waiting — keep the streak alive.
  if (ctx.pendingMissionCount > 0 && analytics.missionsCompleted === 0) {
    tips.push({
      id: 'new-branches',
      priority: 2,
      icon: 'rocket_launch',
      tone: 'moss',
      title: 'New branches to explore',
      message:
        'New branches are waiting to be explored! Check your daily mission to keep your learning streak alive.',
      cta: { label: 'Open Missions', href: '/missions' },
    });
  } else if (ctx.pendingMissionCount > 0) {
    tips.push({
      id: 'branches-await',
      priority: 3,
      icon: 'rocket_launch',
      tone: 'moss',
      title: `${ctx.pendingMissionCount} quest${ctx.pendingMissionCount === 1 ? '' : 's'} on your deck`,
      message:
        'Every completed quest banks EXP and strengthens your flight chain. A few focused minutes a day goes far.',
      cta: { label: 'Open Missions', href: '/missions' },
    });
  }

  // 3. Unclaimed gold — completed quests whose rewards are still on the branch.
  if (analytics.missionsCompleted > 0 && ctx.unclaimedRewardCount > 0) {
    tips.push({
      id: 'gold-dust',
      priority: 4,
      icon: 'redeem',
      tone: 'sunrise',
      title: 'Gold dust in the nest',
      message: `You have ${ctx.unclaimedRewardCount} completed quest${ctx.unclaimedRewardCount === 1 ? '' : 's'} waiting to be claimed for EXP.`,
      cta: { label: 'Collect Rewards', href: '/missions' },
    });
  }

  // 4. The flight chain — praise a strong streak, fan a fresh flame.
  if (analytics.currentStreak >= 3) {
    tips.push({
      id: 'flight-chain',
      priority: 5,
      icon: 'local_fire_department',
      tone: 'clay',
      title: 'Your flight chain is strong',
      message: `${analytics.currentStreak} days and soaring — keep the winds steady and the streak alive today.`,
    });
  } else if (analytics.currentStreak === 1) {
    tips.push({
      id: 'fresh-flame',
      priority: 6,
      icon: 'local_fire_department',
      tone: 'sunrise',
      title: 'A fresh flame is lit',
      message: 'One day is a fragile flame. Visit your nest today to stretch it into a chain.',
    });
  }

  // 5. A bare nest — the flock cannot find you yet.
  if (ctx.learningLanguageCount === 0) {
    tips.push({
      id: 'bare-nest',
      priority: 7,
      icon: 'edit_note',
      tone: 'bark',
      title: 'Your nest looks bare',
      message:
        'Add your learning languages and goals so the flock can find you — and missions can find you too.',
      cta: { label: 'Nest Settings', href: '/profile/settings' },
    });
  } else if (!ctx.hasBio) {
    tips.push({
      id: 'story-missing',
      priority: 8,
      icon: 'edit_note',
      tone: 'bark',
      title: 'Your story is missing',
      message: 'A short bio helps a partner know who you are before the first hello.',
      cta: { label: 'Polish Profile', href: '/profile' },
    });
  }

  // 6. Grow the canopy — the referral link has not been shared yet.
  if (ctx.referralClickCount === 0) {
    tips.push({
      id: 'grow-flock',
      priority: 9,
      icon: 'group_add',
      tone: 'moss',
      title: 'The canopy grows through you',
      message:
        'Share your referral link and welcome new birds to the nest — the flock remembers its kind.',
      cta: { label: 'Refer a Friend', href: '/profile' },
    });
  }

  // 7. Weekly momentum — riding the warm currents.
  if (analytics.activitiesThisWeek >= 5) {
    tips.push({
      id: 'momentum',
      priority: 10,
      icon: 'auto_awesome',
      tone: 'sunrise',
      title: 'The currents are yours',
      message: `${analytics.activitiesThisWeek} actions this week — ride the warm wind while it lasts.`,
    });
  }

  return tips.sort((a, b) => a.priority - b.priority).slice(0, MAX_TIPS);
}
