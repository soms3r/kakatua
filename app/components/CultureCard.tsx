'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { reportUserAction } from '../actions/reportUser';
import { toggleLoveAction, getUserLoveStatus } from '../actions/loveCard';
import { DEFAULT_THEME, type CountryTheme } from './countryThemes';

interface CultureCardData {
  traditions: string;
  food: string;
  history: string;
  funFact: string;
}

interface UserProfile {
  id: string;
  name: string;
  avatarUrl: string | null;
  nativeLanguages: string[];
  learningLanguages: string[];
  interests: string[];
  timezoneOffset: string;
}

interface CultureCardProps {
  user: UserProfile;
  cardData: CultureCardData;
  onViewProfile?: () => void;
  ambassadorRole?: string | null;
  hasDetails?: boolean;
  cultureCardId?: string | null;
  loveCount?: number;
  isUserCreated?: boolean;
  theme?: CountryTheme;
}

const ROLE_BADGES: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  GUIDE: { label: 'Guide', icon: 'menu_book', color: '#2d5a27', bg: '#bcf0ae' },
  MATCHMAKER: { label: 'Buddy', icon: 'handshake', color: '#7b5800', bg: '#ffdea5' },
  CULTURAL_ADVISOR: { label: 'Local', icon: 'location_on', color: '#6d1d06', bg: '#ffdbd1' },
};

export default function CultureCard({
  user,
  cardData,
  onViewProfile,
  ambassadorRole,
  hasDetails,
  cultureCardId,
  loveCount: initialLoveCount = 0,
  isUserCreated = false,
  theme,
}: CultureCardProps) {
  const { data: session } = useSession();
  const [showReportModal, setShowReportModal] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reportResult, setReportResult] = useState('');
  const [loveCount, setLoveCount] = useState(initialLoveCount);
  const [isLoved, setIsLoved] = useState(false);
  const [loveLoading, setLoveLoading] = useState(false);

  useEffect(() => {
    if (!session?.user?.id || !cultureCardId) return;
    getUserLoveStatus(session.user.id, cultureCardId)
      .then((res) => {
        if (res.success) setIsLoved(res.data);
      })
      .catch((err) => {
        console.error('[Kakatua] CultureCard: love status check failed:', err);
      });
  }, [session?.user?.id, cultureCardId]);

  const formatLanguages = (langs: string[]) => {
    if (!langs || langs.length === 0) return '—';
    return langs.join(', ');
  };

  const tz = parseFloat(user.timezoneOffset);
  const tzLabel = isNaN(tz) ? '' : `UTC ${tz >= 0 ? '+' : ''}${tz}`;

  const isThemed = !!theme && theme !== DEFAULT_THEME;
  const palette = isThemed && theme ? theme : DEFAULT_THEME;

  const sections = [
    { key: 'traditions', label: 'Traditions', icon: 'diversity_3', color: isThemed ? theme!.accentDark : '#2d5a27', bg: isThemed ? theme!.accentBg : '#bcf0ae', text: cardData.traditions },
    { key: 'food', label: 'Local Flavours', icon: 'restaurant', color: isThemed ? theme!.accentDark : '#7b5800', bg: isThemed ? theme!.accentBg : '#ffdea5', text: cardData.food },
    { key: 'history', label: 'History', icon: 'auto_stories', color: isThemed ? theme!.accentDark : '#6d1d06', bg: isThemed ? theme!.accentBg : '#ffdbd1', text: cardData.history },
  ].filter((s) => s.text && s.text.trim().length > 0);

  async function handleReport() {
    if (!session?.user?.id) return;
    setReporting(true);
    const result = await reportUserAction(session.user.id, user.id, 'Reported from Discover page');
    if (result.success) {
      setReportResult(result.message);
    } else {
      setReportResult(result.error);
    }
    setReporting(false);
  }

  async function handleLoveToggle() {
    if (!session?.user?.id || !cultureCardId || loveLoading) return;
    setLoveLoading(true);
    const prev = loveCount;
    const prevIsLoved = isLoved;
    setLoveCount(isLoved ? loveCount - 1 : loveCount + 1);
    setIsLoved(!isLoved);
    const result = await toggleLoveAction(session.user.id, cultureCardId);
    if (result.success) {
      setLoveCount(result.data.loveCount);
      setIsLoved(result.data.isLoved);
    } else {
      setLoveCount(prev);
      setIsLoved(prevIsLoved);
    }
    setLoveLoading(false);
  }

  const isOwnCard = session?.user?.id === user.id;

  return (
    <>
      <div
        className="relative w-full bg-[#ffffff] rounded-2xl shadow-[0_2px_14px_rgba(21,66,18,0.05)] p-3 flex flex-col gap-2 overflow-hidden border transition-all hover:shadow-[0_8px_24px_rgba(21,66,18,0.09)] hover:-translate-y-0.5"
        style={{ borderColor: palette.border }}
      >
        {palette.stripes.length > 0 && (
          <div className="absolute top-0 left-0 right-0 h-1 flex">
            {palette.stripes.map((c, i) => (
              <div key={i} style={{ backgroundColor: c }} className="flex-1" />
            ))}
          </div>
        )}

        {/* Header: Avatar + Name + Languages + Report */}
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center"
            style={{ backgroundColor: palette.accentBg, border: `1.5px solid ${palette.accentSoft}` }}
          >
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-base" style={{ color: palette.accent }}>flutter_dash</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <h3 className="font-bold text-[11px] text-[#1b1c1a] truncate">
                {palette.flagEmoji && <span className="mr-0.5">{palette.flagEmoji}</span>}
                {user.name}
              </h3>
              {ambassadorRole && ROLE_BADGES[ambassadorRole] && (
                <span
                  className="text-[8px] font-bold uppercase tracking-wider px-1 py-0.5 rounded-full flex items-center gap-0.5 flex-shrink-0"
                  style={{ color: ROLE_BADGES[ambassadorRole].color, backgroundColor: `${ROLE_BADGES[ambassadorRole].bg}60` }}
                >
                  <span className="material-symbols-outlined text-[9px]">{ROLE_BADGES[ambassadorRole].icon}</span>
                  {ROLE_BADGES[ambassadorRole].label}
                </span>
              )}
              {isUserCreated && (
                <span
                  className="text-[8px] font-bold uppercase tracking-wider px-1 py-0.5 rounded-full flex items-center gap-0.5 flex-shrink-0"
                  style={{ color: '#4a6741', backgroundColor: '#e8f5e3' }}
                >
                  <span className="material-symbols-outlined text-[9px]">person</span>
                  Flock Member
                </span>
              )}
            </div>
            <p className="text-[9px] text-[#72796e] flex items-center gap-1 mt-0.5">
              <span className="material-symbols-outlined text-[10px]" style={{ color: palette.accent }}>language</span>
              <span className="truncate">{formatLanguages(user.nativeLanguages)} → {formatLanguages(user.learningLanguages)}</span>
            </p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {tzLabel && (
              <span className="text-[8px] text-[#72796e] bg-[#f5f3ef] px-1.5 py-0.5 rounded-full">{tzLabel}</span>
            )}
            {!isOwnCard && (
              <button
                onClick={() => setShowReportModal(true)}
                className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-[#ffdad6] transition-colors text-[#a0a0a0] hover:text-[#ba1a1a]"
                title="Report this user"
              >
                <span className="material-symbols-outlined text-xs">flag</span>
              </button>
            )}
          </div>
        </div>

        {/* Culture Sections */}
        {sections.length > 0 && (
          <div className="flex flex-col gap-1.5">
            {sections.map((section) => (
              <div key={section.key} className="flex gap-1.5 items-start">
                <span
                  className="material-symbols-outlined text-[13px] p-1 rounded-md flex-shrink-0 mt-0.5"
                  style={{ color: section.color, backgroundColor: `${section.bg}40` }}
                >
                  {section.icon}
                </span>
                <div className="min-w-0">
                  <h4 className="text-[8px] font-semibold uppercase tracking-wider text-[#72796e]">{section.label}</h4>
                  <p className="text-[10px] text-[#42493e] leading-snug mt-0.5 line-clamp-2">{section.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Fun Fact */}
        {cardData.funFact && cardData.funFact.trim().length > 0 && (
          <div
            className="rounded-lg px-2 py-1.5 flex gap-1.5 items-start border"
            style={{ backgroundColor: palette.accentBg, borderColor: palette.border }}
          >
            <span className="material-symbols-outlined text-xs mt-0.5" style={{ color: palette.accentDark }}>tips_and_updates</span>
            <p className="text-[9px] text-[#42493e] leading-snug italic line-clamp-2">"{cardData.funFact}"</p>
          </div>
        )}

        {/* Interest Tags */}
        {user.interests && user.interests.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1 border-t border-[#f5f3ef]">
            {user.interests.map((interest) => (
              <span key={interest} className="text-[8px] font-medium bg-[#f5f3ef] text-[#42493e] px-1.5 py-0.5 rounded-full">
                #{interest}
              </span>
            ))}
          </div>
        )}

        {/* Love + View Profile Row */}
        <div className="flex items-center justify-between pt-1 border-t border-[#f5f3ef]">
          {/* Love Button */}
          {cultureCardId && (
            <button
              onClick={handleLoveToggle}
              disabled={loveLoading || isOwnCard}
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-semibold transition-all ${
                isOwnCard
                  ? 'bg-[#f5f3ef] text-[#b0b0b0] cursor-default'
                  : isLoved
                    ? 'bg-[#ffdad6]/60 text-[#ba1a1a] hover:bg-[#ffdad6]'
                    : 'bg-[#f5f3ef] text-[#72796e] hover:bg-[#ffdad6]/30 hover:text-[#ba1a1a]'
              }`}
            >
              <span className={`material-symbols-outlined text-sm ${isLoved ? 'font-fill' : ''}`}>
                {isLoved ? 'favorite' : 'favorite_border'}
              </span>
              {loveCount > 0 && <span>{loveCount}</span>}
            </button>
          )}

          {/* View Culture Library / View Profile */}
          {(onViewProfile || hasDetails) && (
            <button
              onClick={onViewProfile}
              className="self-start text-[9px] font-semibold transition-colors flex items-center gap-1"
              style={{ color: palette.accent }}
              onMouseEnter={(e) => (e.currentTarget.style.color = palette.accentDark)}
              onMouseLeave={(e) => (e.currentTarget.style.color = palette.accent)}
            >
              <span className="material-symbols-outlined text-sm">{hasDetails ? 'book_2' : 'arrow_forward'}</span>
              {hasDetails ? 'View Library' : 'View Profile'}
            </button>
          )}
        </div>
      </div>

      {/* ====== Report Confirmation Modal ====== */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-[#1b1c1a]/40 backdrop-blur-sm"
            onClick={() => { if (!reporting) { setShowReportModal(false); setReportResult(''); } }}
          />

          {/* Modal */}
          <div className="relative w-full max-w-sm bg-[#fbf9f5] border border-[#dbdad6] rounded-[24px] shadow-[0_20px_60px_rgba(21,66,18,0.2)] p-6 flex flex-col items-center text-center animate-fade-in">
            {!reportResult ? (
              <>
                <div className="w-14 h-14 rounded-full bg-[#ffdad6]/40 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-2xl text-[#ba1a1a]">report</span>
                </div>
                <h3 className="text-sm font-bold text-[#1b1c1a] mb-1">Report this bird to the flock?</h3>
                <p className="text-[11px] text-[#72796e] leading-relaxed max-w-[85%] mb-6">
                  The flock moderators will review this nest. False reports may affect your own standing.
                </p>
                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => { setShowReportModal(false); setReportResult(''); }}
                    disabled={reporting}
                    className="flex-1 bg-[#f5f3ef] hover:bg-[#efeeea] active:scale-[0.98] transition-all text-[#42493e] font-semibold text-xs py-2.5 rounded-full"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReport}
                    disabled={reporting}
                    className="flex-1 bg-[#ba1a1a] hover:bg-[#8c1414] active:scale-[0.98] disabled:opacity-50 transition-all text-white font-semibold text-xs py-2.5 rounded-full flex items-center justify-center gap-1.5"
                  >
                    {reporting ? (
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <span className="material-symbols-outlined text-sm">send</span>
                    )}
                    Report
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-full bg-[#bcf0ae]/40 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-2xl text-[#2D5A27]">check_circle</span>
                </div>
                <p className="text-xs text-[#42493e] leading-relaxed mb-5">{reportResult}</p>
                <button
                  onClick={() => { setShowReportModal(false); setReportResult(''); }}
                  className="bg-[#2D5A27] hover:bg-[#154212] active:scale-[0.98] transition-all text-white font-semibold text-xs py-2.5 px-8 rounded-full"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
