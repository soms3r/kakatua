'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import LayoutShell from '../components/LayoutShell';
import {
  getMissionsAction,
  createCustomMissionAction,
  claimMissionRewardAction,
  deleteCustomMissionAction,
  TRACKING_ACTION_LABELS,
  type MissionData,
} from '../actions/missions';

const CATEGORY_META: Record<string, { label: string; icon: string }> = {
  DAILY: { label: 'Daily Flight', icon: 'wb_sunny' },
  CONVERSATION: { label: 'Conversation', icon: 'forum' },
  GOAL: { label: 'Goal', icon: 'flag' },
};

function percentOf(m: MissionData): number {
  return m.target > 0 ? Math.min(100, Math.round((m.progress / m.target) * 100)) : 0;
}

function MissionCard({
  mission,
  busy,
  onClaim,
  onDelete,
}: {
  mission: MissionData;
  busy: boolean;
  onClaim: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const completed = mission.status === 'COMPLETED';
  const pct = percentOf(mission);
  const meta = CATEGORY_META[mission.category] ?? CATEGORY_META.GOAL;
  const trackingLabel = mission.trackingAction ? TRACKING_ACTION_LABELS[mission.trackingAction] ?? mission.trackingAction : null;

  return (
    <div className="relative bg-[#fffdf8] rounded-2xl border border-[#e0d2b3] shadow-[0_4px_16px_rgba(138,109,59,0.08)] p-4 overflow-hidden">
      {/* Twig corner accents */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#b98a3e]/50 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#b98a3e]/50 to-transparent" />

      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
          completed ? 'bg-[#bcf0ae]/40 text-[#2d5a27]' : 'bg-[#f3ead6] text-[#8a6d3b]'
        }`}>
          <span className="material-symbols-outlined text-xl">{completed ? 'check_circle' : meta.icon}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold text-[#1b1c1a] truncate">{mission.title}</h4>
            <span className="text-[9px] uppercase tracking-wide font-bold text-[#8a6d3b] bg-[#f3ead6] px-1.5 py-0.5 rounded-full flex-shrink-0">
              {meta.label}
            </span>
          </div>
          <p className="text-[10px] text-[#72796e] mt-1 leading-relaxed">{mission.description}</p>

          {/* Pebble progress bar */}
          <div className="mt-2.5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-semibold text-[#72796e]">
                {completed ? 'Complete' : `${mission.progress}/${mission.target}`}
              </span>
              <span className="text-[9px] font-bold text-[#b98a3e]">
                +{mission.expReward} EXP
              </span>
            </div>
            <div className="h-2.5 bg-[#efe6d0] rounded-full overflow-hidden relative">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  completed
                    ? 'bg-gradient-to-r from-[#2d5a27] to-[#7dbf4f]'
                    : 'bg-gradient-to-r from-[#b98a3e] to-[#d9b25c]'
                }`}
                style={{ width: `${pct}%` }}
              />
              {/* Pebble dots */}
              <div className="absolute inset-0 opacity-40 flex items-center justify-between px-[15%] pointer-events-none">
                {[0, 1, 2, 3, 4].map((i) => (
                  <span key={i} className="w-1 h-1 rounded-full bg-[#fffdf8]" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-[#efe6d0]/70">
        {completed ? (
          mission.rewardClaimed ? (
            <span className="text-[10px] font-bold text-[#2d5a27] flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">eco</span>
              Reward collected
            </span>
          ) : (
            <button
              onClick={() => onClaim(mission.id)}
              disabled={busy}
              className="text-[10px] font-bold text-white bg-gradient-to-r from-[#2d5a27] to-[#154212] hover:scale-105 active:scale-95 disabled:opacity-50 transition-all px-3.5 py-1.5 rounded-full flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[13px]">redeem</span>
              Claim +{mission.expReward} EXP
            </button>
          )
        ) : trackingLabel ? (
          <span className="text-[9px] text-[#72796e] bg-[#f3ead6]/60 px-2.5 py-1.5 rounded-full flex items-center gap-1 min-w-0">
            <span className="material-symbols-outlined text-[12px] text-[#b98a3e] flex-shrink-0">radar</span>
            <span className="truncate">Auto: {trackingLabel}</span>
          </span>
        ) : (
          <span className="text-[9px] text-[#72796e] italic">Manual mission</span>
        )}

        {mission.source === 'CUSTOM' && (
          <button
            onClick={() => onDelete(mission.id)}
            disabled={busy}
            className="w-7 h-7 flex items-center justify-center rounded-full text-[#ba1a1a] bg-[#ffdad6]/60 hover:bg-[#ffdad6] active:scale-90 disabled:opacity-50 transition-all"
            aria-label="Delete custom mission"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        )}
      </div>
    </div>
  );
}

function CustomMissionForm({
  onCreated,
  busy,
}: {
  onCreated: (input: { title: string; description: string; category: 'DAILY' | 'CONVERSATION' | 'GOAL'; target: number; expReward: number; trackingAction?: string | null }) => void;
  busy: boolean;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'DAILY' | 'CONVERSATION' | 'GOAL'>('GOAL');
  const [target, setTarget] = useState('1');
  const [expReward, setExpReward] = useState('25');
  const [trackingAction, setTrackingAction] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    onCreated({
      title,
      description,
      category,
      target: Math.max(1, Math.floor(Number(target) || 1)),
      expReward: Math.max(0, Math.floor(Number(expReward) || 0)),
      trackingAction: trackingAction || null,
    });
    setTitle('');
    setDescription('');
    setTarget('1');
    setExpReward('25');
    setTrackingAction('');
  };

  const inputCls =
    'w-full bg-[#fbf7ee] border border-[#e0d2b3] focus:border-[#b98a3e] focus:ring-2 focus:ring-[#b98a3e]/20 outline-none rounded-xl px-3 py-2 text-xs text-[#1b1c1a] placeholder-[#b5aa93] transition-all';

  return (
    <form onSubmit={handleSubmit} className="bg-[#fbf7ee] border border-[#e0d2b3] rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-[#8a6d3b] text-lg">edit_note</span>
        <h4 className="text-xs font-bold text-[#42493e]">Weave your own flight</h4>
      </div>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Mission title (e.g. Order a coffee in Spanish)"
        className={inputCls}
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="What will this quest look like? A small, warm description..."
        rows={2}
        className={`${inputCls} resize-none`}
      />

      <div className="grid grid-cols-3 gap-2">
        <select value={category} onChange={(e) => setCategory(e.target.value as typeof category)} className={inputCls}>
          <option value="DAILY">Daily</option>
          <option value="CONVERSATION">Conversation</option>
          <option value="GOAL">Goal</option>
        </select>
        <input
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          type="number"
          min={1}
          max={1000}
          placeholder="Target"
          className={inputCls}
          aria-label="Target count"
        />
        <input
          value={expReward}
          onChange={(e) => setExpReward(e.target.value)}
          type="number"
          min={0}
          max={1000}
          placeholder="EXP"
          className={inputCls}
          aria-label="EXP reward"
        />
      </div>

      <select
        value={trackingAction}
        onChange={(e) => setTrackingAction(e.target.value)}
        className={inputCls}
        aria-label="Auto-track by"
      >
        <option value="">Track manually (no auto-progress)</option>
        <option value="VIDEO_MATCH_COMPLETED">Auto: complete a video match</option>
        <option value="PROFILE_UPDATED">Auto: update profile settings</option>
        <option value="GUARDIAN_QUESTION_ASKED">Auto: ask a guardian a question</option>
      </select>

      <button
        type="submit"
        disabled={busy || !title.trim() || !description.trim()}
        className="w-full bg-gradient-to-r from-[#2d5a27] to-[#154212] hover:scale-[1.01] active:scale-95 disabled:opacity-50 transition-all text-white font-semibold text-xs py-2.5 rounded-full flex items-center justify-center gap-2 shadow-md"
      >
        <span className="material-symbols-outlined text-sm">add_circle</span>
        Add Custom Mission
      </button>
    </form>
  );
}

export default function MissionsPage() {
  const { data: session } = useSession();
  const [missions, setMissions] = useState<MissionData[]>([]);
  const [profileContext, setProfileContext] = useState<{ learningLanguages: string[]; goals: string[] }>({ learningLanguages: [], goals: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState('');

  const loadMissions = async () => {
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError('');
      const result = await getMissionsAction(session.user.id);
      if (result.success) {
        setMissions(result.data.missions);
        setProfileContext(result.data.profile);
      } else {
        setError(result.error || 'Failed to load missions.');
      }
    } catch (err: any) {
      console.warn('[Kakatua] loadMissions error:', err);
      setError(err?.message || 'Failed to load missions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = (msg: string) => setToast(msg);

  const replaceMission = (updated: MissionData) => {
    setMissions((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  };

  const userId = session?.user?.id;

  const handleClaim = async (missionId: string) => {
    if (!userId) return;
    setBusyId(missionId);
    try {
      const result = await claimMissionRewardAction(userId, missionId);
      if (result.success) {
        replaceMission(result.data.mission);
        showToast(result.message);
      } else {
        showToast(result.error);
      }
    } catch {
      showToast('Something went wrong claiming that reward.');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (missionId: string) => {
    if (!userId) return;
    setBusyId(missionId);
    try {
      const result = await deleteCustomMissionAction(userId, missionId);
      if (result.success) {
        setMissions((prev) => prev.filter((m) => m.id !== missionId));
        showToast(result.message);
      } else {
        showToast(result.error);
      }
    } catch {
      showToast('Something went wrong removing that mission.');
    } finally {
      setBusyId(null);
    }
  };

  const handleCreate = async (input: { title: string; description: string; category: 'DAILY' | 'CONVERSATION' | 'GOAL'; target: number; expReward: number; trackingAction?: string | null }) => {
    if (!userId) return;
    setCreating(true);
    try {
      const result = await createCustomMissionAction(userId, input);
      if (result.success) {
        setMissions((prev) => [result.data, ...prev]);
        showToast(result.message);
      } else {
        showToast(result.error);
      }
    } catch {
      showToast('Something went wrong creating that mission.');
    } finally {
      setCreating(false);
    }
  };

  const { prebuilt, auto, custom } = useMemo(() => {
    return {
      prebuilt: missions.filter((m) => m.source === 'PREBUILT'),
      auto: missions.filter((m) => m.source === 'AUTO'),
      custom: missions.filter((m) => m.source === 'CUSTOM'),
    };
  }, [missions]);

  const summary = useMemo(() => {
    const completed = missions.filter((m) => m.status === 'COMPLETED').length;
    const expBanked = missions.filter((m) => m.rewardClaimed).reduce((sum, m) => sum + m.expReward, 0);
    const inFlight = missions.length - completed;
    return { completed, expBanked, inFlight };
  }, [missions]);

  return (
    <LayoutShell activeTab="missions">
      <div className="flex flex-col gap-5 pb-4">
        {/* Header */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#2D5A27] text-2xl">rocket_launch</span>
            <div>
              <h1 className="text-lg font-bold text-[#154212] tracking-tight leading-none">Missions</h1>
              <p className="text-[10px] text-[#72796e] mt-1">Your flight deck — take off, one quest at a time.</p>
            </div>
          </div>
        </div>

        {/* Summary strip */}
        {!loading && !error && missions.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'In Flight', value: summary.inFlight, icon: 'flight' },
              { label: 'Completed', value: summary.completed, icon: 'check_circle' },
              { label: 'EXP Banked', value: summary.expBanked, icon: 'eco' },
            ].map((s) => (
              <div key={s.label} className="bg-[#fffdf8] border border-[#e0d2b3] rounded-2xl px-3 py-3 flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#b98a3e] text-xl">{s.icon}</span>
                <div className="min-w-0">
                  <div className="text-base font-bold text-[#1b1c1a] leading-none">{s.value}</div>
                  <div className="text-[9px] text-[#72796e] mt-1 truncate">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-10 h-10 border-3 border-[#a1d494] border-t-[#2D5A27] rounded-full animate-spin mb-4" />
            <p className="text-xs text-[#72796e]">Gathering your flight deck...</p>
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
            {/* 1. Prebuilt Iconic Missions */}
            <section className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#b98a3e] text-lg">nest_eco_leaf</span>
                <h3 className="font-semibold text-sm text-[#1b1c1a] tracking-tight">Prebuilt Iconic Missions</h3>
                <span className="text-[9px] bg-[#f3ead6] text-[#8a6d3b] px-2 py-0.5 rounded-full font-medium">Curated</span>
              </div>
              {prebuilt.length === 0 ? (
                <p className="text-[10px] text-[#72796e] italic">The curated catalog is still warming up.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {prebuilt.map((m) => (
                    <MissionCard key={m.id} mission={m} busy={busyId === m.id} onClaim={handleClaim} onDelete={handleDelete} />
                  ))}
                </div>
              )}
            </section>

            {/* 2. Auto-Generated Quests */}
            <section className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#2d5a27] text-lg">auto_awesome</span>
                <h3 className="font-semibold text-sm text-[#1b1c1a] tracking-tight">Auto-Generated Quests</h3>
                <span className="text-[9px] bg-[#bcf0ae]/40 text-[#2d5a27] px-2 py-0.5 rounded-full font-medium">From your profile</span>
              </div>

              {auto.length === 0 && profileContext.learningLanguages.length === 0 && (
                <div className="bg-[#fffdf8] border border-[#e0d2b3] rounded-2xl px-4 py-4 text-[11px] text-[#72796e] leading-relaxed">
                  Add your learning languages and goals in{' '}
                  <Link href="/profile/settings" className="text-[#2d5a27] font-semibold underline underline-offset-2">
                    Profile Settings
                  </Link>{' '}
                  and the flock will weave quests around them automatically.
                </div>
              )}

              {auto.length > 0 && (
                <div className="flex flex-col gap-3">
                  {auto.map((m) => (
                    <MissionCard key={m.id} mission={m} busy={busyId === m.id} onClaim={handleClaim} onDelete={handleDelete} />
                  ))}
                </div>
              )}
            </section>

            {/* 3. Custom Mission Creator */}
            <section className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#8a6d3b] text-lg">handyman</span>
                <h3 className="font-semibold text-sm text-[#1b1c1a] tracking-tight">Custom Missions</h3>
                <span className="text-[9px] bg-[#f3ead6] text-[#8a6d3b] px-2 py-0.5 rounded-full font-medium">Yours</span>
              </div>

              <CustomMissionForm onCreated={handleCreate} busy={creating} />

              {custom.length > 0 && (
                <div className="flex flex-col gap-3">
                  {custom.map((m) => (
                    <MissionCard key={m.id} mission={m} busy={busyId === m.id} onClaim={handleClaim} onDelete={handleDelete} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-[#154212]/95 text-white text-[11px] font-semibold shadow-xl animate-fade-in max-w-[90%] text-center">
            {toast}
          </div>
        )}
      </div>
    </LayoutShell>
  );
}
