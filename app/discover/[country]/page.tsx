'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import LayoutShell from '../../components/LayoutShell';
import { getCountryBySlug } from '../../actions/ambassadors';
import type { DetailedContent } from '../../actions/types';
import { toggleLoveAction, getUserLoveStatus } from '../../actions/loveCard';
import { getCountryTheme, type CountryTheme } from '../../components/countryThemes';

interface CountryData {
  id: string;
  name: string;
  countrySlug: string;
  nativeLanguages: string[];
  learningLanguages: string[];
  interests: string[];
  timezoneOffset: number;
  cultureCardId: string | null;
  loveCount: number;
  cultureCard: {
    traditions: string;
    food: string;
    history: string;
    funFact: string;
  } | null;
  detailedContent: DetailedContent | null;
}

// ─── Staggered Reveal Animation ───────────────────────────────────────────────

function RevealSection({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(18px)',
        transition: `opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ─── Decorative Motif Layer ───────────────────────────────────────────────────

function MotifBackground({ theme }: { theme: CountryTheme }) {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 opacity-100"
      style={{ backgroundImage: theme.motifSvg, backgroundSize: '60px 60px' }}
    />
  );
}

// ─── Themed Hero Banner ───────────────────────────────────────────────────────

function HeroBanner({
  country,
  theme,
  loveCount,
  isLoved,
  loveLoading,
  onLoveToggle,
}: {
  country: CountryData;
  theme: CountryTheme;
  loveCount: number;
  isLoved: boolean;
  loveLoading: boolean;
  onLoveToggle: () => void;
}) {
  const tz = country.timezoneOffset;
  const tzLabel = `UTC ${tz >= 0 ? '+' : ''}${tz}`;

  return (
    <div className="relative rounded-[28px] overflow-hidden shadow-xl" style={{ background: theme.heroGradient }}>
      {/* Accent stripe across the top */}
      <div className="h-1.5 w-full" style={{ background: theme.heroAccentStripe }} />

      {/* Subtle decorative circles */}
      <div
        className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-10"
        style={{ background: theme.heroAccentStripe }}
      />
      <div
        className="absolute -bottom-12 -left-12 w-36 h-36 rounded-full opacity-8"
        style={{ background: theme.accentSoft }}
      />

      <div className="relative px-6 py-7 text-white z-10">
        {/* Flag + Name */}
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl drop-shadow-lg">{theme.flagEmoji}</span>
          <div>
            <h1
              className="text-xl font-extrabold tracking-tight leading-tight drop-shadow-sm"
              style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
            >
              {country.name}
            </h1>
            <p className="text-[11px] text-white/60 flex items-center gap-1 mt-0.5">
              <span className="material-symbols-outlined text-[12px]">schedule</span>
              {tzLabel}
            </p>
          </div>
        </div>

        {/* Greeting */}
        <div className="mt-3 mb-4">
          <p
            className="text-sm font-semibold text-white/90 tracking-wide"
            style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
          >
            {theme.greeting}
          </p>
        </div>

        {/* Cultural badge */}
        <div className="flex items-center gap-2 mb-4">
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full backdrop-blur-sm"
            style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}
          >
            {theme.culturalBadge}
          </span>
        </div>

        {/* Languages */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="text-[10px] bg-white/15 backdrop-blur-sm px-2.5 py-1 rounded-full font-medium">
            🗣 {country.nativeLanguages.join(', ')}
          </span>
          {country.learningLanguages.length > 0 && (
            <span className="text-[10px] bg-white/15 backdrop-blur-sm px-2.5 py-1 rounded-full font-medium">
              📚 Learning: {country.learningLanguages.join(', ')}
            </span>
          )}
        </div>

        {/* Interests */}
        {country.interests.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {country.interests.map((i) => (
              <span key={i} className="text-[10px] bg-white/10 px-2.5 py-1 rounded-full">
                #{i}
              </span>
            ))}
          </div>
        )}

        {/* Actions row */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Love Button */}
          {country.cultureCardId && (
            <button
              onClick={onLoveToggle}
              disabled={loveLoading}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-bold transition-all ${
                isLoved
                  ? 'bg-white/25 text-white shadow-sm'
                  : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
              }`}
            >
              <span className={`material-symbols-outlined text-sm ${isLoved ? 'font-fill' : ''}`}>
                {isLoved ? 'favorite' : 'favorite_border'}
              </span>
              {loveCount > 0 && <span>{loveCount}</span>}
              <span className="ml-1 opacity-70">Love</span>
            </button>
          )}

          {/* Share Button */}
          <ShareButton country={country} theme={theme} />
        </div>
      </div>
    </div>
  );
}

// ─── Themed Section Header ────────────────────────────────────────────────────

function SectionHeader({
  icon,
  title,
  theme,
}: {
  icon: string;
  title: string;
  theme: CountryTheme;
}) {
  return (
    <div className="flex items-center gap-2.5 mb-2">
      <span
        className="material-symbols-outlined text-lg p-2 rounded-xl"
        style={{ color: theme.accent, backgroundColor: theme.accentBg }}
      >
        {icon}
      </span>
      <h2
        className="text-xs font-bold tracking-tight"
        style={{ color: theme.accentDark }}
      >
        {title}
      </h2>
    </div>
  );
}

// ─── Cultural Highlight Card ──────────────────────────────────────────────────

function HighlightCard({
  label,
  icon,
  text,
  theme,
  variant = 'default',
}: {
  label: string;
  icon: string;
  text: string;
  theme: CountryTheme;
  variant?: 'default' | 'accent';
}) {
  return (
    <div
      className={`flex gap-3 items-start rounded-2xl p-3.5 border ${
        variant === 'accent' ? 'shadow-sm' : ''
      }`}
      style={{
        backgroundColor: variant === 'accent' ? theme.accentBg : theme.cardBg,
        borderColor: theme.cardBorder,
      }}
    >
      <span
        className="material-symbols-outlined text-base p-1.5 rounded-lg flex-shrink-0 mt-0.5"
        style={{ color: theme.accent, backgroundColor: `${theme.accentSoft}60` }}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <h4
          className="text-[10px] font-bold uppercase tracking-wider"
          style={{ color: theme.accent }}
        >
          {label}
        </h4>
        <p className="text-xs text-[#42493e] leading-relaxed mt-0.5">{text}</p>
      </div>
    </div>
  );
}

// ─── Themed Accordion Section ─────────────────────────────────────────────────

function AccordionSection({
  title,
  icon,
  theme,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: string;
  theme: CountryTheme;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className="border rounded-2xl overflow-hidden transition-all"
      style={{
        borderColor: open ? theme.border : theme.cardBorder,
        backgroundColor: theme.cardBg,
        boxShadow: open ? `0 2px 12px ${theme.accent}10` : 'none',
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors"
        style={{ backgroundColor: open ? `${theme.accentBg}60` : 'transparent' }}
      >
        <span
          className="material-symbols-outlined text-lg p-1.5 rounded-lg flex-shrink-0"
          style={{ color: theme.accent, backgroundColor: `${theme.accentSoft}50` }}
        >
          {icon}
        </span>
        <span className="text-xs font-bold flex-1" style={{ color: theme.accentDark }}>
          {title}
        </span>
        <span
          className={`material-symbols-outlined text-sm transition-transform duration-200`}
          style={{ color: theme.accent }}
        >
          expand_more
        </span>
      </button>
      {open && <div className="px-4 pb-4 pt-1 animate-fade-in">{children}</div>}
    </div>
  );
}

// ─── Fun Fact Banner ──────────────────────────────────────────────────────────

function FunFactBanner({ fact, theme }: { fact: string; theme: CountryTheme }) {
  return (
    <div
      className="rounded-2xl px-4 py-3.5 border flex gap-3 items-start"
      style={{
        background: `linear-gradient(135deg, ${theme.accentBg}, ${theme.accentSoft}30)`,
        borderColor: theme.border,
      }}
    >
      <span className="material-symbols-outlined text-base mt-0.5" style={{ color: theme.accent }}>
        tips_and_updates
      </span>
      <p className="text-[11px] text-[#42493e] leading-relaxed italic">
        &ldquo;{fact}&rdquo;
      </p>
    </div>
  );
}

// ─── Share Button ─────────────────────────────────────────────────────────────

function ShareButton({ country, theme }: { country: CountryData; theme: CountryTheme }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = `Explore ${country.name}'s culture on Kakatua — ${theme.culturalBadge}`;

  // Close dropdown on outside click
  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  async function handleNativeShare() {
    setMenuOpen(false);
    try {
      await navigator.share({ title: `${country.name} — Kakatua`, text: shareText, url: shareUrl });
    } catch {
      // user cancelled
    }
  }

  async function copyLink() {
    setMenuOpen(false);
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available
    }
  }

  const hasNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  const socialLinks = [
    {
      label: 'Twitter / X',
      icon: 'tag',
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    },
    {
      label: 'WhatsApp',
      icon: 'chat',
      href: `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`,
    },
    {
      label: 'Facebook',
      icon: 'thumb_up',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
  ];

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => {
          if (hasNativeShare) {
            handleNativeShare();
          } else {
            setMenuOpen((v) => !v);
          }
        }}
        className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-bold bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-all"
      >
        <span className="material-symbols-outlined text-sm">share</span>
        Share
      </button>

      {/* Fallback dropdown for desktop without native share */}
      {menuOpen && !hasNativeShare && (
        <div
          className="absolute right-0 bottom-full mb-2 w-44 rounded-xl border shadow-lg overflow-hidden z-50 animate-fade-in"
          style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}
        >
          <button
            onClick={copyLink}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-[11px] font-medium transition-colors hover:bg-black/5"
            style={{ color: theme.accentDark }}
          >
            <span className="material-symbols-outlined text-sm" style={{ color: theme.accent }}>
              {copied ? 'check' : 'content_copy'}
            </span>
            {copied ? 'Copied!' : 'Copy link'}
          </button>
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 text-[11px] font-medium transition-colors hover:bg-black/5"
              style={{ color: theme.accentDark }}
            >
              <span className="material-symbols-outlined text-sm" style={{ color: theme.accent }}>
                {link.icon}
              </span>
              {link.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CountryDetailPage() {
  const params = useParams();
  const { data: session } = useSession();
  const slug = params.country as string;
  const [country, setCountry] = useState<CountryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loveCount, setLoveCount] = useState(0);
  const [isLoved, setIsLoved] = useState(false);
  const [loveLoading, setLoveLoading] = useState(false);

  const theme = getCountryTheme(slug);

  // Set dynamic page title for share previews
  useEffect(() => {
    if (country) {
      document.title = `${theme.flagEmoji} ${country.name} — Kakatua Culture Card`;
    }
    return () => { document.title = 'Kakatua — Language & Culture Exchange'; };
  }, [country, theme]);

  useEffect(() => {
    async function load() {
      const result = await getCountryBySlug(slug);
      if (result.success && result.data) {
        setCountry(result.data);
        setLoveCount(result.data.loveCount);
      } else {
        setError(result.success ? 'Country not found.' : result.error);
      }
      setLoading(false);
    }
    load();
  }, [slug]);

  useEffect(() => {
    if (!session?.user?.id || !country?.cultureCardId) return;
    getUserLoveStatus(session.user.id, country.cultureCardId).then((res) => {
      if (res.success) setIsLoved(res.data);
    });
  }, [session?.user?.id, country?.cultureCardId]);

  async function handleLoveToggle() {
    if (!session?.user?.id || !country?.cultureCardId || loveLoading) return;
    setLoveLoading(true);
    const prev = loveCount;
    const prevIsLoved = isLoved;
    setLoveCount(isLoved ? loveCount - 1 : loveCount + 1);
    setIsLoved(!isLoved);
    const result = await toggleLoveAction(session.user.id, country.cultureCardId);
    if (result.success) {
      setLoveCount(result.data.loveCount);
      setIsLoved(result.data.isLoved);
    } else {
      setLoveCount(prev);
      setIsLoved(prevIsLoved);
    }
    setLoveLoading(false);
  }

  if (loading) {
    return (
      <LayoutShell activeTab="discover">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div
            className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mb-3"
            style={{ borderColor: theme.accentSoft, borderTopColor: theme.accent }}
          />
          <p className="text-[11px] text-[#72796e]">Opening the culture library...</p>
        </div>
      </LayoutShell>
    );
  }

  if (error || !country) {
    return (
      <LayoutShell activeTab="discover">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <span className="material-symbols-outlined text-4xl text-[#c2c9bb] mb-2">explore_off</span>
          <p className="text-[11px] text-[#72796e] mb-4">{error || 'Country not found in the flock library.'}</p>
          <Link
            href="/discover"
            className="text-[11px] font-semibold flex items-center gap-1 hover:opacity-80 transition-opacity"
            style={{ color: theme.accent }}
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Discover
          </Link>
        </div>
      </LayoutShell>
    );
  }

  const d = country.detailedContent;

  return (
    <LayoutShell activeTab="discover">
      {/* Background motif layer */}
      <MotifBackground theme={theme} />

      <div className="relative z-10 flex flex-col gap-4 pb-24 pt-2">

        {/* Back link */}
        <RevealSection delay={0}>
          <Link
            href="/discover"
            className="text-[11px] font-semibold flex items-center gap-1 hover:opacity-80 transition-opacity"
            style={{ color: theme.accent }}
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Discover
          </Link>
        </RevealSection>

        {/* ─── Hero Banner ──────────────────────────────────────────────── */}
        <RevealSection delay={60}>
          <HeroBanner
            country={country}
            theme={theme}
            loveCount={loveCount}
            isLoved={isLoved}
            loveLoading={loveLoading}
            onLoveToggle={handleLoveToggle}
          />
        </RevealSection>

        {/* ─── Quick Summary ──────────────────────────────────────────────── */}
        {country.cultureCard && (
        <RevealSection delay={140}>
          <div
            className="rounded-[24px] p-5 shadow-sm border"
            style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}
          >
            <SectionHeader icon="auto_stories" title="At a Glance" theme={theme} />

            <div className="flex flex-col gap-3 mt-3">
              {[
                { label: 'Traditions', icon: 'diversity_3', text: country.cultureCard.traditions },
                { label: 'Flavours', icon: 'restaurant', text: country.cultureCard.food },
                { label: 'History', icon: 'history_edu', text: country.cultureCard.history },
              ]
                .filter((s) => s.text?.trim())
                .map((s) => (
                  <HighlightCard key={s.label} label={s.label} icon={s.icon} text={s.text} theme={theme} />
                ))}
            </div>

            {country.cultureCard.funFact && (
              <div className="mt-3">
                <FunFactBanner fact={country.cultureCard.funFact} theme={theme} />
              </div>
            )}
          </div>
        </RevealSection>
        )}

        {/* ─── Detailed Content (Accordion) ─────────────────────────────── */}
        {d && (
        <RevealSection delay={220}>
          <div className="flex flex-col gap-3">
            <SectionHeader icon="book_2" title="Culture Library" theme={theme} />

            {/* Language Info */}
            <AccordionSection title="Language & Communication" icon="translate" theme={theme} defaultOpen>
              <div className="flex flex-col gap-3">
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: theme.accent }}>
                    Primary Language
                  </h4>
                  <p className="text-xs font-bold text-[#1b1c1a]">{d.languageInfo.primaryLanguage}</p>
                </div>
                {d.languageInfo.majorDialects.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: theme.accent }}>
                      Major Dialects
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {d.languageInfo.majorDialects.map((dialect) => (
                        <span
                          key={dialect}
                          className="text-[10px] px-2.5 py-1 rounded-full font-medium"
                          style={{ backgroundColor: theme.accentBg, color: theme.accentDark }}
                        >
                          {dialect}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {d.languageInfo.keyPhrases.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: theme.accent }}>
                      Key Phrases
                    </h4>
                    <div className="flex flex-col gap-1.5">
                      {d.languageInfo.keyPhrases.map((phrase) => (
                        <div
                          key={phrase}
                          className="border rounded-xl px-3 py-2.5 text-[11px] text-[#42493e]"
                          style={{ backgroundColor: theme.accentBg, borderColor: theme.cardBorder }}
                        >
                          {phrase}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </AccordionSection>

            {/* Cultural Rituals */}
            <AccordionSection title="Festivals & Rituals" icon="celebration" theme={theme}>
              <div className="flex flex-col gap-3">
                {d.culturalRituals.map((ritual) => (
                  <div
                    key={ritual.festivalName}
                    className="border rounded-2xl p-4"
                    style={{ backgroundColor: theme.accentBg, borderColor: theme.cardBorder }}
                  >
                    <h4 className="text-[11px] font-bold mb-1.5" style={{ color: theme.accentDark }}>
                      {ritual.festivalName}
                    </h4>
                    <p className="text-[11px] text-[#42493e] leading-relaxed">{ritual.description}</p>
                  </div>
                ))}
              </div>
            </AccordionSection>

            {/* Culinary Narrative */}
            <AccordionSection title="Culinary Stories" icon="restaurant" theme={theme}>
              <div className="flex flex-col gap-3">
                {d.culinaryNarrative.map((dish) => (
                  <div
                    key={dish.dishName}
                    className="border rounded-2xl p-4"
                    style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}
                  >
                    <h4 className="text-[11px] font-bold mb-2" style={{ color: theme.accentDark }}>
                      {dish.dishName}
                    </h4>
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2 items-start">
                        <span className="material-symbols-outlined text-[10px] mt-0.5" style={{ color: theme.accent }}>
                          history
                        </span>
                        <p className="text-[10px] text-[#72796e] leading-relaxed">{dish.historicalOrigin}</p>
                      </div>
                      <div className="flex gap-2 items-start">
                        <span className="material-symbols-outlined text-[10px] mt-0.5" style={{ color: theme.accent }}>
                          favorite
                        </span>
                        <p className="text-[11px] text-[#42493e] leading-relaxed italic">
                          {dish.culturalSignificance}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionSection>

            {/* Historical Context */}
            <AccordionSection title="Historical Context" icon="auto_stories" theme={theme}>
              <div
                className="border rounded-2xl p-4"
                style={{ backgroundColor: theme.accentBg, borderColor: theme.cardBorder }}
              >
                <p className="text-[11px] text-[#42493e] leading-relaxed whitespace-pre-line">
                  {d.historicalContext}
                </p>
              </div>
            </AccordionSection>

            {/* Social Etiquette */}
            <AccordionSection title="Social Etiquette" icon="groups" theme={theme}>
              <div className="flex flex-col gap-2.5">
                {d.socialEtiquette.map((rule, i) => (
                  <div key={i} className="flex gap-2.5 items-start">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-[9px] font-bold"
                      style={{ backgroundColor: `${theme.accentSoft}40`, color: theme.accent }}
                    >
                      {i + 1}
                    </span>
                    <p className="text-[11px] text-[#42493e] leading-relaxed">{rule}</p>
                  </div>
                ))}
              </div>
            </AccordionSection>
          </div>
        </RevealSection>
        )}

        {/* ─── No Details Fallback ────────────────────────────────────────── */}
        {!d && (
        <RevealSection delay={220}>
          <div
            className="border rounded-2xl p-6 text-center"
            style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}
          >
            <span className="material-symbols-outlined text-3xl mb-2" style={{ color: theme.accentSoft }}>
              menu_book
            </span>
            <p className="text-[11px] text-[#72796e]">Detailed cultural information coming soon for this country.</p>
          </div>
        </RevealSection>
        )}
      </div>
    </LayoutShell>
  );
}
