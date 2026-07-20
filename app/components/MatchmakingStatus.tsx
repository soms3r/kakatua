// React Component: MatchmakingStatus (app/components/MatchmakingStatus.tsx)
'use client';

import React, { useEffect, useState } from 'react';

interface MatchmakingStatusProps {
  onCancel: () => void;
}

export default function MatchmakingStatus({ onCancel }: MatchmakingStatusProps) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full h-[600px] flex flex-col items-center justify-between p-6 bg-[#ffffff] border border-[#efeeea] rounded-[28px] shadow-[0_8px_32px_rgba(21,66,18,0.04)] animate-fade-in relative overflow-hidden">
      
      {/* 1. CSS Keyframe styles for nature floating animation */}
      <style>{`
        @keyframes drift {
          0% { transform: translateY(0px) rotate(0deg); opacity: 0.2; }
          50% { transform: translateY(-30px) rotate(180deg); opacity: 0.8; }
          100% { transform: translateY(-60px) rotate(360deg); opacity: 0; }
        }
        .feather-particle {
          position: absolute;
          animation: drift 4s infinite linear;
          color: #2D5A27;
        }
        .f1 { left: 15%; animation-delay: 0s; font-size: 24px; }
        .f2 { left: 45%; animation-delay: 1.5s; font-size: 18px; }
        .f3 { left: 75%; animation-delay: 3s; font-size: 28px; }
      `}</style>

      {/* Floating animated leaf/feather background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <span className="material-symbols-outlined feather-particle f1">nest_eco_leaf</span>
        <span className="material-symbols-outlined feather-particle f2">egg</span>
        <span className="material-symbols-outlined feather-particle f3">nest_eco_leaf</span>
      </div>

      <div className="w-full flex justify-between items-center z-10">
        <span className="text-[10px] uppercase font-bold tracking-wider text-[#72796e] bg-[#f5f3ef] px-3 py-1 rounded-full">
          Queue airborne
        </span>
        <div className="flex items-center gap-1.5 text-xs text-[#2d5a27] font-semibold">
          <span className="w-2 h-2 rounded-full bg-[#2d5a27] animate-ping" />
          <span>Searching...</span>
        </div>
      </div>

      {/* 2. Visual Centerpiece: Animating Nest */}
      <div className="flex flex-col items-center justify-center flex-1 py-12 z-10">
        <div className="relative w-40 h-40 flex items-center justify-center bg-[#f5f3ef] rounded-full border border-[#efeeea] shadow-inner mb-6">
          
          {/* Pulsing visual circles */}
          <div className="absolute w-32 h-32 border border-[#a1d494]/30 rounded-full animate-ping" />
          <div className="absolute w-28 h-28 border border-[#2d5a27]/20 rounded-full animate-pulse" />
          
          <span className="material-symbols-outlined text-5xl text-[#2d5a27] animate-bounce">
            flutter_dash
          </span>
        </div>

        <h3 className="font-bold text-lg text-[#1b1c1a] tracking-tight">Gathering the Flock</h3>
        <p className="text-xs text-[#72796e] text-center max-w-[80%] mt-2 leading-relaxed">
          We are scanning the nearby nests for a native speaker matching your learning targets.
        </p>

        {/* Dynamic Timer */}
        <div className="bg-[#f5f3ef] border border-[#efeeea] rounded-full px-4 py-1.5 mt-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-[#42493e]">hourglass_empty</span>
          <span className="font-mono text-xs font-bold text-[#1b1c1a]">{formatTime(seconds)}</span>
        </div>
      </div>

      {/* 3. Action Cancel Button */}
      <div className="w-full z-10">
        <button
          onClick={onCancel}
          className="w-full bg-[#ffdad6] hover:bg-[#ba1a1a]/20 active:scale-95 transition-all text-[#ba1a1a] font-semibold text-xs py-3 px-6 rounded-full flex items-center justify-center gap-1.5 border border-[#ffdad6]"
        >
          <span className="material-symbols-outlined text-sm">flight_land</span>
          Fold My Wings (Leave Queue)
        </button>
      </div>

    </div>
  );
}
