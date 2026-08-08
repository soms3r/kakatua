// React Component: MatchmakingStatus (app/components/MatchmakingStatus.tsx)
'use client';

import React, { useEffect, useState } from 'react';
import type { MatchedUserData } from '../actions/findAKakatua';

interface MatchmakingStatusProps {
  onCancel: () => void;
  match?: MatchedUserData | null;
}

const STATUS_MESSAGES = [
  'Scanning the canopy for a compatible language partner...',
  'Soaring through the clouds, listening for native speakers...',
  'Circling the nests to find your perfect flock...',
  'Warming your nest for a brand-new conversation...',
  'Following the wind toward a new language exchange...',
];

export default function MatchmakingStatus({ onCancel, match }: MatchmakingStatusProps) {
  const [seconds, setSeconds] = useState(0);
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const cycle = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % STATUS_MESSAGES.length);
    }, 3000);
    return () => clearInterval(cycle);
  }, []);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (match) {
    return <MatchFoundOverlay partner={match} onCancel={onCancel} elapsed={seconds} />;
  }

  return (
    <div className="w-full h-[600px] relative overflow-hidden rounded-[28px] border border-[#efeeea] shadow-[0_8px_32px_rgba(21,66,18,0.04)] animate-fade-in bg-gradient-to-b from-[#8ab8dd] via-[#c6e4f2] to-[#fdeecb]">
      {/* Sky keyframes */}
      <style>{`
        @keyframes cloudDrift {
          0%   { left: -180px; }
          100% { left: 110%; }
        }
        @keyframes floatUp {
          0%   { transform: translate(0, 0) rotate(0deg); opacity: 0; }
          15%  { opacity: 0.7; }
          80%  { opacity: 0.5; }
          100% { transform: translate(48px, -540px) rotate(320deg); opacity: 0; }
        }
        @keyframes glideAcross {
          0%   { left: -120px; top: 12%; transform: scaleX(1); }
          45%  { top: 20%; }
          100% { left: 112%; top: 8%; transform: scaleX(1); }
        }
        @keyframes bobSway {
          0%, 100% { transform: translateY(0) rotate(-3deg); }
          50%      { transform: translateY(-8px) rotate(3deg); }
        }
        @keyframes pulseMsg {
          0%   { opacity: 0; transform: translateY(6px); }
          15%  { opacity: 1; transform: translateY(0); }
          85%  { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-6px); }
        }
        @keyframes spinRays {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .drift-cloud {
          position: absolute;
          background: rgba(255, 255, 255, 0.85);
          border-radius: 999px;
          filter: blur(2px);
          pointer-events: none;
          animation: cloudDrift linear infinite;
        }
        .sky-leaf {
          position: absolute;
          bottom: -40px;
          color: #2d5a27;
          pointer-events: none;
          animation: floatUp ease-in infinite;
        }
        .sky-glider {
          position: absolute;
          pointer-events: none;
          animation: glideAcross 16s ease-in-out infinite;
        }
        .nest-bird {
          animation: bobSway 3.2s ease-in-out infinite;
          transform-origin: center bottom;
        }
        .status-line {
          animation: pulseMsg 3s ease-in-out infinite;
        }
        .connect-shimmer {
          background: linear-gradient(90deg, #2d5a27 20%, #7dbf4f 40%, #f7c948 60%, #2d5a27 80%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 2.2s linear infinite;
        }
      `}</style>

      {/* Soft sun glow */}
      <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-[#fff3c4]/70 blur-2xl pointer-events-none" />

      {/* Drifting clouds */}
      <div className="drift-cloud w-40 h-8 top-8 [animation-duration:26s]" />
      <div className="drift-cloud w-24 h-5 top-20 [animation-duration:20s] [animation-delay:-8s]" />
      <div className="drift-cloud w-56 h-10 top-2/3 [animation-duration:34s] [animation-delay:-16s]" />
      <div className="drift-cloud w-20 h-4 top-3/4 [animation-duration:18s] [animation-delay:-4s]" />

      {/* Migrating bird gliding across the sky */}
      <div className="sky-glider">
        <svg viewBox="0 0 120 60" className="w-14 h-7">
          <path d="M2 32 C14 20 30 22 44 27 L66 10 L62 30 L92 32 L62 35 L66 55 L44 38 C30 43 14 45 2 32 Z" fill="#ffffff" opacity="0.9" />
        </svg>
      </div>

      {/* Floating leaves / feathers */}
      <span className="material-symbols-outlined sky-leaf f1 text-2xl [animation-duration:9s]">nest_eco_leaf</span>
      <span className="material-symbols-outlined sky-leaf f2 text-lg [animation-duration:12s] [animation-delay:-4s] left-1/4">air</span>
      <span className="material-symbols-outlined sky-leaf f3 text-3xl [animation-duration:10s] [animation-delay:-7s] left-2/3">nest_eco_leaf</span>
      <span className="material-symbols-outlined sky-leaf f4 text-xl [animation-duration:13s] [animation-delay:-2s] left-1/2">feather</span>

      <div className="absolute inset-0 flex flex-col items-center justify-between p-6 z-10">
        {/* Header */}
        <div className="w-full flex justify-between items-center">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#42493e] bg-white/80 backdrop-blur px-3 py-1 rounded-full">
            Queue airborne
          </span>
          <div className="flex items-center gap-1.5 text-xs text-[#1b1c1a] font-semibold bg-white/60 backdrop-blur px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-[#2d5a27] animate-ping" />
            <span>Searching...</span>
          </div>
        </div>

        {/* Centerpiece: radiant nest with swaying bird */}
        <div className="flex flex-col items-center justify-center flex-1 py-10">
          <div className="relative w-44 h-44 flex items-center justify-center">
            {/* Rotating sun rays */}
            <div className="absolute inset-[-24px] opacity-40" style={{ animation: 'spinRays 40s linear infinite' }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute left-1/2 top-1/2 w-[3px] h-24 -translate-x-1/2 origin-bottom rounded-full bg-[#f7c948]/70"
                  style={{ transform: `translateX(-50%) rotate(${i * 30}deg)`, transformOrigin: 'bottom' }}
                />
              ))}
            </div>

            <div className="absolute w-36 h-36 border border-white/50 rounded-full animate-ping" />
            <div className="absolute w-32 h-32 border border-[#2d5a27]/25 rounded-full animate-pulse" />

            <div className="nest-bird relative w-28 h-28 bg-white/80 backdrop-blur rounded-full border border-white shadow-[0_8px_32px_rgba(45,90,39,0.18)] flex items-center justify-center">
              <svg viewBox="0 0 120 60" className="w-16 h-8">
                <path d="M2 32 C14 20 30 22 44 27 L66 10 L62 30 L92 32 L62 35 L66 55 L44 38 C30 43 14 45 2 32 Z" fill="#2d5a27" />
              </svg>
            </div>
          </div>

          <h3 className="font-bold text-lg text-[#1b1c1a] tracking-tight mt-8">Gathering the Flock</h3>
          <div className="relative w-full max-w-[80%] h-10 mt-2 overflow-hidden">
            <p key={msgIndex} className="status-line absolute inset-x-0 text-xs text-[#42493e] text-center leading-relaxed">
              {STATUS_MESSAGES[msgIndex]}
            </p>
          </div>

          {/* Dynamic Timer */}
          <div className="bg-white/80 backdrop-blur border border-white rounded-full px-4 py-1.5 mt-5 flex items-center gap-2 shadow-sm">
            <span className="material-symbols-outlined text-sm text-[#42493e]">hourglass_empty</span>
            <span className="font-mono text-xs font-bold text-[#1b1c1a]">{formatTime(seconds)}</span>
          </div>
        </div>

        {/* Cancel Button */}
        <div className="w-full">
          <button
            onClick={onCancel}
            className="w-full bg-white/85 backdrop-blur hover:bg-[#ffdad6] active:scale-95 transition-all text-[#ba1a1a] font-semibold text-xs py-3 px-6 rounded-full flex items-center justify-center gap-1.5 border border-[#ffdad6]"
          >
            <span className="material-symbols-outlined text-sm">flight_land</span>
            Fold My Wings (Leave Queue)
          </button>
        </div>
      </div>
    </div>
  );
}

function MatchFoundOverlay({
  partner,
  onCancel,
  elapsed,
}: {
  partner: MatchedUserData;
  onCancel: () => void;
  elapsed: number;
}) {
  const avatarLetter = (partner.name || '?').charAt(0).toUpperCase();
  const native = partner.nativeLanguages.join(', ');
  const learning = partner.learningLanguages.join(', ');
  const interests = partner.interests.slice(0, 3);

  return (
    <div className="w-full h-[600px] relative overflow-hidden rounded-[28px] border border-[#efeeea] shadow-[0_8px_32px_rgba(21,66,18,0.04)] animate-fade-in bg-gradient-to-b from-[#8ab8dd] via-[#c6e4f2] to-[#fdeecb]">
      <style>{`
        @keyframes cloudDrift {
          0%   { left: -180px; }
          100% { left: 110%; }
        }
        .drift-cloud {
          position: absolute;
          background: rgba(255, 255, 255, 0.85);
          border-radius: 999px;
          filter: blur(2px);
          pointer-events: none;
          animation: cloudDrift linear infinite;
        }
        @keyframes ringBurst {
          0%   { transform: scale(0.6); opacity: 0.9; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .burst-ring { animation: ringBurst 1.4s ease-out infinite; }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .connect-shimmer {
          background: linear-gradient(90deg, #2d5a27 20%, #7dbf4f 40%, #f7c948 60%, #2d5a27 80%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 2.2s linear infinite;
        }
      `}</style>

      <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-[#fff3c4]/70 blur-2xl pointer-events-none" />
      <div className="drift-cloud w-40 h-8 top-8 [animation-duration:26s]" />
      <div className="drift-cloud w-24 h-5 top-20 [animation-duration:20s] [animation-delay:-8s]" />

      <div className="absolute inset-0 flex flex-col items-center justify-between p-6 z-10">
        <div className="w-full flex justify-between items-center">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#2d5a27] bg-white/80 backdrop-blur px-3 py-1 rounded-full">
            Wings aligned
          </span>
          <span className="font-mono text-[10px] text-[#42493e] bg-white/60 backdrop-blur px-3 py-1 rounded-full">
            Matched in {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')}
          </span>
        </div>

        <div className="flex flex-col items-center justify-center flex-1 py-10">
          <div className="relative w-32 h-32 flex items-center justify-center mb-6">
            <div className="burst-ring absolute w-32 h-32 border-2 border-[#2d5a27]/40 rounded-full" />
            <div className="absolute w-32 h-32 border border-[#f7c948]/70 rounded-full animate-ping [animation-duration:1.6s]" />
            <div className="relative w-24 h-24 rounded-full border-4 border-[#2d5a27] shadow-[0_8px_32px_rgba(45,90,39,0.25)] overflow-hidden bg-white flex items-center justify-center">
              {partner.avatarUrl ? (
                <img src={partner.avatarUrl} alt={partner.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-[#2d5a27]">{avatarLetter}</span>
              )}
            </div>
          </div>

          <h3 className="font-bold text-xl text-[#1b1c1a] tracking-tight text-center">
            You matched with <span className="text-[#2d5a27]">{partner.name}</span>!
          </h3>
          <p className="text-xs text-[#42493e] text-center max-w-[85%] mt-2 leading-relaxed">
            A fellow bird was circling your nest, waiting for this conversation.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
            <span className="text-[10px] font-bold text-[#2d5a27] bg-[#bcf0ae]/60 px-3 py-1 rounded-full">Speaks: {native}</span>
            <span className="text-[10px] font-bold text-[#7b5800] bg-[#fdeecb] px-3 py-1 rounded-full">Learning: {learning}</span>
          </div>

          {interests.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3">
              {interests.map((interest) => (
                <span key={interest} className="text-[10px] text-[#72796e] bg-white/80 px-2.5 py-1 rounded-full">#{interest}</span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 mt-6">
            <span className="material-symbols-outlined text-[#f7c948] text-lg">mood</span>
            <span className="text-xs font-semibold text-[#1b1c1a] bg-white/80 px-3 py-1.5 rounded-full">
              Nest harmony score: {partner.compatibilityScore}
            </span>
          </div>

          <div className="connect-shimmer text-sm font-bold tracking-wide mt-7 flex items-center gap-2">
            <span className="material-symbols-outlined">videocam</span>
            Entering video call...
          </div>
        </div>

        <div className="w-full">
          <button
            onClick={onCancel}
            className="w-full bg-white/85 backdrop-blur hover:bg-[#ffdad6] active:scale-95 transition-all text-[#ba1a1a] font-semibold text-xs py-3 px-6 rounded-full flex items-center justify-center gap-1.5 border border-[#ffdad6]"
          >
            <span className="material-symbols-outlined text-sm">call_end</span>
            Skip &amp; Fold My Wings
          </button>
        </div>
      </div>
    </div>
  );
}
