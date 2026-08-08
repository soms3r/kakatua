// Shared "bird nest" UI kit (app/components/nestUI.tsx)
// Warm earth-tone primitives used across nest-themed pages: twig-bordered cards,
// smooth pebble tags, grass-strand progress bars, and organic SVG iconography.

import React from 'react';

// ─── Organic nest iconography (small custom SVGs) ────────────────────────────

export function EggIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 18" className={className} fill="currentColor" aria-hidden="true">
      <path d="M8 1.8C4.9 4.7 2.3 7.9 2.3 11 2.3 13.9 4.8 16.3 8 16.3s5.7-2.4 5.7-5.3C13.7 7.9 11.1 4.7 8 1.8z" />
      <ellipse cx="6.3" cy="9.5" rx="1" ry="1.5" fill="#ffffff" opacity="0.55" />
    </svg>
  );
}

export function LeafIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 18 18" className={className} fill="currentColor" aria-hidden="true">
      <path d="M3.2 14.8C3.2 7.8 7.2 2.6 15 3c-.5 6.8-5.2 11-11.8 11.8z" />
      <path d="M3.6 14.4C6.8 10.6 10.2 7.2 14.6 3.6" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.65" />
    </svg>
  );
}

export function BerryIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 18 18" className={className} fill="currentColor" aria-hidden="true">
      <circle cx="6" cy="10.6" r="4" />
      <circle cx="12" cy="7.6" r="3.2" />
      <circle cx="10.8" cy="13" r="2.2" />
      <path d="M6.2 6.4c1.4-2 3.6-3.2 5.9-3.2-1.1 2.4-3.1 3.6-5.9 3.2z" fill="#5f7d45" />
    </svg>
  );
}

export function TwigIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 18 18" className={className} fill="currentColor" aria-hidden="true">
      <path d="M2.8 15.2c4.5-3.6 8.6-7.4 11-10.8-2.2 3-5 6.4-8.4 9l-2.6 1.8z" />
      <path d="M5.4 13.4c2-1.6 4-3.4 6.6-6.2" stroke="currentColor" strokeWidth="1.1" fill="none" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

export function FeatherIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 18 18" className={className} fill="currentColor" aria-hidden="true">
      <path d="M3 15.2c3-5.2 6.8-8.9 11.8-10.9C13.6 8.9 10.4 12.4 6 15l-3 .2z" />
      <path d="M4.2 13.4L10.8 6.8" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

// Pressed, dried leaf — warm parchment brown with a delicate midrib.
export function DryLeafIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="currentColor" aria-hidden="true">
      <path d="M10 2C6.2 4.8 3.6 8.4 3.6 12.2 3.6 15.4 6.4 18 10 18s6.4-2.6 6.4-5.8C16.4 8.4 13.8 4.8 10 2z" />
      <path d="M10 4.5V16.5" stroke="#5d4222" strokeWidth="1.1" fill="none" strokeLinecap="round" opacity="0.6" />
      <path d="M10 7.5L6.6 10.2M10 9.8L13.2 7M10 11.5L7.2 13.8M10 13.2L12.4 11.4" stroke="#5d4222" strokeWidth="0.8" fill="none" strokeLinecap="round" opacity="0.45" />
    </svg>
  );
}

// A bare, dry branch with a few small offshoots.
export function DryBranchIcon({ className = '', flip = false }: { className?: string; flip?: boolean }) {
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
export function GrassTuftIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 16" className={className} fill="none" stroke="currentColor" aria-hidden="true">
      <path d="M4 15C3.5 9 5 4 8 1M10 15C10.5 8 11 4 13 2M16 15C17 9 18.5 6 21 5M2 15h20" strokeWidth="1.6" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
}

// ─── Twig divider ─────────────────────────────────────────────────────────────
export function TwigDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`} aria-hidden="true">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#a88755]" />
      <DryLeafIcon className="w-2.5 h-2.5 text-[#a88755]" />
      <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#a88755]" />
    </div>
  );
}

// ─── Twig-bordered card ───────────────────────────────────────────────────────
// A bark-toned woven frame hugging a warm cream panel. The lighter, everyday
// sibling of the profile page's heavy LogCluster.
export function TwigCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`relative rounded-[20px] p-[5px] overflow-hidden ${className}`}
      style={{
        background:
          'repeating-linear-gradient(45deg, #7a5a33 0 3px, #5d4222 3px 6px, #8a6a3f 6px 9px), repeating-linear-gradient(-45deg, rgba(255,225,170,0.14) 0 2px, transparent 2px 9px)',
        boxShadow: '0 10px 26px rgba(40,26,12,0.30), inset 0 1px 0 rgba(255,240,200,0.18)',
      }}
    >
      <div
        className="rounded-[15px] px-4 py-4 relative overflow-hidden"
        style={{
          background: 'linear-gradient(180deg,#faf0d7 0%,#f3e5c2 60%,#ecdcb4 100%)',
          boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.65), inset 0 -2px 6px rgba(90,60,30,0.14)',
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ─── Braided dry-reed frame ───────────────────────────────────────────────────
export function ReedFrame({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-[18px] p-[6px] ${className}`}
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
export function Pebble({
  children,
  tone = 'moss',
  className = '',
}: {
  children: React.ReactNode;
  tone?: 'moss' | 'clay' | 'bark';
  className?: string;
}) {
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

// ─── Grass-strand progress bar ────────────────────────────────────────────────
// A rounded bark-toned track filled with interwoven grass strands and dotted
// with smooth pebble markers.
export function GrassBar({
  value,
  max,
  tone = 'moss',
}: {
  value: number;
  max: number;
  tone?: 'moss' | 'clay' | 'sunrise';
}) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;

  const fill: Record<string, string> = {
    moss: 'repeating-linear-gradient(45deg, #5f7d45 0 4px, #7d9f5e 4px 8px, #4a5f34 8px 12px)',
    clay: 'repeating-linear-gradient(45deg, #c9935f 0 4px, #d9ab72 4px 8px, #a76f3e 8px 12px)',
    sunrise: 'repeating-linear-gradient(45deg, #d9b25c 0 4px, #e8c67a 4px 8px, #b98a3e 8px 12px)',
  };

  return (
    <div
      className="relative h-3 rounded-full overflow-hidden"
      style={{
        background: 'linear-gradient(90deg,#e3d4b0,#d9c9a4)',
        boxShadow: 'inset 0 2px 4px rgba(90,60,30,0.40), inset 0 -1px 0 rgba(255,255,255,0.35)',
      }}
    >
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{
          width: `${pct}%`,
          background: fill[tone],
          boxShadow: '0 0 8px rgba(255,240,200,0.45)',
        }}
      />
      {/* pebble markers strung along the track */}
      <div className="absolute inset-0 flex items-center justify-between px-[8%] pointer-events-none">
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className="w-1 h-1 rounded-full bg-[#fffdf8]/70" />
        ))}
      </div>
    </div>
  );
}
