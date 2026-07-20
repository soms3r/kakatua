import React from 'react';
import LegalLayout from '../../components/LegalLayout';

const credits = [
  {
    category: 'Frameworks & Runtimes',
    items: [
      { name: 'Next.js 15', url: 'https://nextjs.org', desc: 'React framework for production-grade web applications with server-side rendering, static generation, and App Router.' },
      { name: 'React 19', url: 'https://react.dev', desc: 'UI library for building interactive, component-based user interfaces.' },
      { name: 'TypeScript 5.7', url: 'https://typescriptlang.org', desc: 'Typed superset of JavaScript that catches bugs at compile time and improves developer experience.' },
      { name: 'Node.js 22', url: 'https://nodejs.org', desc: 'JavaScript runtime powering our development toolchain and build pipeline.' },
    ],
  },
  {
    category: 'Database & ORM',
    items: [
      { name: 'Prisma 6', url: 'https://prisma.io', desc: 'Type-safe ORM providing auto-generated query APIs, migrations, and a single source of truth for our database schema.' },
      { name: 'PostgreSQL 16', url: 'https://postgresql.org', desc: 'Relational database engine used for all persistent storage, with JSONB support for Culture Card data and array columns for languages and interests.' },
    ],
  },
  {
    category: 'Styling & UI Framework',
    items: [
      { name: 'Tailwind CSS 3.4', url: 'https://tailwindcss.com', desc: 'Utility-first CSS framework enabling rapid, consistent, and responsive UI development with a custom brand design system.' },
      { name: 'Material Symbols', url: 'https://fonts.google.com/icons', desc: 'Variable-weight icon library by Google, used throughout the app for consistent, scalable interface icons.' },
    ],
  },
  {
    category: 'Development & Deployment',
    items: [
      { name: 'OpenCode', url: 'https://opencode.ai', desc: 'AI-assisted coding agent used during development for code generation, refactoring, and validation.' },
      { name: 'Git', url: 'https://git-scm.com', desc: 'Distributed version control system for source code management and collaboration.' },
      { name: 'Vercel', url: 'https://vercel.com', desc: 'Platform for deploying and hosting Next.js applications with edge functions and global CDN.' },
    ],
  },
  {
    category: 'Inspiration & Community',
    items: [
      { name: 'Duolingo', desc: 'For proving that language learning can be gamified, accessible, and fun for millions of people worldwide.' },
      { name: 'Tandem & HelloTalk', desc: 'For pioneering the language exchange model and showing that real human connection is the most effective language teacher.' },
    ],
  },
];

export default function CreditsPage() {
  return (
    <LegalLayout title="Credits" icon="favorite">
      <h1 className="text-lg font-bold text-[#154212] mt-0">Credits & Open Source Acknowledgments</h1>
      <p className="text-xs text-[#72796e]">Built with pride, powered by community.</p>

      <h2 className="text-base font-semibold text-[#154212] mt-6">The Nest Builder</h2>
      <div className="flex items-center gap-4 p-4 bg-[#ffffff] border-2 border-[#fdbb24]/50 rounded-2xl shadow-sm">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#2D5A27] to-[#154212] flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
          SA
        </div>
        <div>
          <span className="text-base font-bold text-[#1b1c1a]">Somser Ali</span>
          <p className="text-[11px] text-[#72796e] mt-0.5 leading-relaxed">
            Human Developer &amp; Creator &middot; Every line of code, every pixel, every metaphor —
            built with care, curiosity, and a deep love for language.
          </p>
        </div>
      </div>

      <h2 className="text-base font-semibold text-[#154212] mt-6">Standing on the Shoulders of Giants</h2>
      <p>
        Kakatua would not exist without the open-source community. Every framework,
        library, and tool we use is the result of thousands of hours of volunteer work
        by developers around the world. We are deeply grateful to every maintainer,
        contributor, and issue-filer who has made this project possible.
      </p>
      <p className="mt-2">
        Below is a comprehensive list of the core technologies that power Kakatua. Each
        one is used under its respective open-source license. We encourage you to explore
        these projects, contribute to them, and support their maintainers.
      </p>

      <h2 className="text-base font-semibold text-[#154212] mt-6">Open Source License Compliance</h2>
      <p className="text-sm text-[#72796e]">
        Kakatua is built on open-source software distributed under licenses including MIT,
        Apache 2.0, BSD-3-Clause, and SIL Open Font License. Complete license texts are
        available in our source repository. We comply with all attribution requirements
        and list each project with gratitude.
      </p>

      {credits.map((section) => (
        <div key={section.category} className="mt-6">
          <h3 className="text-sm font-bold text-[#154212] uppercase tracking-wider">
            {section.category}
          </h3>
          <div className="flex flex-col gap-2 mt-3">
            {section.items.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between p-3 bg-[#ffffff] border border-[#efeeea] rounded-xl"
              >
                <div className="flex-1 min-w-0 mr-3">
                  <span className="text-sm font-semibold text-[#1b1c1a]">{item.name}</span>
                  <p className="text-[10px] text-[#72796e] mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
                {'url' in item && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#2D5A27] hover:text-[#154212] transition-colors flex-shrink-0"
                  >
                    <span className="material-symbols-outlined text-lg">open_in_new</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <h2 className="text-base font-semibold text-[#154212] mt-8">A Note on AI Assistance</h2>
      <p>
        Parts of the Kakatua codebase were generated with the assistance of AI coding
        tools. Every AI-generated contribution is reviewed, tested, and validated by a
        human developer before being merged. We believe in using AI to accelerate
        development — not to replace human judgment or craftsmanship.
      </p>

      <div className="mt-8 p-4 bg-[#f5f3ef] rounded-2xl border border-[#efeeea]">
        <p className="text-[11px] text-[#72796e]">
          If you are a maintainer of a project listed above and believe the attribution
          could be improved, or if you have contributed to Kakatua directly and would like
          to be acknowledged, please reach out to{' '}
          <a href="https://github.com/soms3r/kakatua" target="_blank" rel="noopener noreferrer" className="text-[#2D5A27] underline">github.com/soms3r/kakatua</a>.
        </p>
      </div>
    </LegalLayout>
  );
}
