'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import FeedbackModal from './FeedbackModal';
import Footer from './Footer';

interface LayoutShellProps {
  children: React.ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  userId?: string;
}

const tabs = [
  { id: 'home', label: 'Nest', icon: 'home', href: '/' },
  { id: 'discover', label: 'Discover', icon: 'explore', href: '/discover' },
  { id: 'activity', label: 'Activity', icon: 'timeline', href: '/activity' },
  { id: 'missions', label: 'Missions', icon: 'rocket_launch', href: '/missions' },
  { id: 'guardians', label: 'Guardians', icon: 'support_agent', href: '/guardians' },
  { id: 'profile', label: 'Profile', icon: 'person', href: '/profile' },
];

export default function LayoutShell({ children, activeTab = 'home', onTabChange, userId }: LayoutShellProps) {
  const { data: session } = useSession();
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const handleTabClick = (tabId: string) => {
    console.log('[Kakatua] Navigating to:', tabId);
    if (onTabChange) {
      onTabChange(tabId);
    }
  };

  return (
    <div className="min-h-screen bg-[#eae8e4] flex flex-col font-sans antialiased text-[#1b1c1a]">
      <div className="w-full max-w-7xl mx-auto bg-[#fbf9f5] sm:shadow-[0_20px_50px_rgba(21,66,18,0.15)] sm:rounded-[32px] overflow-hidden flex flex-col relative h-dvh sm:h-auto sm:min-h-screen sm:my-6 border-0 sm:border sm:border-[#dbdad6]">

        <header className="h-16 flex items-center justify-between px-6 sm:px-8 lg:px-10 bg-[#fbf9f5]/80 backdrop-blur-md border-b border-[#efeeea] sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#2D5A27] text-2xl">nest_eco_leaf</span>
            <span className="font-semibold text-lg tracking-tight text-[#154212]">Kakatua</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/legal"
              className="w-9 h-9 flex items-center justify-center rounded-full bg-[#f5f3ef] hover:bg-[#efeeea] active:scale-95 transition-all text-[#42493e]"
            >
              <span className="material-symbols-outlined text-xl">info</span>
            </Link>
            <button className="w-9 h-9 flex items-center justify-center rounded-full bg-[#f5f3ef] hover:bg-[#efeeea] active:scale-95 transition-all text-[#42493e]">
              <span className="material-symbols-outlined text-xl">notifications</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-[#2d5a27] border-2 border-[#a1d494] overflow-hidden">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCkc4r1Fu4jTuEkCgJlwCfujDO-dFyEawzA2yEXEcNUJ63ey5-tofexj9BTU3iKPQzjjdrGVuCnUpaLnTm5XAw5iR4qsppIE5-BS8Ff7wOz_FlD5_Qf9p8GFFf2uB1ZsQyYzG2F26jvBFJ07FYCnO0kLSk-Yy11kUUAAQVeAS2DSvCpeRn_YG15Lwh_0t0wGUNKZv8ZLY-DUyEvVE1fuU-KDyy4xcXe7zDP-xc2FkROupFQXAKWmFjRUhu2iQ6PPx4-jKEK2jCNDVFc"
                alt="My Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto pb-28 pt-2 scroll-smooth scrollbar-none px-5 sm:px-8 lg:px-10">
          {children}
        </main>

        <button
          onClick={() => setFeedbackOpen(true)}
          className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 text-[10px] font-medium text-[#72796e] hover:text-[#2D5A27] active:scale-95 transition-all px-3 py-1 rounded-full bg-[#fbf9f5]/70 backdrop-blur-sm border border-[#efeeea] hover:border-[#a1d494]/50"
        >
          <span className="material-symbols-outlined text-[13px]">forum</span>
          Tell the Flock
        </button>

        <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pointer-events-none">
          <nav className="pointer-events-auto mx-auto w-full max-w-[480px] flex items-center justify-around py-3 px-4 bg-[#fbf9f5]/90 backdrop-blur-xl border border-[#c2c9bb]/40 rounded-full shadow-[0_12px_32px_rgba(21,66,18,0.14)]">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  onClick={() => handleTabClick(tab.id)}
                  className={`flex flex-col items-center justify-center w-14 h-12 rounded-2xl transition-all duration-300 relative ${
                    isActive
                      ? 'text-[#154212] font-semibold scale-105'
                      : 'text-[#42493e] hover:text-[#1b1c1a]'
                  }`}
                >
                  <span className={`material-symbols-outlined text-2xl transition-transform ${
                    isActive ? 'font-fill translate-y-[-2px]' : ''
                  }`}>
                    {tab.icon}
                  </span>
                  <span className="text-[10px] mt-0.5 tracking-wide">{tab.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 w-2 h-1 bg-[#2D5A27] rounded-full animate-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

      </div>

      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} userId={userId || session?.user?.id} />
      <Footer />
    </div>
  );
}
