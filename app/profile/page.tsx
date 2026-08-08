'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import LayoutShell from '../components/LayoutShell';
import GrammarCheckModal from '../components/GrammarCheckModal';
import { getUserProfileAction, updateUserProfileAction } from '../actions/getData';
import { getReferralStatsAction } from '../actions/referrals';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  nativeLanguages: string[];
  learningLanguages: string[];
  interests: string[];
  timezoneOffset: number;
  status: string;
  isAmbassador: boolean;
  ambassadorRole: string | null;
  bio: string | null;
  traditions: string | null;
  favoriteFood: string | null;
  historyInterest: string | null;
  cultureCard: {
    traditions: string;
    food: string;
    history: string;
    funFact: string;
  } | null;
}

const ROLE_LABELS: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  GUIDE: { label: 'Kakatua Guide', icon: 'menu_book', color: '#3f5a2e', bg: '#e8efda' },
  MATCHMAKER: { label: 'Global Buddy', icon: 'handshake', color: '#8a6d4d', bg: '#f4e2b8' },
  CULTURAL_ADVISOR: { label: 'Cultural Advisor', icon: 'location_on', color: '#b26a3a', bg: '#f7e0ce' },
};

// ─── Nest "floor" backdrop ────────────────────────────────────────────────────
// A dark woven-twig texture: interlaced diagonal strands repeated as a tile,
// layered over warm pools of moss, amber and earth light on a deep brown bed.

const TWIG_TILE = `<svg xmlns="http://www.w3.org/2000/svg" width="140" height="140" viewBox="0 0 140 140"><g stroke="#4f3a24" stroke-width="3.2" stroke-linecap="round" fill="none" opacity="0.55"><path d="M-25 20 L45 90 M5 0 L85 80 M35 -20 L115 60 M20 120 L100 40 M0 60 L80 140 M-25 85 L55 165"/></g><g stroke="#6b4a2e" stroke-width="2.4" stroke-linecap="round" fill="none" opacity="0.4"><path d="M140 -10 L60 70 M110 -25 L30 55 M75 120 L155 40 M100 150 L20 70 M130 60 L50 140"/></g><g stroke="#8a6a3f" stroke-width="1.6" stroke-linecap="round" fill="none" opacity="0.25"><path d="M20 10 L40 30 M60 20 L80 40 M100 90 L120 110 M30 110 L50 130"/></g></svg>`;

const NEST_FLOOR = {
  backgroundImage: [
    `url("data:image/svg+xml,${encodeURIComponent(TWIG_TILE)}")`,
    'radial-gradient(720px 420px at 50% -6%, rgba(255,214,140,0.32), rgba(255,214,140,0.10) 55%, rgba(0,0,0,0) 72%)',
    'radial-gradient(900px 640px at 18% -8%, rgba(122,148,92,0.20), rgba(0,0,0,0) 62%)',
    'radial-gradient(760px 560px at 92% 16%, rgba(217,164,65,0.16), rgba(0,0,0,0) 58%)',
    'radial-gradient(820px 620px at 50% 112%, rgba(201,119,90,0.14), rgba(0,0,0,0) 60%)',
    'linear-gradient(180deg, #2a1c0f 0%, #24170c 42%, #1a1008 100%)',
  ].join(','),
};

// ─── Organic "nest" iconography (small custom SVGs) ───────────────────────────

function EggIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 18" className={className} fill="currentColor" aria-hidden="true">
      <path d="M8 1.8C4.9 4.7 2.3 7.9 2.3 11 2.3 13.9 4.8 16.3 8 16.3s5.7-2.4 5.7-5.3C13.7 7.9 11.1 4.7 8 1.8z" />
      <ellipse cx="6.3" cy="9.5" rx="1" ry="1.5" fill="#ffffff" opacity="0.55" />
    </svg>
  );
}

function LeafIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 18 18" className={className} fill="currentColor" aria-hidden="true">
      <path d="M3.2 14.8C3.2 7.8 7.2 2.6 15 3c-.5 6.8-5.2 11-11.8 11.8z" />
      <path d="M3.6 14.4C6.8 10.6 10.2 7.2 14.6 3.6" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.65" />
    </svg>
  );
}

function BerryIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 18 18" className={className} fill="currentColor" aria-hidden="true">
      <circle cx="6" cy="10.6" r="4" />
      <circle cx="12" cy="7.6" r="3.2" />
      <circle cx="10.8" cy="13" r="2.2" />
      <path d="M6.2 6.4c1.4-2 3.6-3.2 5.9-3.2-1.1 2.4-3.1 3.6-5.9 3.2z" fill="#5f7d45" />
    </svg>
  );
}

function TwigIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 18 18" className={className} fill="currentColor" aria-hidden="true">
      <path d="M2.8 15.2c4.5-3.6 8.6-7.4 11-10.8-2.2 3-5 6.4-8.4 9l-2.6 1.8z" />
      <path d="M5.4 13.4c2-1.6 4-3.4 6.6-6.2" stroke="currentColor" strokeWidth="1.1" fill="none" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

function FeatherIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 18 18" className={className} fill="currentColor" aria-hidden="true">
      <path d="M3 15.2c3-5.2 6.8-8.9 11.8-10.9C13.6 8.9 10.4 12.4 6 15l-3 .2z" />
      <path d="M4.2 13.4L10.8 6.8" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

// Pressed, dried leaf — warm parchment brown with a delicate midrib.
function DryLeafIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="currentColor" aria-hidden="true">
      <path d="M10 2C6.2 4.8 3.6 8.4 3.6 12.2 3.6 15.4 6.4 18 10 18s6.4-2.6 6.4-5.8C16.4 8.4 13.8 4.8 10 2z" />
      <path d="M10 4.5V16.5" stroke="#5d4222" strokeWidth="1.1" fill="none" strokeLinecap="round" opacity="0.6" />
      <path d="M10 7.5L6.6 10.2M10 9.8L13.2 7M10 11.5L7.2 13.8M10 13.2L12.4 11.4" stroke="#5d4222" strokeWidth="0.8" fill="none" strokeLinecap="round" opacity="0.45" />
    </svg>
  );
}

// A bare, dry branch with a few small offshoots.
function DryBranchIcon({ className = '', flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 60 60"
      className={className}
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      style={flip ? { transform: 'scaleX(-1)' } : undefined}
    >
      <path d="M4 52C16 44 28 34 40 20 46 13 52 8 56 5" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M16 42c1-6 6-11 11-14M28 30c3-4 8-7 13-9M36 22c2.5-3 6-5 9-6.5M10 48c-2-3-4-4-6-5" strokeWidth="2" strokeLinecap="round" opacity="0.75" />
      <path d="M50 8l4-3M54 4l3 1" strokeWidth="2.4" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

// A tuft of dried grass stalks.
function GrassTuftIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 16" className={className} fill="none" stroke="currentColor" aria-hidden="true">
      <path d="M4 15C3.5 9 5 4 8 1M10 15C10.5 8 11 4 13 2M16 15C17 9 18.5 6 21 5M2 15h20" strokeWidth="1.6" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
}

function TwigDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`} aria-hidden="true">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#a88755]" />
      <DryLeafIcon className="w-2.5 h-2.5 text-[#a88755]" />
      <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#a88755]" />
    </div>
  );
}

// ─── Non-overlapping "log" cluster ────────────────────────────────────────────
// A rough twig/log container: a bark-toned textured frame hugging a warm cream
// panel. Clusters are always spaced apart (gap on the parent), never overlapping.
function LogCluster({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={`relative rounded-[32px] ${className}`}
      style={{
        background:
          'repeating-linear-gradient(45deg, #5d4222 0 3px, #4a321c 3px 6px, #7a5a33 6px 9px), repeating-linear-gradient(-45deg, rgba(255,225,170,0.16) 0 2px, transparent 2px 9px), linear-gradient(160deg, rgba(255,240,200,0.12), rgba(30,18,6,0.70))',
        boxShadow:
          '0 18px 44px rgba(12,7,2,0.62), 0 3px 12px rgba(12,7,2,0.50), inset 0 1px 0 rgba(255,240,200,0.20), inset 0 -1px 0 rgba(0,0,0,0.45)',
      }}
    >
      {/* interwoven twig strands braided across the frame */}
      <div
        className="absolute inset-0 rounded-[32px] pointer-events-none"
        style={{
          background:
            'repeating-conic-gradient(from 30deg, rgba(255,228,180,0.16) 0deg 4deg, transparent 4deg 22deg), repeating-conic-gradient(from 150deg, rgba(25,15,6,0.55) 0deg 3deg, transparent 3deg 26deg)',
        }}
      />
      <div
        className="m-[6px] rounded-[26px] overflow-hidden relative"
        style={{
          background: 'linear-gradient(180deg,#faf0d7 0%,#f3e5c2 55%,#e9d5a8 100%)',
          boxShadow:
            'inset 0 1px 2px rgba(255,255,255,0.70), inset 0 -2px 6px rgba(90,60,30,0.16), 0 2px 12px rgba(40,26,12,0.35)',
        }}
      >
        {/* bark cap highlight along the top rim */}
        <div className="h-[8px] rounded-t-[26px] bg-gradient-to-r from-transparent via-[#c9ab72]/55 to-transparent" />
        <div className="relative px-6 pb-6 pt-1 sm:px-7 sm:pb-7">{children}</div>
        {/* tiny leaf & feather accents tucked on the frame */}
        <span className="pointer-events-none absolute -top-1.5 -right-1 w-4 h-4 text-[#8a6a3f] rotate-[28deg] drop-shadow">
          <DryLeafIcon className="w-full h-full" />
        </span>
        <span className="pointer-events-none absolute -top-1 -left-1 w-3.5 h-3.5 text-[#5f7d45] -rotate-[20deg] drop-shadow">
          <LeafIcon className="w-full h-full" />
        </span>
        <span className="pointer-events-none absolute bottom-2 right-1 w-3 h-3 text-[#c9775a] rotate-[36deg] drop-shadow">
          <LeafIcon className="w-full h-full" />
        </span>
      </div>
    </div>
  );
}

// ─── Braided dry-reed frame ───────────────────────────────────────────────────
function ReedFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-[18px] p-[6px]"
      style={{
        background:
          'repeating-linear-gradient(90deg, #8a6d4d 0 7px, #a08050 7px 13px, #6f573d 13px 20px, #9c7a4c 20px 27px)',
        boxShadow: '0 8px 20px rgba(40,26,12,0.35), inset 0 1px 0 rgba(255,240,200,0.22)',
      }}
    >
      <div
        className="rounded-[13px] px-4 py-3.5"
        style={{
          background: 'linear-gradient(180deg,#fbf2dc,#f5e7c4)',
          boxShadow: 'inset 0 2px 6px rgba(90,60,30,0.12)',
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ─── Smooth pebble tag ────────────────────────────────────────────────────────
function Pebble({ children, tone = 'moss', className = '' }: { children: React.ReactNode; tone?: 'moss' | 'clay' | 'bark'; className?: string }) {
  const styles: Record<string, React.CSSProperties> = {
    moss: {
      background: 'radial-gradient(circle at 32% 26%, #e2efce, #b3cd97 58%, #8fae72)',
      boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,0.7), 0 3px 8px rgba(40,26,12,0.30)',
    },
    clay: {
      background: 'radial-gradient(circle at 32% 26%, #f7e0c6, #e2b584 58%, #c9935f)',
      boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,0.7), 0 3px 8px rgba(40,26,12,0.30)',
    },
    bark: {
      background: 'radial-gradient(circle at 32% 26%, #f2e3bd, #dcc193 58%, #c2a271)',
      boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,0.7), 0 3px 8px rgba(40,26,12,0.30)',
    },
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[11px] font-semibold text-stone-800 transition-transform hover:-translate-y-0.5 ${className}`}
      style={styles[tone]}
    >
      {children}
    </span>
  );
}

// ─── Grass-framed calendar cell ───────────────────────────────────────────────
function GrassCell({ children, active = false }: { children?: React.ReactNode; active?: boolean }) {
  return (
    <div
      className="relative rounded-[10px] overflow-hidden min-h-[30px]"
      style={{
        background: active
          ? 'radial-gradient(circle at 50% 30%, rgba(122,148,92,0.60), rgba(95,125,69,0.34))'
          : 'rgba(122,90,51,0.16)',
        border: '1px solid rgba(150,115,60,0.35)',
        boxShadow: 'inset 0 1px 0 rgba(255,240,200,0.12)',
      }}
    >
      {/* grass fringe on the top edge */}
      <span
        className="absolute -top-[5px] left-1/2 -translate-x-1/2 w-[26px] h-[9px] pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(90deg, rgba(160,200,120,0.85) 0 2px, transparent 2px 5px)',
          clipPath: 'polygon(0 100%, 12% 42%, 30% 78%, 50% 0, 70% 78%, 88% 42%, 100% 100%)',
        }}
      />
      {/* grass fringe on the bottom edge */}
      <span
        className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-[26px] h-[9px] pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(90deg, rgba(200,180,120,0.75) 0 2px, transparent 2px 5px)',
          clipPath: 'polygon(0 0, 12% 58%, 30% 22%, 50% 100%, 70% 22%, 88% 58%, 100% 0)',
        }}
      />
      <div className="relative flex items-center justify-center h-full text-[9px] font-semibold text-stone-800 px-0.5 text-center">
        {children}
      </div>
    </div>
  );
}

const ICONS: Record<string, React.ReactNode> = {
  feather: <FeatherIcon className="w-3.5 h-3.5" />,
  leaf: <LeafIcon className="w-3.5 h-3.5" />,
  berry: <BerryIcon className="w-3.5 h-3.5" />,
  twig: <TwigIcon className="w-3.5 h-3.5" />,
};

// ─── Referral: Grow the Flock ────────────────────────────────────────────────
interface ReferralStatsData {
  code: string;
  link: string;
  clicks: number;
  signups: number;
  invitedUsers: { id: string; name: string; avatarUrl: string | null; joinedAt: string }[];
  qrDataUrl: string;
}

function ReferralSection({ userId }: { userId: string }) {
  const [stats, setStats] = useState<ReferralStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await getReferralStatsAction(userId, window.location.origin);
        if (cancelled) return;
        if (result.success) setStats(result.data);
        else setError(result.error);
      } catch (err: any) {
        if (!cancelled) setError(err?.message || 'Failed to load your referral nest.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [userId]);

  const copyLink = async () => {
    if (!stats) return;
    try {
      await navigator.clipboard.writeText(stats.link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      /* clipboard unavailable — nothing to do */
    }
  };

  const downloadQr = () => {
    if (!stats) return;
    const a = document.createElement('a');
    a.href = stats.qrDataUrl;
    a.download = `kakatua-referral-${stats.code}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <LogCluster className="rotate-[0.2deg]">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-8 h-8 rounded-full bg-[#e8efda] flex items-center justify-center text-[#3f5a2e]">
          <FeatherIcon className="w-4 h-4" />
        </span>
        <div className="min-w-0">
          <h3 className="text-xs font-bold text-stone-900 tracking-tight">Grow the Flock</h3>
          <p className="text-[9px] text-stone-500 mt-0.5">Every nest you help build makes the canopy warmer</p>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-8 h-8 border-2 border-[#c9ab72] border-t-[#8fae72] rounded-full animate-spin mb-3" />
          <p className="text-[10px] text-stone-500">Weaving your referral link...</p>
        </div>
      )}

      {!loading && error && (
        <p className="text-[10px] text-[#a04a2a] text-center bg-[#f7e0ce]/70 rounded-xl px-3 py-2.5">{error}</p>
      )}

      {!loading && !error && stats && (
        <>
          {/* ─── The invite link ─────────────────────────────────────── */}
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0 rounded-full bg-[#f7ecd8] border border-[#dcc9a0] pl-4 pr-2 py-1.5 flex items-center gap-2 shadow-inner">
              <span className="material-symbols-outlined text-[13px] text-[#8a6d4d] flex-shrink-0">link</span>
              <span className="text-[10px] text-stone-800 font-semibold truncate">{stats.link}</span>
            </div>
            <button
              onClick={copyLink}
              className={`flex-shrink-0 text-[10px] font-bold rounded-full px-3.5 py-2 flex items-center gap-1 transition-all active:scale-95 ${
                copied ? 'bg-[#5f7d45] text-white' : 'bg-[#e8efda] text-[#3f5a2e] hover:bg-[#d9e8c8]'
              }`}
            >
              <span className="material-symbols-outlined text-[13px]">{copied ? 'check' : 'content_copy'}</span>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          {/* ─── QR code + live stats ───────────────────────────────── */}
          <div className="mt-4 grid grid-cols-2 gap-3 items-stretch">
            {/* QR, framed in a woven twig ring */}
            <div className="flex flex-col items-center justify-center rounded-2xl p-3"
              style={{
                background: 'linear-gradient(180deg,#f4e5bc,#e0c892)',
                boxShadow: 'inset 0 2px 6px rgba(90,60,30,0.18)',
              }}
            >
              <div className="relative p-1.5 rounded-2xl"
                style={{
                  background:
                    'repeating-conic-gradient(from 30deg, rgba(122,90,51,0.55) 0deg 8deg, transparent 8deg 22deg), repeating-conic-gradient(from 150deg, rgba(90,60,30,0.35) 0deg 4deg, transparent 4deg 18deg)',
                }}
              >
                <div className="bg-white rounded-xl p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={stats.qrDataUrl} alt={`Referral QR code for ${stats.code}`} className="w-24 h-24 sm:w-28 sm:h-28" />
                </div>
              </div>
              <button
                onClick={downloadQr}
                className="mt-2.5 text-[9px] font-bold text-[#6f573d] bg-[#f4e2b8]/80 hover:bg-[#f4e2b8] px-3 py-1.5 rounded-full flex items-center gap-1 transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-[12px]">download</span>
                Download QR
              </button>
            </div>

            {/* Live stats */}
            <div className="flex flex-col justify-center gap-2.5">
              <div className="rounded-2xl px-3.5 py-2.5 flex items-center gap-2.5"
                style={{
                  background: 'radial-gradient(circle at 30% 25%, #e2efce, #c2d8a8 60%, #9fc07e)',
                  boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,0.7), 0 3px 8px rgba(40,26,12,0.25)',
                }}
              >
                <span className="material-symbols-outlined text-lg text-[#2e4a21]">radar</span>
                <div className="min-w-0">
                  <div className="text-base font-bold text-stone-900 leading-none">{stats.clicks}</div>
                  <div className="text-[9px] text-stone-700 mt-1">link peeks</div>
                </div>
              </div>
              <div className="rounded-2xl px-3.5 py-2.5 flex items-center gap-2.5"
                style={{
                  background: 'radial-gradient(circle at 30% 25%, #f7e0c6, #e8c189 60%, #d5a96a)',
                  boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,0.7), 0 3px 8px rgba(40,26,12,0.25)',
                }}
              >
                <span className="material-symbols-outlined text-lg text-[#7a3d1a]">group_add</span>
                <div className="min-w-0">
                  <div className="text-base font-bold text-stone-900 leading-none">{stats.signups}</div>
                  <div className="text-[9px] text-stone-700 mt-1">new nests</div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Invited birds ──────────────────────────────────────── */}
          <div className="mt-4">
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-stone-600 mb-2">New birds in the flock</h4>
            {stats.invitedUsers.length === 0 ? (
              <p className="text-[10px] italic text-stone-500">
                No hatchlings yet — share your link and watch the canopy grow.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {stats.invitedUsers.map((u) => (
                  <div key={u.id} className="flex items-center gap-2.5 rounded-full bg-[#f7ecd8]/80 border border-[#dcc9a0]/60 pl-2 pr-3.5 py-1.5">
                    {u.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={u.avatarUrl} alt={u.name} className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <span className="w-7 h-7 rounded-full bg-[#e8efda] flex items-center justify-center text-[#5f7d45]">
                        <FeatherIcon className="w-3.5 h-3.5" />
                      </span>
                    )}
                    <span className="text-[11px] font-semibold text-stone-800 truncate flex-1">{u.name}</span>
                    <span className="text-[9px] text-stone-500">
                      {new Date(u.joinedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </LogCluster>
  );
}

const inputCls =
  'w-full bg-[#f7ecd8] border border-[#dcc9a0] rounded-2xl px-3 py-2.5 text-xs text-stone-800 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-[#a08050]/60 focus:border-transparent resize-none transition-all';
const labelCls = 'text-[10px] font-semibold uppercase tracking-wider text-stone-600 mb-1 block';

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function ProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const [grammarOpen, setGrammarOpen] = useState(false);
  const [formBio, setFormBio] = useState('');
  const [formTraditions, setFormTraditions] = useState('');
  const [formFood, setFormFood] = useState('');
  const [formHistory, setFormHistory] = useState('');

  useEffect(() => {
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    async function load() {
      try {
        console.log('[Kakatua] Profile: fetching for user', session!.user.id);
        const result = await getUserProfileAction(session!.user.id);
        if (cancelled) return;
        if (result.success) {
          setProfile(result.data);
          console.log('[Kakatua] Profile: loaded profile for', result.data.name);
        } else {
          console.error('[Kakatua] Profile: action error:', result.error);
          setError(result.error);
        }
      } catch (err: any) {
        if (cancelled) return;
        console.error('[Kakatua] Profile: fetch failed:', err);
        setError(err?.message || 'Failed to load profile. Please try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [session?.user?.id]);

  async function loadProfile() {
    if (!session?.user?.id) return;
    try {
      const result = await getUserProfileAction(session.user.id);
      if (result.success) setProfile(result.data);
      else setError(result.error);
    } catch (err: any) {
      console.error('[Kakatua] Profile: reload failed:', err);
      setError(err?.message || 'Failed to load profile.');
    }
    setLoading(false);
  }

  function openEdit() {
    if (!profile) return;
    setFormBio(profile.bio || '');
    setFormTraditions(profile.traditions || '');
    setFormFood(profile.favoriteFood || '');
    setFormHistory(profile.historyInterest || '');
    setEditing(true);
    setSaveMsg('');
  }

  async function handleSave() {
    if (!session?.user?.id) return;
    setSaving(true);
    setSaveMsg('');
    try {
      const result = await updateUserProfileAction(session.user.id, {
        bio: formBio.trim() || null,
        traditions: formTraditions.trim() || null,
        favoriteFood: formFood.trim() || null,
        historyInterest: formHistory.trim() || null,
      });
      if (result.success) {
        setSaveMsg('Saved!');
        await loadProfile();
        setTimeout(() => { setEditing(false); setSaveMsg(''); }, 800);
      } else {
        setSaveMsg(result.error);
      }
    } catch (err: any) {
      console.error('[Kakatua] Profile: save failed:', err);
      setSaveMsg(err?.message || 'Failed to save. Please try again.');
    }
    setSaving(false);
  }

  const hasIdentity = profile && (profile.bio || profile.traditions || profile.favoriteFood || profile.historyInterest);
  const isProtectedAmbassador = profile?.isAmbassador && !!profile?.ambassadorRole;

  const identitySections = [
    { key: 'bio', label: 'About Me', icon: 'feather', color: '#5f7d45', bg: '#e8efda', text: profile?.bio },
    { key: 'traditions', label: 'Traditions', icon: 'leaf', color: '#a08050', bg: '#f3e8cf', text: profile?.traditions },
    { key: 'food', label: 'Favourite Food', icon: 'berry', color: '#b26a3a', bg: '#f7e0ce', text: profile?.favoriteFood },
    { key: 'history', label: 'History Interest', icon: 'twig', color: '#6f573d', bg: '#efe3cc', text: profile?.historyInterest },
  ].filter((s) => s.text && s.text.trim().length > 0);

  const tzLabel = profile ? `UTC ${profile.timezoneOffset >= 0 ? '+' : ''}${profile.timezoneOffset}` : '';

  return (
    <LayoutShell activeTab="profile" userId={session?.user?.id}>
      <div
        className="relative -mx-5 sm:-mx-8 lg:-mx-10 -mt-2 min-h-[calc(100dvh-4rem)] px-5 sm:px-8 lg:px-10 pb-36"
        style={NEST_FLOOR}
      >
        {/* ambient keyframes: sunlight pulse + drifting leaves */}
        <style>{`
          @keyframes nestGlow {
            0%, 100% { opacity: 0.55; transform: translate(-50%, 0) scale(1); }
            50% { opacity: 0.95; transform: translate(-50%, 0) scale(1.04); }
          }
          @keyframes nestFloat {
            0%, 100% { transform: translateY(0) rotate(-24deg); }
            50% { transform: translateY(-3px) rotate(-20deg); }
          }
        `}</style>
        {/* Scattered dry twigs & pressed leaves tucked into the spacing */}
        <div className="pointer-events-none absolute -top-2 left-[6%] w-16 h-16 text-[#7a5a33]/45">
          <DryBranchIcon className="w-full h-full" />
        </div>
        <div className="pointer-events-none absolute top-[24rem] right-[4%] w-14 h-14 text-[#8a6a3f]/40 rotate-[38deg]">
          <DryLeafIcon className="w-full h-full" />
        </div>
        <div className="pointer-events-none absolute top-[52rem] left-[5%] w-12 h-12 text-[#6b4c2b]/50 -rotate-[24deg]">
          <DryBranchIcon className="w-full h-full" flip />
        </div>
        <div className="pointer-events-none absolute bottom-40 right-[8%] w-12 h-12 text-[#8a6a3f]/35 rotate-[12deg]">
          <DryLeafIcon className="w-full h-full" />
        </div>

        <div className="relative z-10 flex flex-col gap-7">
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-9 h-9 border-2 border-[#c9ab72] border-t-[#8fae72] rounded-full animate-spin mb-4" />
              <p className="text-[11px] text-stone-200">Gathering twigs for your nest...</p>
            </div>
          )}

          {!loading && error && (
            <div className="bg-[#f7e0ce]/95 border border-[#b26a3a]/40 rounded-2xl px-4 py-3 text-[11px] text-[#a04a2a] text-center shadow-[0_10px_28px_rgba(12,7,2,0.4)]">
              <span className="material-symbols-outlined text-sm align-middle mr-1">error</span>
              {error}
            </div>
          )}

          {!loading && !error && !profile && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="material-symbols-outlined text-4xl text-[#d9b36a] mb-2">person_off</span>
              <p className="text-[11px] text-stone-300">Could not find your nest.</p>
            </div>
          )}

          {!loading && !error && profile && (
            <>
              {/* ─── Header: the woven heart of the nest ──────────────── */}
              <LogCluster className="-rotate-[0.5deg]">
                <div className="flex flex-col items-center text-center relative">
                  {/* warm diffused sunlight glowing down on the portrait */}
                  <div
                    className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[220px] rounded-full"
                    style={{
                      background:
                        'radial-gradient(closest-side, rgba(255,205,120,0.42), rgba(255,205,120,0.12) 60%, rgba(0,0,0,0) 75%)',
                      filter: 'blur(6px)',
                      animation: 'nestGlow 4.5s ease-in-out infinite',
                    }}
                  />

                  {/* ─── Woven twig portrait frame ─────────────────────── */}
                  <div className="relative w-[136px] h-[136px] mt-2 flex-shrink-0">
                    {/* halo */}
                    <div
                      className="absolute -inset-5 rounded-full"
                      style={{
                        background:
                          'radial-gradient(circle, rgba(255,214,140,0.50), rgba(217,164,65,0.18) 55%, rgba(0,0,0,0) 72%)',
                        filter: 'blur(3px)',
                      }}
                    />
                    {/* outer woven twig ring */}
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: [
                          'repeating-conic-gradient(from 0deg, #4a321c 0deg 9deg, #6b4c2b 9deg 15deg, #553a1e 15deg 26deg, #8a6a3f 26deg 32deg, #4a321c 32deg 40deg)',
                          'repeating-conic-gradient(from 12deg, rgba(255,228,180,0.22) 0deg 3deg, transparent 3deg 18deg)',
                          'repeating-conic-gradient(from 170deg, rgba(20,12,4,0.60) 0deg 2deg, transparent 2deg 24deg)',
                        ].join(','),
                        boxShadow:
                          '0 18px 34px rgba(12,7,2,0.60), 0 0 30px rgba(240,180,90,0.35), inset 0 0 0 2px rgba(255,236,190,0.28), inset 0 5px 12px rgba(20,12,4,0.65), inset 0 -3px 8px rgba(255,225,170,0.25)',
                      }}
                    />
                    {/* moss lining ring */}
                    <div
                      className="absolute inset-[9px] rounded-full"
                      style={{
                        background: 'radial-gradient(circle at 38% 30%, #8fae72, #5f7d45 62%, #4a5f34)',
                        boxShadow: 'inset 0 2px 6px rgba(30,20,6,0.55), inset 0 -1px 0 rgba(255,255,255,0.35)',
                      }}
                    />
                    {/* sawn wood-grain disc */}
                    <div
                      className="absolute inset-[15px] rounded-full overflow-hidden"
                      style={{
                        background: 'radial-gradient(circle at 45% 40%, #f4e5bc, #e0c892 55%, #cdb078)',
                        boxShadow: 'inset 0 4px 10px rgba(90,60,30,0.55)',
                      }}
                    >
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{ background: 'repeating-radial-gradient(circle at 45% 40%, rgba(122,90,51,0.30) 0 2px, transparent 2px 10px)' }}
                      />
                      <div
                        className="absolute inset-1.5 rounded-full"
                        style={{
                          background:
                            'conic-gradient(from 60deg, rgba(255,240,200,0.16) 0deg 60deg, transparent 60deg 180deg, rgba(255,240,200,0.12) 180deg 260deg, transparent 260deg 360deg)',
                          mixBlendMode: 'overlay',
                        }}
                      />
                    </div>
                    {/* photo */}
                    <div
                      className="absolute inset-[22px] rounded-full overflow-hidden bg-[#e8efda]"
                      style={{ boxShadow: 'inset 0 3px 8px rgba(30,20,6,0.50), 0 0 0 3px rgba(255,240,200,0.40)' }}
                    >
                      {profile.avatarUrl ? (
                        <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="w-full h-full flex items-center justify-center text-[#3f5a2e]">
                          <FeatherIcon className="w-7 h-7" />
                        </span>
                      )}
                    </div>
                    {/* pressed leaves nestled on the woven frame */}
                    <span className="absolute -top-1.5 -left-3 w-5 h-5 text-[#8a6a3f] -rotate-[24deg] drop-shadow-md animate-[nestFloat_6s_ease-in-out_infinite]">
                      <DryLeafIcon className="w-full h-full" />
                    </span>
                    <span className="absolute top-2 -right-3.5 w-4 h-4 text-[#5f7d45] rotate-[30deg] drop-shadow-md">
                      <LeafIcon className="w-full h-full" />
                    </span>
                    <span className="absolute -bottom-1.5 -left-2.5 w-4 h-4 text-[#a08050] rotate-[15deg] drop-shadow-md">
                      <DryLeafIcon className="w-full h-full" />
                    </span>
                    <span className="absolute -bottom-1 -right-2 w-4 h-4 text-[#c9775a] rotate-[40deg] drop-shadow-md">
                      <LeafIcon className="w-full h-full" />
                    </span>
                  </div>

                  {/* intertwined dry branches flanking the portrait */}
                  <span className="pointer-events-none absolute top-[30%] -left-12 w-24 h-24 text-[#6b4c2b]/70 -rotate-12">
                    <DryBranchIcon className="w-full h-full" flip />
                  </span>
                  <span className="pointer-events-none absolute top-[32%] -right-12 w-24 h-24 text-[#6b4c2b]/70 rotate-[24deg]">
                    <DryBranchIcon className="w-full h-full" />
                  </span>

                  {/* display name — the heart of the nest */}
                  <h2 className="mt-5 font-serif font-bold text-3xl sm:text-4xl text-stone-900 tracking-tight leading-tight break-words max-w-full">
                    {profile.name}
                  </h2>
                  <p className="mt-1.5 text-[12px] text-stone-600 truncate max-w-full">{profile.email}</p>

                  <div className="flex items-center gap-2.5 mt-3 flex-wrap justify-center">
                    <span className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${profile.status === 'active' ? 'bg-[#5f7d45] ring-2 ring-[#5f7d45]/30' : 'bg-[#b26a3a]'}`} />
                      <span className="text-[11px] text-stone-700 font-semibold capitalize">{profile.status}</span>
                    </span>
                    {profile.isAmbassador && profile.ambassadorRole && ROLE_LABELS[profile.ambassadorRole] && (
                      <span
                        className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1"
                        style={{ color: ROLE_LABELS[profile.ambassadorRole].color, backgroundColor: ROLE_LABELS[profile.ambassadorRole].bg }}
                      >
                        <span className="material-symbols-outlined text-[10px]">{ROLE_LABELS[profile.ambassadorRole].icon}</span>
                        {ROLE_LABELS[profile.ambassadorRole].label}
                      </span>
                    )}
                    {profile.isAmbassador && !profile.ambassadorRole && (
                      <span className="text-[10px] bg-[#f4e2b8] text-[#7a5a1e] px-2.5 py-1 rounded-full font-bold">Ambassador</span>
                    )}
                  </div>

                  <TwigDivider className="w-2/3 mt-4" />
                  <p className="text-[11px] italic text-stone-500 mt-2">« every nest has a story »</p>
                </div>
              </LogCluster>

              {/* ─── IDENTITY: Empty state → Create CTA ────────────────── */}
              {!hasIdentity && !editing && !isProtectedAmbassador && (
                <LogCluster className="rotate-[0.6deg]">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-[#f4e2b8]/70 flex items-center justify-center mb-3 shadow-inner">
                      <TwigIcon className="w-7 h-7 text-[#a08050]" />
                    </div>
                    <h3 className="text-sm font-bold text-stone-900 mb-1">Your cultural card is waiting</h3>
                    <p className="text-[11px] text-stone-600 leading-relaxed max-w-[80%] mb-4">
                      Share your traditions, flavours, and history with the flock. Every nest has a story — let yours be heard.
                    </p>
                    <Link
                      href="/profile/create-card"
                      className="bg-[#3f5a2e] hover:bg-[#2c4420] active:scale-[0.98] transition-all text-white font-semibold text-xs py-3 px-6 rounded-full flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(63,90,46,0.25)]"
                    >
                      <span className="material-symbols-outlined text-lg">add</span>
                      Create a Cultural Card
                    </Link>
                  </div>
                </LogCluster>
              )}

              {/* ─── IDENTITY: Filled state ────────────────────────────── */}
              {hasIdentity && !editing && (
                <LogCluster className="-rotate-[0.4deg]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-[#e8efda] flex items-center justify-center text-[#3f5a2e]">
                        <TwigIcon className="w-4 h-4" />
                      </span>
                      <h3 className="text-xs font-bold text-stone-900 tracking-tight">My Identity</h3>
                    </div>
                    {!isProtectedAmbassador ? (
                      <button
                        onClick={openEdit}
                        className="text-[11px] font-semibold text-stone-800 hover:text-stone-900 transition-colors flex items-center gap-1 bg-[#f4e2b8]/70 hover:bg-[#f4e2b8] px-3 py-1 rounded-full"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                        Edit
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold text-stone-700 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">shield</span>
                        Guardian
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    {identitySections.map((s, idx) => (
                      <React.Fragment key={s.key}>
                        <div className="flex gap-2.5 items-start">
                          <span
                            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                            style={{ color: s.color, backgroundColor: s.bg }}
                          >
                            {ICONS[s.icon]}
                          </span>
                          <div className="min-w-0">
                            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-stone-600">{s.label}</h4>
                            {s.key === 'bio' ? (
                              <ReedFrame>
                                <p className="text-xs text-stone-800 leading-relaxed">{s.text}</p>
                              </ReedFrame>
                            ) : (
                              <p className="text-xs text-stone-800 leading-relaxed mt-0.5">{s.text}</p>
                            )}
                          </div>
                        </div>
                        {idx < identitySections.length - 1 && <TwigDivider className="my-1.5" />}
                      </React.Fragment>
                    ))}
                  </div>
                </LogCluster>
              )}

              {/* ─── IDENTITY: Edit form ───────────────────────────────── */}
              {editing && (
                <LogCluster className="rotate-[0.4deg]">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-8 h-8 rounded-full bg-[#f4e2b8] flex items-center justify-center text-[#8a6d4d]">
                      <FeatherIcon className="w-4 h-4" />
                    </span>
                    <h3 className="text-xs font-bold text-stone-900">Edit Your Card</h3>
                  </div>

                  <div className="flex flex-col gap-3.5">
                    <div>
                      <label className={labelCls}>About You</label>
                      <textarea
                        value={formBio}
                        onChange={(e) => setFormBio(e.target.value)}
                        placeholder="A short bio — who are you beyond the nest?"
                        rows={2}
                        className={inputCls}
                      />
                    </div>

                    <div>
                      <label className={labelCls}>Traditions</label>
                      <textarea
                        value={formTraditions}
                        onChange={(e) => setFormTraditions(e.target.value)}
                        placeholder="What customs or rituals are meaningful to you?"
                        rows={2}
                        className={inputCls}
                      />
                    </div>

                    <div>
                      <label className={labelCls}>Favourite Food</label>
                      <textarea
                        value={formFood}
                        onChange={(e) => setFormFood(e.target.value)}
                        placeholder="A dish that tells a story about your culture?"
                        rows={2}
                        className={inputCls}
                      />
                    </div>

                    <div>
                      <label className={labelCls}>History Interest</label>
                      <textarea
                        value={formHistory}
                        onChange={(e) => setFormHistory(e.target.value)}
                        placeholder="What piece of history or culture fascinates you?"
                        rows={2}
                        className={inputCls}
                      />
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 bg-[#3f5a2e] hover:bg-[#2c4420] active:scale-[0.98] disabled:opacity-50 transition-all text-white font-semibold text-xs py-2.5 px-4 rounded-full flex items-center justify-center gap-1.5 shadow-[0_8px_18px_rgba(63,90,46,0.2)]"
                      >
                        {saving ? (
                          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <span className="material-symbols-outlined text-sm">check</span>
                        )}
                        {saveMsg === 'Saved!' ? 'Saved!' : 'Save Changes'}
                      </button>
                      <button
                        onClick={() => { setEditing(false); setSaveMsg(''); }}
                        className="text-[11px] font-medium text-stone-600 hover:text-stone-800 transition-colors px-3 py-2.5"
                      >
                        Cancel
                      </button>
                    </div>
                    {saveMsg && saveMsg !== 'Saved!' && (
                      <p className="text-[10px] text-[#a04a2a] text-center">{saveMsg}</p>
                    )}
                  </div>
                </LogCluster>
              )}

              {/* ─── Log: Nest Languages (smooth pebbles) ──────────────── */}
              <LogCluster className="-rotate-[0.7deg]">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-8 h-8 rounded-full bg-[#e8efda] flex items-center justify-center text-[#5f7d45]">
                    <EggIcon className="w-4 h-4" />
                  </span>
                  <h3 className="text-xs font-bold text-stone-900 tracking-tight">Nest Languages</h3>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  {profile.nativeLanguages.map((l) => (
                    <Pebble key={l} tone="moss">
                      <EggIcon className="w-3 h-3 text-[#2e4a21]" /> {l}
                    </Pebble>
                  ))}
                  {profile.nativeLanguages.length > 0 && profile.learningLanguages.length > 0 && (
                    <span className="text-[#a08050] rotate-45 flex-shrink-0">
                      <TwigIcon className="w-4 h-4" />
                    </span>
                  )}
                  {profile.learningLanguages.map((l) => (
                    <Pebble key={l} tone="clay">
                      <EggIcon className="w-3 h-3 text-[#7a3d1a]" /> {l}
                    </Pebble>
                  ))}
                  {profile.nativeLanguages.length === 0 && profile.learningLanguages.length === 0 && (
                    <span className="text-[11px] text-stone-500">No languages lined up yet — visit Nest Settings to add eggs.</span>
                  )}
                </div>
              </LogCluster>

              {/* ─── Log: Interests (bark chips & dried leaves) ────────── */}
              <LogCluster className="rotate-[0.8deg]">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-8 h-8 rounded-full bg-[#f7e0ce] flex items-center justify-center text-[#b26a3a]">
                    <BerryIcon className="w-4 h-4" />
                  </span>
                  <h3 className="text-xs font-bold text-stone-900 tracking-tight">Nest Berries</h3>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {profile.interests.map((i) => (
                    <Pebble key={i} tone="bark">
                      <DryLeafIcon className="w-3 h-3 text-[#5f7d45]" /> {i}
                    </Pebble>
                  ))}
                  {profile.interests.length === 0 && (
                    <span className="text-[11px] text-stone-500">The berry basket is empty — add interests in Nest Settings.</span>
                  )}
                </div>
              </LogCluster>

              {/* ─── Log: Nest Rhythm (timezone + grass calendar) ──────── */}
              <LogCluster className="-rotate-[0.5deg]">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-8 h-8 rounded-full bg-[#f4e2b8] flex items-center justify-center text-[#8a6d4d]">
                    <GrassTuftIcon className="w-4 h-4" />
                  </span>
                  <h3 className="text-xs font-bold text-stone-900 tracking-tight">Nest Rhythm</h3>
                </div>

                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="bg-[#f4e2b8] text-stone-800 px-3 py-1.5 rounded-full text-[11px] font-bold">{tzLabel}</span>
                  <p className="text-[10px] text-stone-600">
                    Your perch stays on this clock. Availability slots are tuned in{' '}
                    <span className="font-semibold text-stone-800">Nest Settings</span>.
                  </p>
                </div>

                {/* weekly grass calendar */}
                <div
                  className="rounded-2xl p-3"
                  style={{
                    background: 'linear-gradient(180deg,#efdfba,#e6d2a6)',
                    boxShadow: 'inset 0 2px 6px rgba(90,60,30,0.18)',
                  }}
                >
                  <div className="grid grid-cols-7 gap-1.5">
                    {DAYS.map((d, i) => (
                      <div key={`h-${i}`} className="text-center text-[9px] font-bold uppercase tracking-wider text-stone-600">
                        {d}
                      </div>
                    ))}
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((i) => (
                      <GrassCell key={`c-${i}`} active={i % 3 === 1} />
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-3 justify-center">
                    <GrassTuftIcon className="w-4 h-3 text-[#8a6a3f]" />
                    <p className="text-[9px] italic text-stone-500">each slot is a blade of the nest</p>
                  </div>
                </div>
              </LogCluster>

              {/* ─── Warm CTAs ─────────────────────────────────────────── */}
              <button
                onClick={() => setGrammarOpen(true)}
                className="w-full -rotate-[0.3deg] rounded-[26px] bg-[#faf1dd] border border-[#e5c98d]/50 px-4 py-3.5 flex items-center gap-3 shadow-[0_10px_26px_rgba(12,7,2,0.45)] transition-all hover:shadow-[0_16px_36px_rgba(12,7,2,0.6)] hover:-translate-y-0.5 group"
              >
                <span className="w-9 h-9 rounded-full bg-[#f4e2b8] flex items-center justify-center text-[#8a6d4d] flex-shrink-0 group-hover:rotate-6 transition-transform">
                  <FeatherIcon className="w-4 h-4" />
                </span>
                <span className="text-left min-w-0">
                  <span className="block text-xs font-bold text-stone-900">Polishing My Wings</span>
                  <span className="block text-[10px] text-stone-600 mt-0.5">Grammar & style check for your writing</span>
                </span>
                <span className="material-symbols-outlined text-lg text-stone-500 group-hover:text-stone-700 transition-colors ml-auto">arrow_forward</span>
              </button>

              <Link
                href="/profile/settings"
                className="w-full rotate-[0.3deg] rounded-[26px] bg-[#faf1dd] border border-[#c8d4ae]/50 px-4 py-3.5 flex items-center gap-3 shadow-[0_10px_26px_rgba(12,7,2,0.45)] transition-all hover:shadow-[0_16px_36px_rgba(12,7,2,0.6)] hover:-translate-y-0.5 group"
              >
                <span className="w-9 h-9 rounded-full bg-[#e8efda] flex items-center justify-center text-[#5f7d45] flex-shrink-0 group-hover:rotate-6 transition-transform">
                  <span className="material-symbols-outlined text-lg">tune</span>
                </span>
                <span className="text-left min-w-0">
                  <span className="block text-xs font-bold text-stone-900">Nest Settings</span>
                  <span className="block text-[10px] text-stone-600 mt-0.5">Languages, availability, privacy & profile photo</span>
                </span>
                <span className="material-symbols-outlined text-lg text-stone-500 group-hover:text-stone-700 transition-colors ml-auto">arrow_forward</span>
              </Link>

              {/* ─── Refer a Friend ───────────────────────────────────── */}
              <ReferralSection userId={session!.user.id!} />
            </>
          )}
        </div>
      </div>
      <GrammarCheckModal isOpen={grammarOpen} onClose={() => setGrammarOpen(false)} />
    </LayoutShell>
  );
}
