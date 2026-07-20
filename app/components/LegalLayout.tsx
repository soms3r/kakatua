import Link from 'next/link';
import React from 'react';

interface LegalLayoutProps {
  title: string;
  icon?: string;
  children: React.ReactNode;
}

export default function LegalLayout({ title, icon = 'info', children }: LegalLayoutProps) {
  return (
    <div className="min-h-screen bg-[#eae8e4] flex flex-col font-sans antialiased text-[#1b1c1a]">
      <div className="w-full max-w-7xl mx-auto bg-[#fbf9f5] sm:shadow-[0_20px_50px_rgba(21,66,18,0.15)] sm:rounded-[32px] flex flex-col relative h-dvh sm:h-auto sm:min-h-screen sm:my-6 border-0 sm:border sm:border-[#dbdad6]">
        <header className="h-14 sm:h-16 flex items-center gap-3 px-5 sm:px-8 lg:px-10 bg-[#fbf9f5]/80 backdrop-blur-md border-b border-[#efeeea] sticky top-0 z-30 sm:rounded-t-[32px]">
          <Link
            href="/legal"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-[#f5f3ef] hover:bg-[#efeeea] active:scale-90 transition-all text-[#42493e]"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#2D5A27] text-2xl">{icon}</span>
            <span className="font-semibold text-lg tracking-tight text-[#154212]">{title}</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto scroll-smooth scrollbar-none px-5 sm:px-8 lg:px-10 py-6">
          <div className="max-w-none text-[#42493e] leading-relaxed space-y-3 text-sm sm:text-base">
            {children}
          </div>
        </main>

        <footer className="px-5 sm:px-8 lg:px-10 py-3 sm:py-4 border-t border-[#efeeea] flex items-center justify-between text-[10px] text-[#72796e]">
          <span>Kakatua — Language & Culture Exchange</span>
          <Link href="/" className="hover:text-[#2D5A27] transition-colors font-medium">
            Back to Nest
          </Link>
        </footer>
      </div>
    </div>
  );
}
