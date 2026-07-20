'use client';

import React from 'react';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-[#efeeea] bg-[#fbf9f5] px-5 py-5 mt-4">
      <div className="flex flex-col items-center gap-3 text-center">
        {/* Brand */}
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[#2D5A27] text-base">nest_eco_leaf</span>
          <span className="text-xs font-semibold text-[#154212] tracking-tight">Kakatua</span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-4 text-[11px]">
          <a href="/legal" className="text-[#72796e] hover:text-[#2D5A27] transition-colors">
            Legal
          </a>
          <span className="w-px h-3 bg-[#dbdad6]" />
          <a href="/legal/privacy" className="text-[#72796e] hover:text-[#2D5A27] transition-colors">
            Privacy
          </a>
          <span className="w-px h-3 bg-[#dbdad6]" />
          <a href="/legal/about" className="text-[#72796e] hover:text-[#2D5A27] transition-colors">
            About
          </a>
        </div>

        {/* Tagline + Copyright */}
        <p className="text-[10px] text-[#b0b0b0] leading-relaxed max-w-[280px]">
          Every nest has a story. Fly together, learn together.
        </p>
        <p className="text-[10px] text-[#b0b0b0]">
          &copy; {year} Kakatua. Everyone belongs here.
        </p>
      </div>
    </footer>
  );
}
