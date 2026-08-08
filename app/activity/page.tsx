'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import LayoutShell from '../components/LayoutShell';
import {
  TwigCard,
  ReedFrame,
  TwigDivider,
  DryLeafIcon,
  DryBranchIcon,
  GrassTuftIcon,
  GrassBar,
} from '../components/nestUI';
import { getDailyWisdom } from '../lib/nestWisdom';
import {
  getUserActivityAction,
  getUserAnalyticsAction,
  type ActivityAnalytics,
  type ActivityData,
} from '../actions/activity';
import { getNestTipsAction, type NestTip } from '../actions/nestInsights';

const ACTION_META: Record<string, { label: string; icon: string; tone: string }> = {
  VIDEO_MATCH_COMPLETED: { label: 'Video Match', icon: 'videocam', tone: 'text-[#2d5a27] bg-[#bcf0ae]/40' },
  MISSION_COMPLETED: { label: 'Mission Complete', icon: 'check_circle', tone: 'text-[#7b5800] bg-[#ffe8bd]' },
  MISSION_CREATED: { label: 'Custom Quest', icon: 'add_task', tone: 'text-[#8a6d3b] bg-[#f3ead6]' },
  PROFILE_UPDATED: { label: 'Profile', icon: 'person', tone: 'text-[#42493e] bg-[#e8e4dc]' },
  FEEDBACK_SUBMITTED: { label: 'Feedback', icon: 'forum', tone: 'text-[#7b5800] bg-[#ffe8bd]' },
  REFERRAL_SIGNUP: { label: 'New Flock Member', icon: 'group_add', tone: 'text-[#2d5a27] bg-[#d7ecc6]' },
};

const TIP_TONE: Record<string, string> = {
  moss: 'text-[#5f7d45]',
  clay: 'text-[#c2703d]',
  bark: 'text-[#8a6d3b]',
  sunrise: 'text-[#b98a3e]',
};

const STAT_STONES: Record<string, string> = {
  clay: 'radial-gradient(circle at 30% 25%, #eecfa0, #c9935f 62%, #a76f3e)',
  moss: 'radial-gradient(circle at 30% 25%, #cbe5b4, #8fae72 62%, #5f7d45)',
  sunrise: 'radial-gradient(circle at 30% 25%, #f2d68f, #d9b25c 62%, #b98a3e)',
  bark: 'radial-gradient(circle at 30% 25%, #f2e3bd, #dcc193 62%, #b99761)',
};

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatMinutes(total: number): string {
  if (total >= 60) {
    const h = Math.floor(total / 60);
    const m = total % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  return `${total}m`;
}

function ActivityCard({ activity }: { activity: ActivityData }) {
  const meta = ACTION_META[activity.actionType] ?? { label: activity.actionType, icon: 'timeline', tone: 'text-[#42493e] bg-[#e8e4dc]' };
  const md = activity.metadata ?? {};

  const chips: string[] = [];
  if (activity.actionType === 'VIDEO_MATCH_COMPLETED' && typeof md.minutes === 'number') {
    chips.push(`+${md.minutes} min`);
  }
  if (typeof md.compatibilityScore === 'number') {
    chips.push(`harmony ${md.compatibilityScore}`);
  }
  if (activity.actionType === 'MISSION_COMPLETED' && typeof md.expReward === 'number') {
    chips.push(`+${md.expReward} EXP`);
  }
  if (typeof md.category === 'string' && activity.actionType === 'MISSION_COMPLETED') {
    chips.push(md.category.toLowerCase());
  }
  if (activity.actionType === 'FEEDBACK_SUBMITTED' && typeof md.category === 'string') {
    chips.push(md.category);
  }

  return (
    <div className="relative flex items-start gap-3">
      {/* Leaf / feather marker */}
      <div className="relative flex-shrink-0 z-10">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center border border-[#e0d2b3] shadow-[0_4px_12px_rgba(138,109,59,0.15)] ${meta.tone}`}>
          <span className="material-symbols-outlined text-lg">{meta.icon}</span>
        </div>
      </div>

      {/* Twig-bordered card */}
      <div className="flex-1 min-w-0 bg-[#fffdf8] border border-[#e0d2b3] rounded-2xl shadow-[0_4px_16px_rgba(138,109,59,0.08)] px-4 py-3 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#b98a3e]/40 to-transparent" />
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-[#1b1c1a] truncate">{activity.title}</h4>
            {activity.description && (
              <p className="text-[10px] text-[#72796e] mt-1 leading-relaxed">{activity.description}</p>
            )}
          </div>
          <span className="text-[9px] text-[#b5aa93] flex-shrink-0 pt-0.5 font-medium">
            {formatRelative(activity.createdAt)}
          </span>
        </div>

        <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${meta.tone}`}>{meta.label}</span>
          {chips.map((chip) => (
            <span key={chip} className="text-[9px] font-semibold text-[#8a6d3b] bg-[#f3ead6] px-2 py-0.5 rounded-full">
              {chip}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ActivityPage() {
  const { data: session } = useSession();
  const [analytics, setAnalytics] = useState<ActivityAnalytics | null>(null);
  const [tips, setTips] = useState<NestTip[]>([]);
  const [items, setItems] = useState<ActivityData[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [wisdom] = useState(() => getDailyWisdom());

  useEffect(() => {
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    async function load() {
      try {
        const [statsResult, logResult, tipsResult] = await Promise.all([
          getUserAnalyticsAction(session!.user.id),
          getUserActivityAction(session!.user.id),
          getNestTipsAction(session!.user.id),
        ]);
        if (cancelled) return;
        if (statsResult.success) setAnalytics(statsResult.data);
        if (logResult.success) {
          setItems(logResult.data.items);
          setNextCursor(logResult.data.nextCursor);
        }
        if (tipsResult.success) setTips(tipsResult.data);
      } catch (err: any) {
        if (cancelled) return;
        setError(err?.message || 'Failed to load your activity.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  const handleLoadMore = async () => {
    if (!session?.user?.id || !nextCursor) return;
    setLoadingMore(true);
    const result = await getUserActivityAction(session.user.id, nextCursor);
    setLoadingMore(false);
    if (result.success) {
      setItems((prev) => [...prev, ...result.data.items]);
      setNextCursor(result.data.nextCursor);
    }
  };

  const statCards: { label: string; value: string; icon: string; stone: string }[] = [
    {
      label: 'Practice Time',
      value: formatMinutes(analytics?.totalPracticeMinutes ?? 0),
      icon: 'timer',
      stone: STAT_STONES.clay,
    },
    {
      label: 'Video Matches',
      value: String(analytics?.videoMatchesCompleted ?? 0),
      icon: 'videocam',
      stone: STAT_STONES.moss,
    },
    {
      label: 'Missions Done',
      value: String(analytics?.missionsCompleted ?? 0),
      icon: 'task_alt',
      stone: STAT_STONES.moss,
    },
    {
      label: 'Flight Streak',
      value: `${analytics?.currentStreak ?? 0}d`,
      icon: 'local_fire_department',
      stone: STAT_STONES.sunrise,
    },
    {
      label: 'EXP Earned',
      value: String(analytics?.totalExpEarned ?? 0),
      icon: 'eco',
      stone: STAT_STONES.bark,
    },
    {
      label: 'This Week',
      value: String(analytics?.activitiesThisWeek ?? 0),
      icon: 'auto_awesome',
      stone: STAT_STONES.sunrise,
    },
  ];

  const grassBars: { label: string; goal: string; value: number; max: number; tone: 'moss' | 'clay' | 'sunrise' }[] = [
    {
      label: 'Weekly practice',
      goal: '60m goal',
      value: analytics?.totalPracticeMinutes ?? 0,
      max: 60,
      tone: 'moss',
    },
    {
      label: 'Video matches',
      goal: '10 matches',
      value: analytics?.videoMatchesCompleted ?? 0,
      max: 10,
      tone: 'clay',
    },
    {
      label: 'Missions completed',
      goal: '10 quests',
      value: analytics?.missionsCompleted ?? 0,
      max: 10,
      tone: 'sunrise',
    },
    {
      label: 'Flight streak',
      goal: '7 days',
      value: analytics?.currentStreak ?? 0,
      max: 7,
      tone: 'moss',
    },
  ];

  return (
    <LayoutShell activeTab="activity">
      <div className="flex flex-col gap-5 pb-4">
        {/* Header */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#2D5A27] text-2xl">timeline</span>
            <div>
              <h1 className="text-lg font-bold text-[#154212] tracking-tight leading-none">Activity</h1>
              <p className="text-[10px] text-[#72796e] mt-1">Your flight records — every milestone leaves a feather.</p>
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-10 h-10 border-3 border-[#a1d494] border-t-[#2D5A27] rounded-full animate-spin mb-4" />
            <p className="text-xs text-[#72796e]">Sifting through the nest records...</p>
          </div>
        )}

        {!loading && error && (
          <div className="bg-[#ffdad6] border border-[#ba1a1a]/20 rounded-xl px-4 py-3 text-[11px] text-[#ba1a1a] text-center">
            <span className="material-symbols-outlined text-sm align-middle mr-1">error</span>
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Daily Wisdom — parchment scroll */}
            <TwigCard>
              <div className="flex items-start gap-3">
                <DryLeafIcon className="w-7 h-7 text-[#a8832f] flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#a8832f]">Daily Wisdom</p>
                  <p className="mt-1.5 text-[13px] italic text-[#3f3527] leading-relaxed">&ldquo;{wisdom.text}&rdquo;</p>
                  <p className="mt-2 text-[10px] font-semibold text-[#8a6d3b]">
                    — {wisdom.author} <span className="font-normal text-[#b5aa93]">· {wisdom.attribution}</span>
                  </p>
                </div>
              </div>
            </TwigCard>

            {/* Nest Dashboard — pebble stats + grass progress */}
            <section className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2">
                <GrassTuftIcon className="w-4 h-4 text-[#b98a3e]" />
                <h3 className="font-semibold text-sm text-[#1b1c1a] tracking-tight">Nest Dashboard</h3>
              </div>
              <TwigCard>
                <div className="grid grid-cols-3 gap-2">
                  {statCards.map((card) => (
                    <div
                      key={card.label}
                      className="rounded-[16px] px-2.5 py-3 text-center border border-white/25"
                      style={{
                        background: card.stone,
                        boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,0.55), 0 4px 10px rgba(40,26,12,0.22)',
                      }}
                    >
                      <span className="material-symbols-outlined text-lg text-white/95">{card.icon}</span>
                      <div className="text-lg font-bold text-white leading-none mt-1.5 drop-shadow-sm">{card.value}</div>
                      <div className="text-[8px] text-white/90 mt-1 font-semibold tracking-wide uppercase">{card.label}</div>
                    </div>
                  ))}
                </div>

                <TwigDivider className="my-3.5" />

                <div className="flex flex-col gap-3">
                  {grassBars.map((bar) => (
                    <div key={bar.label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-semibold text-[#5d4a2c]">{bar.label}</span>
                        <span className="text-[9px] text-[#a88755] font-medium">
                          {bar.value} / {bar.max} <span className="text-[#c4b189]">· {bar.goal}</span>
                        </span>
                      </div>
                      <GrassBar value={bar.value} max={bar.max} tone={bar.tone} />
                    </div>
                  ))}
                </div>
              </TwigCard>
            </section>

            {/* Personalized Nest Tips — dry-branch cards */}
            <section className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2">
                <DryBranchIcon className="w-5 h-5 text-[#8a6d3b]" />
                <h3 className="font-semibold text-sm text-[#1b1c1a] tracking-tight">Personalized Nest Tips</h3>
              </div>

              {tips.length === 0 ? (
                <ReedFrame>
                  <p className="text-[11px] text-[#72796e] text-center py-1">
                    All is well in the nest — no tips to rustle today.
                  </p>
                </ReedFrame>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {tips.map((tip) => (
                    <ReedFrame key={tip.id}>
                      <div className="flex items-start gap-3">
                        <span className={`material-symbols-outlined text-lg flex-shrink-0 ${TIP_TONE[tip.tone] ?? 'text-[#b98a3e]'}`}>
                          {tip.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-[#2b2620]">{tip.title}</h4>
                          <p className="text-[10.5px] text-[#6d6455] mt-1 leading-relaxed">{tip.message}</p>
                          {tip.cta && (
                            <Link
                              href={tip.cta.href}
                              className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold text-[#2D5A27] hover:text-[#154212] transition-colors"
                            >
                              <span className="material-symbols-outlined text-[12px]">arrow_right_alt</span>
                              {tip.cta.label}
                            </Link>
                          )}
                        </div>
                      </div>
                    </ReedFrame>
                  ))}
                </div>
              )}
            </section>

            {/* Flight Timeline */}
            <section className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#2d5a27] text-lg">flutter_dash</span>
                <h3 className="font-semibold text-sm text-[#1b1c1a] tracking-tight">Flight Timeline</h3>
                <span className="text-[9px] bg-[#f3ead6] text-[#8a6d3b] px-2 py-0.5 rounded-full font-medium">
                  {items.length} record{items.length === 1 ? '' : 's'}
                </span>
              </div>

              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center bg-[#fffdf8] border border-[#e0d2b3] rounded-2xl">
                  <span className="material-symbols-outlined text-5xl text-[#c2c9bb] mb-3">feather</span>
                  <h4 className="text-sm font-bold text-[#42493e]">The timeline is quiet</h4>
                  <p className="text-[11px] text-[#72796e] max-w-[70%] leading-relaxed mt-1.5">
                    Your milestones will land here as you fly, match, and complete quests.
                  </p>
                  <Link
                    href="/missions"
                    className="mt-4 bg-[#2D5A27] hover:bg-[#154212] active:scale-95 transition-all text-white font-semibold text-xs py-2.5 px-5 rounded-full flex items-center gap-1.5 shadow-md"
                  >
                    <span className="material-symbols-outlined text-sm">rocket_launch</span>
                    Browse Missions
                  </Link>
                </div>
              ) : (
                <>
                  <div className="relative">
                    {/* Twig line */}
                    <div className="absolute left-[19px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-[#b98a3e]/50 via-[#c9b37a]/40 to-transparent rounded-full" />
                    <div className="flex flex-col gap-4">
                      {items.map((activity) => (
                        <ActivityCard key={activity.id} activity={activity} />
                      ))}
                    </div>
                  </div>

                  {nextCursor && (
                    <button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="mx-auto w-full bg-[#fffdf8] hover:bg-[#fbf7ee] active:scale-[0.99] disabled:opacity-60 transition-all text-[#8a6d3b] font-semibold text-xs py-3 rounded-full border border-[#e0d2b3] flex items-center justify-center gap-2 shadow-sm"
                    >
                      <span className={`material-symbols-outlined text-sm ${loadingMore ? 'animate-spin' : ''}`}>
                        {loadingMore ? 'progress_activity' : 'expand_more'}
                      </span>
                      {loadingMore ? 'Sifting...' : 'Load More Records'}
                    </button>
                  )}
                </>
              )}
            </section>
          </>
        )}
      </div>
    </LayoutShell>
  );
}
