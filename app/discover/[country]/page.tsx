'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import LayoutShell from '../../components/LayoutShell';
import { getCountryBySlug, DetailedContent } from '../../actions/ambassadors';
import { toggleLoveAction, getUserLoveStatus } from '../../actions/loveCard';

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

// ─── Accordion Section ────────────────────────────────────────────────────────

function AccordionSection({
  title, icon, color, bg, children, defaultOpen = false,
}: {
  title: string; icon: string; color: string; bg: string;
  children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`border rounded-2xl overflow-hidden transition-all ${open ? 'border-[#a1d494]/40 shadow-sm' : 'border-[#efeeea]'}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-[#f5f3ef]/50 transition-colors"
      >
        <span
          className="material-symbols-outlined text-lg p-1.5 rounded-lg flex-shrink-0"
          style={{ color, backgroundColor: `${bg}50` }}
        >
          {icon}
        </span>
        <span className="text-xs font-bold text-[#1b1c1a] flex-1">{title}</span>
        <span className={`material-symbols-outlined text-sm text-[#72796e] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Country Detail Page ──────────────────────────────────────────────────────

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
          <div className="w-8 h-8 border-2 border-[#a1d494] border-t-[#2D5A27] rounded-full animate-spin mb-3" />
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
          <Link href="/discover" className="text-[11px] font-semibold text-[#2D5A27] hover:text-[#154212] flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Discover
          </Link>
        </div>
      </LayoutShell>
    );
  }

  const d = country.detailedContent;
  const tz = country.timezoneOffset;
  const tzLabel = `UTC ${tz >= 0 ? '+' : ''}${tz}`;

  return (
    <LayoutShell activeTab="discover">
      <div className="flex flex-col gap-4 pb-24 pt-2">

        {/* Back link */}
        <Link
          href="/discover"
          className="text-[11px] font-semibold text-[#2D5A27] hover:text-[#154212] flex items-center gap-1 -mb-1"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Discover
        </Link>

        {/* ─── Hero Card ──────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-br from-[#2D5A27] to-[#154212] rounded-[24px] p-6 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-3xl">nest_eco_leaf</span>
            <div>
              <h1 className="text-lg font-bold tracking-tight">{country.name}</h1>
              <p className="text-[11px] text-white/60 flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">schedule</span>
                {tzLabel}
              </p>
            </div>
          </div>

          {/* Languages */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className="text-[10px] bg-white/15 px-2 py-0.5 rounded-full">
              🗣 {country.nativeLanguages.join(', ')}
            </span>
            {country.learningLanguages.length > 0 && (
              <span className="text-[10px] bg-white/15 px-2 py-0.5 rounded-full">
                📚 Learning: {country.learningLanguages.join(', ')}
              </span>
            )}
          </div>

          {/* Interests */}
          {country.interests.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {country.interests.map((i) => (
                <span key={i} className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full">#{i}</span>
              ))}
            </div>
          )}

          {/* Love Button */}
          {country.cultureCardId && (
            <div className="mt-3">
              <button
                onClick={handleLoveToggle}
                disabled={loveLoading}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all ${
                  isLoved
                    ? 'bg-white/20 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                }`}
              >
                <span className={`material-symbols-outlined text-sm ${isLoved ? 'font-fill' : ''}`}>
                  {isLoved ? 'favorite' : 'favorite_border'}
                </span>
                {loveCount > 0 && <span>{loveCount}</span>}
              </button>
            </div>
          )}
        </div>

        {/* ─── Quick Summary ──────────────────────────────────────────────── */}
        {country.cultureCard && (
          <div className="bg-[#ffffff] border border-[#efeeea] rounded-[20px] p-5 shadow-sm flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-[#2D5A27] text-lg">auto_stories</span>
              <h2 className="text-xs font-bold text-[#154212]">Overview</h2>
            </div>
            {[
              { label: 'Traditions', icon: 'diversity_3', color: '#2d5a27', bg: '#bcf0ae', text: country.cultureCard.traditions },
              { label: 'Flavours', icon: 'restaurant', color: '#7b5800', bg: '#ffdea5', text: country.cultureCard.food },
              { label: 'History', icon: 'history_edu', color: '#6d1d06', bg: '#ffdbd1', text: country.cultureCard.history },
            ].filter((s) => s.text?.trim()).map((s) => (
              <div key={s.label} className="flex gap-2.5 items-start">
                <span
                  className="material-symbols-outlined text-base p-1.5 rounded-lg flex-shrink-0 mt-0.5"
                  style={{ color: s.color, backgroundColor: `${s.bg}40` }}
                >
                  {s.icon}
                </span>
                <div className="min-w-0">
                  <h4 className="text-[10px] font-semibold uppercase tracking-wider text-[#72796e]">{s.label}</h4>
                  <p className="text-xs text-[#42493e] leading-relaxed mt-0.5">{s.text}</p>
                </div>
              </div>
            ))}
            {country.cultureCard.funFact && (
              <div className="bg-[#fbf9f5] border border-[#efeeea] rounded-xl px-3 py-2.5 flex gap-2 items-start mt-1">
                <span className="material-symbols-outlined text-sm text-[#2d5a27] mt-0.5">tips_and_updates</span>
                <p className="text-[11px] text-[#42493e] leading-relaxed italic">"{country.cultureCard.funFact}"</p>
              </div>
            )}
          </div>
        )}

        {/* ─── Detailed Content (Accordion) ─────────────────────────────── */}
        {d && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#2D5A27] text-lg">book_2</span>
              <h2 className="text-xs font-bold text-[#154212]">Culture Library</h2>
            </div>

            {/* Language Info */}
            <AccordionSection title="Language & Communication" icon="translate" color="#2d5a27" bg="#bcf0ae" defaultOpen>
              <div className="flex flex-col gap-3">
                <div>
                  <h4 className="text-[10px] font-semibold uppercase tracking-wider text-[#72796e] mb-1">Primary Language</h4>
                  <p className="text-xs font-bold text-[#1b1c1a]">{d.languageInfo.primaryLanguage}</p>
                </div>
                {d.languageInfo.majorDialects.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-semibold uppercase tracking-wider text-[#72796e] mb-1">Major Dialects</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {d.languageInfo.majorDialects.map((dialect) => (
                        <span key={dialect} className="text-[10px] bg-[#f5f3ef] text-[#42493e] px-2 py-0.5 rounded-full">{dialect}</span>
                      ))}
                    </div>
                  </div>
                )}
                {d.languageInfo.keyPhrases.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-semibold uppercase tracking-wider text-[#72796e] mb-1.5">Key Phrases</h4>
                    <div className="flex flex-col gap-1.5">
                      {d.languageInfo.keyPhrases.map((phrase) => (
                        <div key={phrase} className="bg-[#fbf9f5] border border-[#efeeea] rounded-lg px-3 py-2 text-[11px] text-[#42493e]">
                          {phrase}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </AccordionSection>

            {/* Cultural Rituals */}
            <AccordionSection title="Festivals & Rituals" icon="celebration" color="#7b5800" bg="#ffdea5">
              <div className="flex flex-col gap-3">
                {d.culturalRituals.map((ritual) => (
                  <div key={ritual.festivalName} className="bg-[#fbf9f5] border border-[#efeeea] rounded-xl p-3.5">
                    <h4 className="text-[11px] font-bold text-[#154212] mb-1">{ritual.festivalName}</h4>
                    <p className="text-[11px] text-[#42493e] leading-relaxed">{ritual.description}</p>
                  </div>
                ))}
              </div>
            </AccordionSection>

            {/* Culinary Narrative */}
            <AccordionSection title="Culinary Stories" icon="restaurant" color="#6d1d06" bg="#ffdbd1">
              <div className="flex flex-col gap-3">
                {d.culinaryNarrative.map((dish) => (
                  <div key={dish.dishName} className="bg-[#fbf9f5] border border-[#efeeea] rounded-xl p-3.5">
                    <h4 className="text-[11px] font-bold text-[#154212] mb-2">{dish.dishName}</h4>
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2 items-start">
                        <span className="material-symbols-outlined text-[10px] text-[#7b5800] mt-0.5">history</span>
                        <p className="text-[10px] text-[#72796e] leading-relaxed">{dish.historicalOrigin}</p>
                      </div>
                      <div className="flex gap-2 items-start">
                        <span className="material-symbols-outlined text-[10px] text-[#2d5a27] mt-0.5">favorite</span>
                        <p className="text-[11px] text-[#42493e] leading-relaxed italic">{dish.culturalSignificance}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionSection>

            {/* Historical Context */}
            <AccordionSection title="Historical Context" icon="auto_stories" color="#154212" bg="#bcf0ae">
              <div className="bg-[#fbf9f5] border border-[#efeeea] rounded-xl p-4">
                <p className="text-[11px] text-[#42493e] leading-relaxed whitespace-pre-line">{d.historicalContext}</p>
              </div>
            </AccordionSection>

            {/* Social Etiquette */}
            <AccordionSection title="Social Etiquette" icon="groups" color="#7b5800" bg="#ffdea5">
              <div className="flex flex-col gap-2">
                {d.socialEtiquette.map((rule, i) => (
                  <div key={i} className="flex gap-2.5 items-start">
                    <span className="w-5 h-5 rounded-full bg-[#bcf0ae]/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[9px] font-bold text-[#2D5A27]">{i + 1}</span>
                    </span>
                    <p className="text-[11px] text-[#42493e] leading-relaxed">{rule}</p>
                  </div>
                ))}
              </div>
            </AccordionSection>
          </div>
        )}

        {/* ─── No Details Fallback ────────────────────────────────────────── */}
        {!d && (
          <div className="bg-[#fbf9f5] border border-[#efeeea] rounded-2xl p-6 text-center">
            <span className="material-symbols-outlined text-3xl text-[#c2c9bb] mb-2">menu_book</span>
            <p className="text-[11px] text-[#72796e]">Detailed cultural information coming soon for this country.</p>
          </div>
        )}
      </div>
    </LayoutShell>
  );
}
