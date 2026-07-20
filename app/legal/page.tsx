import Link from 'next/link';
import React from 'react';
import LegalLayout from '../components/LegalLayout';

const cards = [
  {
    href: '/legal/terms',
    icon: 'description',
    title: 'Terms of Use',
    desc: 'How our flock operates — moderation, guidelines, and your responsibilities as a member.',
  },
  {
    href: '/legal/privacy',
    icon: 'lock',
    title: 'Privacy Policy',
    desc: 'What data we collect, how we store and protect it, and your rights over your information.',
  },
  {
    href: '/legal/about',
    icon: 'nest_eco_leaf',
    title: 'About Kakatua',
    desc: 'The mission, the nesting philosophy, and why we built this platform.',
  },
  {
    href: '/legal/credits',
    icon: 'favorite',
    title: 'Credits',
    desc: 'Open-source tools, frameworks, and contributors who make this nest possible.',
  },
];

export default function LegalHubPage() {
  return (
    <LegalLayout title="Transparency Suite" icon="info">
      <h1 className="text-lg font-bold text-[#154212] mt-0">Building in the Open</h1>
      <p className="text-sm text-[#72796e]">
        Transparency is part of our DNA. These pages document how Kakatua operates,
        what we stand for, and the tools that help us build this nest for language
        learners around the world.
      </p>

      <div className="flex flex-col gap-3 mt-6">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="flex items-center gap-4 p-4 bg-[#ffffff] border border-[#efeeea] rounded-2xl hover:border-[#a1d494]/50 hover:shadow-sm active:scale-[0.98] transition-all"
          >
            <span className="material-symbols-outlined text-[#2D5A27] text-2xl bg-[#bcf0ae]/30 p-2 rounded-xl">
              {card.icon}
            </span>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-sm text-[#1b1c1a]">{card.title}</h2>
              <p className="text-[11px] text-[#72796e] mt-0.5 leading-relaxed">{card.desc}</p>
            </div>
            <span className="material-symbols-outlined text-[#72796e] text-lg">chevron_right</span>
          </Link>
        ))}
      </div>
    </LegalLayout>
  );
}
