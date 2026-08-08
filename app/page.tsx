'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import LayoutShell from './components/LayoutShell';
import TheNestDashboard from './components/TheNestDashboard';
import MatchmakingStatus from './components/MatchmakingStatus';
import { findAKakatuaAction, type MatchedUserData } from './actions/findAKakatua';
import { getNestOverviewAction, type NestMission } from './actions/nest';

export default function HomePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isSearching, setIsSearching] = useState(false);
  const [match, setMatch] = useState<MatchedUserData | null>(null);
  const [missions, setMissions] = useState<NestMission[]>([]);
  const [streakDays, setStreakDays] = useState(0);
  const [loadingOverview, setLoadingOverview] = useState(false);

  const userName = session?.user?.name || 'Explorer';

  useEffect(() => {
    if (!session?.user?.id) return;
    let cancelled = false;
    setLoadingOverview(true);
    async function loadOverview() {
      try {
        const result = await getNestOverviewAction(session!.user.id);
        if (cancelled) return;
        if (result.success) {
          setMissions(result.data.missions);
          setStreakDays(result.data.streakDays);
        } else {
          console.warn('[Kakatua] Nest overview:', result.error);
        }
      } catch (err: any) {
        if (!cancelled) console.warn('[Kakatua] Nest overview failed:', err?.message);
      } finally {
        if (!cancelled) setLoadingOverview(false);
      }
    }
    loadOverview();
    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  const handleFindKakatua = async () => {
    if (!session?.user?.id) return;
    setMatch(null);
    setIsSearching(true);
    const result = await findAKakatuaAction(session.user.id);
    if (result.success) {
      setMatch(result.data ?? null);
    } else {
      console.warn('[Kakatua] Matchmaking:', result.error);
    }
  };

  const handleCancelSearch = () => {
    setIsSearching(false);
    setMatch(null);
  };

  const handleMissionClick = () => {
    router.push('/missions');
  };

  return (
    <LayoutShell>
      {isSearching ? (
        <MatchmakingStatus onCancel={handleCancelSearch} match={match} />
      ) : (
        <TheNestDashboard
          userName={userName}
          streakDays={streakDays}
          missions={missions}
          loading={loadingOverview}
          onFindKakatua={handleFindKakatua}
          onMissionClick={handleMissionClick}
        />
      )}
    </LayoutShell>
  );
}
