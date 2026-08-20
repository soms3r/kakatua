'use client';

import React, { useState } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <html lang="en">
      <body className="bg-[#fbf9f5] min-h-screen flex items-center justify-center font-sans antialiased text-[#1b1c1a] p-4">
        <div className="w-full max-w-md bg-[#fffdf8] rounded-[32px] border border-[#e0d2b3] shadow-[0_20px_50px_rgba(21,66,18,0.12)] overflow-hidden">
          {/* Decorative top strip */}
          <div className="h-2 bg-gradient-to-r from-[#154212] via-[#2D5A27] to-[#a1d494]" />

          <div className="px-8 pt-10 pb-8 flex flex-col items-center text-center">
            {/* Nest icon with a "fallen twig" vibe */}
            <div className="relative mb-5">
              <div className="w-20 h-20 rounded-full bg-[#f3ead6] flex items-center justify-center">
                <span className="material-symbols-outlined text-[#8a6d3b] text-4xl">
                  nest_eco_leaf
                </span>
              </div>
              {/* Small "twig" accent */}
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#e0d2b3] rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-[#8a6d3b] text-sm">
                  construction
                </span>
              </span>
            </div>

            <h2 className="text-base font-bold text-[#1b1c1a] mb-2 leading-snug">
              Uh-oh! A rogue twig fell out of the nest and startled the little Kakatua.
            </h2>
            <p className="text-xs text-[#72796e] leading-relaxed max-w-[280px] mb-6">
              We&apos;re patching the branches right now! Everything will be back to normal in a moment.
            </p>

            {/* Fly Back Home button */}
            <button
              onClick={reset}
              className="bg-gradient-to-r from-[#2D5A27] to-[#154212] hover:scale-105 active:scale-95 transition-all text-white font-semibold text-xs px-6 py-2.5 rounded-full shadow-md flex items-center gap-2 mb-4"
            >
              <span className="material-symbols-outlined text-sm">flight</span>
              Fly Back Home
            </button>

            {/* Collapsible technical drawer */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-[10px] text-[#b5aa93] hover:text-[#8a6d3b] transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[13px]">
                {showDetails ? 'expand_less' : 'expand_more'}
              </span>
              {showDetails ? 'Hide details' : 'Show technical details'}
            </button>

            {showDetails && (
              <div className="mt-3 w-full bg-[#f5f3ef] border border-[#e0d2b3] rounded-xl px-4 py-3 text-left">
                <p className="text-[10px] text-[#72796e] leading-relaxed font-mono break-all">
                  An error occurred in the Server Components render. The specific
                  message is omitted in production builds to avoid leaking
                  sensitive details.
                </p>
                {error?.digest && (
                  <p className="text-[9px] text-[#b5aa93] mt-2 font-mono">
                    Digest: {error.digest}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
