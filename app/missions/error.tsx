'use client';

import React from 'react';

export default function MissionsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-6">
      {/* Broken nest icon */}
      <div className="w-16 h-16 rounded-full bg-[#ffdad6]/60 flex items-center justify-center mb-5">
        <span className="material-symbols-outlined text-[#ba1a1a] text-3xl">
          nest_eco_leaf
        </span>
      </div>

      <h2 className="text-base font-bold text-[#1b1c1a] mb-2">
        A twig fell out of place!
      </h2>
      <p className="text-xs text-[#72796e] max-w-[260px] leading-relaxed mb-6">
        Let&apos;s rebuild this branch. Something went wrong while loading your
        flight deck.
      </p>

      {error?.digest && (
        <p className="text-[9px] text-[#b5aa93] mb-4 font-mono">
          Error: {error.digest}
        </p>
      )}

      <button
        onClick={reset}
        className="bg-gradient-to-r from-[#2D5A27] to-[#154212] hover:scale-105 active:scale-95 transition-all text-white font-semibold text-xs px-6 py-2.5 rounded-full shadow-md flex items-center gap-2"
      >
        <span className="material-symbols-outlined text-sm">refresh</span>
        Try again
      </button>
    </div>
  );
}
