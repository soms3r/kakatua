'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import LayoutShell from './components/LayoutShell';
import TheNestDashboard from './components/TheNestDashboard';
import MatchmakingStatus from './components/MatchmakingStatus';
import { findAKakatuaAction } from './actions/findAKakatua';

export default function HomePage() {
  const { data: session } = useSession();
  const [isSearching, setIsSearching] = useState(false);

  const userName = session?.user?.name || 'Explorer';

  const handleFindKakatua = async () => {
    if (!session?.user?.id) return;
    setIsSearching(true);
    const result = await findAKakatuaAction(session.user.id);
    if (!result.success) {
      console.warn('[Kakatua] Matchmaking:', result.error);
    }
  };

  const handleCancelSearch = () => {
    setIsSearching(false);
  };

  return (
    <LayoutShell>
      {isSearching ? (
        <MatchmakingStatus onCancel={handleCancelSearch} />
      ) : (
        <TheNestDashboard
          userName={userName}
          streakDays={0}
          missions={[]}
          onFindKakatua={handleFindKakatua}
        />
      )}
    </LayoutShell>
  );
}
