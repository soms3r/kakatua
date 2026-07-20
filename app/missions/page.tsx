'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import LayoutShell from '../components/LayoutShell';
import { getUserMissionsAction } from '../actions/getData';

interface Mission {
  id: string;
  missionId: string;
  title: string;
  description: string;
  expReward: number;
  type: string;
  progress: number;
  completed: boolean;
  completedAt: string | null;
}

export default function MissionsPage() {
  const { data: session } = useSession();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    async function load() {
      try {
        console.log('[Kakatua] Missions: fetching for user', session!.user.id);
        const result = await getUserMissionsAction(session!.user.id);
        if (cancelled) return;
        if (result.success) {
          setMissions(result.data);
          console.log(`[Kakatua] Missions: loaded ${result.data.length} missions`);
        } else {
          console.error('[Kakatua] Missions: action error:', result.error);
          setError(result.error);
        }
      } catch (err: any) {
        if (cancelled) return;
        console.error('[Kakatua] Missions: fetch failed:', err);
        setError(err?.message || 'Failed to load missions. Please try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [session?.user?.id]);

  return (
    <LayoutShell activeTab="missions">
      <div className="flex flex-col gap-5 pb-4">
        <div className="flex items-center gap-2 pt-2">
          <span className="material-symbols-outlined text-[#2D5A27] text-2xl">rocket_launch</span>
          <h1 className="text-lg font-bold text-[#154212] tracking-tight">Missions</h1>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-10 h-10 border-3 border-[#a1d494] border-t-[#2D5A27] rounded-full animate-spin mb-4" />
            <p className="text-xs text-[#72796e]">Loading your flights...</p>
          </div>
        )}

        {!loading && error && (
          <div className="bg-[#ffdad6] border border-[#ba1a1a]/20 rounded-xl px-4 py-3 text-[11px] text-[#ba1a1a] text-center">
            <span className="material-symbols-outlined text-sm align-middle mr-1">error</span>
            {error}
          </div>
        )}

        {!loading && !error && missions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="material-symbols-outlined text-5xl text-[#c2c9bb] mb-3">flight_takeoff</span>
            <h3 className="text-sm font-bold text-[#42493e] mb-1">No active flights yet</h3>
            <p className="text-xs text-[#72796e] max-w-[70%] leading-relaxed mb-5">
              Start your first mission to earn EXP and build your flight chain.
            </p>
            <Link
              href="/discover"
              className="bg-[#2D5A27] hover:bg-[#154212] active:scale-95 transition-all text-white font-semibold text-xs py-3 px-6 rounded-full flex items-center justify-center gap-2 shadow-md"
            >
              <span className="material-symbols-outlined text-sm">explore</span>
              Start a New Mission
            </Link>
          </div>
        )}

        {!loading && missions.length > 0 && (
          <div className="flex flex-col gap-3">
            {missions.map((m) => (
              <div
                key={m.id}
                className="bg-[#ffffff] border border-[#efeeea] rounded-2xl p-4 flex items-center justify-between shadow-sm"
              >
                <div className="flex-1 min-w-0 mr-3">
                  <h4 className="text-xs font-bold text-[#1b1c1a] truncate">{m.title}</h4>
                  <p className="text-[10px] text-[#72796e] mt-0.5 truncate">{m.description}</p>
                  <div className="w-full bg-[#f5f3ef] h-2 rounded-full overflow-hidden mt-2 flex">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        m.completed ? 'bg-[#2d5a27]' : 'bg-[#fdbb24]'
                      }`}
                      style={{ width: `${m.progress}%` }}
                    />
                  </div>
                </div>
                <div className="flex flex-col items-end flex-shrink-0">
                  {m.completed ? (
                    <span className="material-symbols-outlined text-[#2D5A27] text-xl">check_circle</span>
                  ) : (
                    <span className="text-[10px] font-bold text-[#72796e] bg-[#f5f3ef] px-2 py-1 rounded-md">
                      +{m.expReward} EXP
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </LayoutShell>
  );
}
