'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import LayoutShell from '../components/LayoutShell';
import {
  getUserActivityAction,
  getUserAnalyticsAction,
  type ActivityAnalytics,
  type ActivityData,
} from '../actions/activity';

const ACTION_META: Record<string, { label: string; icon: string; tone: string }> = {
  VIDEO_MATCH_COMPLETED: { label: 'Video Match', icon: 'videocam', tone: 'text-[#2d5a27] bg-[#bcf0ae]/40' },
  MISSION_COMPLETED: { label: 'Mission Complete', icon: 'check_circle', tone: 'text-[#7b5800] bg-[#ffe8bd]' },
  MISSION_CREATED: { label: 'Custom Quest', icon: 'add_task', tone: 'text-[#8a6d3b] bg-[#f3ead6]' },
  PROFILE_UPDATED: { label: 'Profile', icon: 'person', tone: 'text-[#42493e] bg-[#e8e4dc]' },
  FEEDBACK_SUBMITTED: { label: 'Feedback', icon: 'forum', tone: 'text-[#7b5800] bg-[#ffe8bd]' },
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
  const [items, setItems] = useState<ActivityData[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    async function load() {
      try {
        const [statsResult, logResult] = await Promise.all([
          getUserAnalyticsAction(session!.user.id),
          getUserActivityAction(session!.user.id),
        ]);
        if (cancelled) return;
        if (statsResult.success) setAnalytics(statsResult.data);
        if (logResult.success) {
          setItems(logResult.data.items);
          setNextCursor(logResult.data.nextCursor);
        }
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

  const statCards: { label: string; value: string; icon: string; gradient: string }[] = [
    {
      label: 'Practice Time',
      value: formatMinutes(analytics?.totalPracticeMinutes ?? 0),
      icon: 'timer',
      gradient: 'from-[#b98a3e] to-[#8a6d3b]',
    },
    {
      label: 'Video Matches',
      value: String(analytics?.videoMatchesCompleted ?? 0),
      icon: 'videocam',
      gradient: 'from-[#2d5a27] to-[#154212]',
    },
    {
      label: 'Missions Done',
      value: String(analytics?.missionsCompleted ?? 0),
      icon: 'task_alt',
      gradient: 'from-[#7dbf4f] to-[#2d5a27]',
    },
    {
      label: 'Flight Streak',
      value: `${analytics?.currentStreak ?? 0}d`,
      icon: 'local_fire_department',
      gradient: 'from-[#f0a63c] to-[#c2703d]',
    },
    {
      label: 'EXP Earned',
      value: String(analytics?.totalExpEarned ?? 0),
      icon: 'eco',
      gradient: 'from-[#a1d494] to-[#5b9440]',
    },
    {
      label: 'This Week',
      value: String(analytics?.activitiesThisWeek ?? 0),
      icon: 'auto_awesome',
      gradient: 'from-[#c9b37a] to-[#a08350]',
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
            {/* Analytics Overview — polished pebbles */}
            <section className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#b98a3e] text-lg">dashboard_customize</span>
                <h3 className="font-semibold text-sm text-[#1b1c1a] tracking-tight">Analytics Overview</h3>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {statCards.map((card) => (
                  <div
                    key={card.label}
                    className={`relative rounded-[22px] p-3.5 bg-gradient-to-br ${card.gradient} shadow-[0_6px_18px_rgba(138,109,59,0.18)] border border-white/20 overflow-hidden`}
                  >
                    <div className="absolute -top-3 -right-3 w-12 h-12 rounded-full bg-white/10 blur-md" />
                    <span className="material-symbols-outlined text-xl text-white/90">{card.icon}</span>
                    <div className="text-xl font-bold text-white leading-none mt-2.5">{card.value}</div>
                    <div className="text-[9px] text-white/80 mt-1 font-medium">{card.label}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Activity Timeline */}
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
