'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import LayoutShell from '../components/LayoutShell';
import CultureCard from '../components/CultureCard';
import { getDiscoverFeed } from '../actions/ambassadors';
import type { DiscoverAmbassador } from '../actions/types';

export default function DiscoverPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [ambassadors, setAmbassadors] = useState<DiscoverAmbassador[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        console.log('[Kakatua] Discover: fetching feed...');
        const result = await getDiscoverFeed();
        if (cancelled) return;
        if (result.success) {
          setAmbassadors(result.data);
          console.log(`[Kakatua] Discover: loaded ${result.data.length} items`);
        } else {
          console.error('[Kakatua] Discover: action error:', result.error);
          setError(result.error);
        }
      } catch (err: any) {
        if (cancelled) return;
        console.error('[Kakatua] Discover: fetch failed:', err);
        setError(err?.message || 'Failed to load Discover feed. Please try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const countryCards = ambassadors.filter((a) => a.countrySlug);
  const systemBots = ambassadors.filter((a) => !a.countrySlug && !a.isUserCreated);
  const userCards = ambassadors.filter((a) => a.isUserCreated);

  return (
    <LayoutShell activeTab="discover">
      <div className="flex flex-col gap-5 pb-24 pt-2">

        {/* Page Header */}
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#2D5A27] text-xl">explore</span>
            <h1 className="text-base font-bold text-[#154212] tracking-tight">Discover</h1>
          </div>
          <p className="text-[11px] text-[#72796e] mt-1 leading-relaxed">
            Explore the flock&apos;s Culture Library — {countryCards.length} countries, each with a story to tell.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-8 h-8 border-2 border-[#a1d494] border-t-[#2D5A27] rounded-full animate-spin mb-3" />
            <p className="text-[11px] text-[#72796e]">Gathering the flock...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-[#ffdad6] border border-[#ba1a1a]/20 rounded-xl px-4 py-3 text-[11px] text-[#ba1a1a] text-center">
            {error}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && ambassadors.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="material-symbols-outlined text-4xl text-[#c2c9bb] mb-2">nest_eco_leaf</span>
            <p className="text-[11px] text-[#72796e]">No ambassadors found yet.</p>
          </div>
        )}

        {/* ─── Country Cards (clickable → detail page) ─────────────────── */}
        {!loading && !error && countryCards.length > 0 && (
          <>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#7b5800] text-base">public</span>
              <h2 className="text-xs font-bold text-[#154212]">Culture Library</h2>
              <span className="text-[10px] bg-[#ffdea5]/60 text-[#7b5800] px-2 py-0.5 rounded-full font-bold">{countryCards.length}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {countryCards.map((amb) => (
                <div
                  key={amb.id}
                  onClick={() => router.push(`/discover/${amb.countrySlug}`)}
                  className="cursor-pointer"
                >
                  <CultureCard
                    user={{
                      id: amb.id,
                      name: amb.name,
                      avatarUrl: amb.avatarUrl,
                      nativeLanguages: amb.nativeLanguages,
                      learningLanguages: amb.learningLanguages,
                      interests: amb.interests,
                      timezoneOffset: String(amb.timezoneOffset),
                    }}
                    cardData={amb.cultureCard || { traditions: '', food: '', history: '', funFact: '' }}
                    ambassadorRole={amb.ambassadorRole}
                    hasDetails
                    cultureCardId={amb.cultureCardId}
                    loveCount={amb.loveCount}
                    isUserCreated={amb.isUserCreated}
                  />
                </div>
              ))}
            </div>
          </>
        )}

        {/* ─── Flock Members (user-created cards) ─────────────────────── */}
        {!loading && !error && userCards.length > 0 && (
          <>
            <div className="flex items-center gap-2 mt-2">
              <span className="material-symbols-outlined text-[#4a6741] text-base">group</span>
              <h2 className="text-xs font-bold text-[#154212]">From the Flock</h2>
              <span className="text-[10px] bg-[#e8f5e3] text-[#4a6741] px-2 py-0.5 rounded-full font-bold">{userCards.length}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {userCards.map((u) => (
                <CultureCard
                  key={u.id}
                  user={{
                    id: u.id,
                    name: u.name,
                    avatarUrl: u.avatarUrl,
                    nativeLanguages: u.nativeLanguages,
                    learningLanguages: u.learningLanguages,
                    interests: u.interests,
                    timezoneOffset: String(u.timezoneOffset),
                  }}
                  cardData={u.cultureCard || { traditions: '', food: '', history: '', funFact: '' }}
                  cultureCardId={u.cultureCardId}
                  loveCount={u.loveCount}
                  isUserCreated
                />
              ))}
            </div>
          </>
        )}

        {/* ─── System Bots (Guide, Buddy) ─────────────────────────────── */}
        {!loading && !error && systemBots.length > 0 && (
          <>
            <div className="flex items-center gap-2 mt-2">
              <span className="material-symbols-outlined text-[#2D5A27] text-base">shield</span>
              <h2 className="text-xs font-bold text-[#154212]">Guardians of the Flock</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {systemBots.map((amb) => (
                <CultureCard
                  key={amb.id}
                  user={{
                    id: amb.id,
                    name: amb.name,
                    avatarUrl: amb.avatarUrl,
                    nativeLanguages: amb.nativeLanguages,
                    learningLanguages: amb.learningLanguages,
                    interests: amb.interests,
                    timezoneOffset: String(amb.timezoneOffset),
                  }}
                  cardData={amb.cultureCard || { traditions: '', food: '', history: '', funFact: '' }}
                  ambassadorRole={amb.ambassadorRole}
                  cultureCardId={amb.cultureCardId}
                  loveCount={amb.loveCount}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </LayoutShell>
  );
}
