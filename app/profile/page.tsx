'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import LayoutShell from '../components/LayoutShell';
import GrammarCheckModal from '../components/GrammarCheckModal';
import { getUserProfileAction, updateUserProfileAction } from '../actions/getData';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  nativeLanguages: string[];
  learningLanguages: string[];
  interests: string[];
  timezoneOffset: number;
  status: string;
  isAmbassador: boolean;
  ambassadorRole: string | null;
  bio: string | null;
  traditions: string | null;
  favoriteFood: string | null;
  historyInterest: string | null;
  cultureCard: {
    traditions: string;
    food: string;
    history: string;
    funFact: string;
  } | null;
}

const ROLE_LABELS: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  GUIDE: { label: 'Kakatua Guide', icon: 'menu_book', color: '#3f5a2e', bg: '#e8efda' },
  MATCHMAKER: { label: 'Global Buddy', icon: 'handshake', color: '#8a6d4d', bg: '#f4e2b8' },
  CULTURAL_ADVISOR: { label: 'Dhaka Local', icon: 'location_on', color: '#b26a3a', bg: '#f7e0ce' },
};

// ─── Organic "nest" iconography (small custom SVGs) ───────────────────────────

function EggIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 18" className={className} fill="currentColor" aria-hidden="true">
      <path d="M8 1.8C4.9 4.7 2.3 7.9 2.3 11 2.3 13.9 4.8 16.3 8 16.3s5.7-2.4 5.7-5.3C13.7 7.9 11.1 4.7 8 1.8z" />
      <ellipse cx="6.3" cy="9.5" rx="1" ry="1.5" fill="#ffffff" opacity="0.55" />
    </svg>
  );
}

function LeafIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 18 18" className={className} fill="currentColor" aria-hidden="true">
      <path d="M3.2 14.8C3.2 7.8 7.2 2.6 15 3c-.5 6.8-5.2 11-11.8 11.8z" />
      <path d="M3.6 14.4C6.8 10.6 10.2 7.2 14.6 3.6" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.65" />
    </svg>
  );
}

function BerryIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 18 18" className={className} fill="currentColor" aria-hidden="true">
      <circle cx="6" cy="10.6" r="4" />
      <circle cx="12" cy="7.6" r="3.2" />
      <circle cx="10.8" cy="13" r="2.2" />
      <path d="M6.2 6.4c1.4-2 3.6-3.2 5.9-3.2-1.1 2.4-3.1 3.6-5.9 3.2z" fill="#5f7d45" />
    </svg>
  );
}

function TwigIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 18 18" className={className} fill="currentColor" aria-hidden="true">
      <path d="M2.8 15.2c4.5-3.6 8.6-7.4 11-10.8-2.2 3-5 6.4-8.4 9l-2.6 1.8z" />
      <path d="M5.4 13.4c2-1.6 4-3.4 6.6-6.2" stroke="currentColor" strokeWidth="1.1" fill="none" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

function FeatherIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 18 18" className={className} fill="currentColor" aria-hidden="true">
      <path d="M3 15.2c3-5.2 6.8-8.9 11.8-10.9C13.6 8.9 10.4 12.4 6 15l-3 .2z" />
      <path d="M4.2 13.4L10.8 6.8" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

function TwigDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`} aria-hidden="true">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#d4bf92]" />
      <LeafIcon className="w-2.5 h-2.5 text-[#a08050]" />
      <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#d4bf92]" />
    </div>
  );
}

function Nugget({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={`relative rounded-[30px] bg-[#fdf7ea] shadow-[0_10px_28px_rgba(74,61,44,0.10),0_2px_6px_rgba(74,61,44,0.05)] ${className}`}
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-[3px] rounded-b-full bg-gradient-to-r from-transparent via-[#e5c98d]/70 to-transparent" />
      <div className="relative p-5 sm:p-6">{children}</div>
    </div>
  );
}

const ICONS: Record<string, React.ReactNode> = {
  feather: <FeatherIcon className="w-3.5 h-3.5" />,
  leaf: <LeafIcon className="w-3.5 h-3.5" />,
  berry: <BerryIcon className="w-3.5 h-3.5" />,
  twig: <TwigIcon className="w-3.5 h-3.5" />,
};

const inputCls =
  'w-full bg-[#f7ecd8] border border-[#dcc9a0] rounded-2xl px-3 py-2.5 text-xs text-[#4a3d2c] placeholder:text-[#b3a583] focus:outline-none focus:ring-2 focus:ring-[#a08050]/60 focus:border-transparent resize-none transition-all';
const labelCls = 'text-[10px] font-semibold uppercase tracking-wider text-[#8a7a5e] mb-1 block';

export default function ProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const [grammarOpen, setGrammarOpen] = useState(false);
  const [formBio, setFormBio] = useState('');
  const [formTraditions, setFormTraditions] = useState('');
  const [formFood, setFormFood] = useState('');
  const [formHistory, setFormHistory] = useState('');

  useEffect(() => {
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    async function load() {
      try {
        console.log('[Kakatua] Profile: fetching for user', session!.user.id);
        const result = await getUserProfileAction(session!.user.id);
        if (cancelled) return;
        if (result.success) {
          setProfile(result.data);
          console.log('[Kakatua] Profile: loaded profile for', result.data.name);
        } else {
          console.error('[Kakatua] Profile: action error:', result.error);
          setError(result.error);
        }
      } catch (err: any) {
        if (cancelled) return;
        console.error('[Kakatua] Profile: fetch failed:', err);
        setError(err?.message || 'Failed to load profile. Please try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [session?.user?.id]);

  async function loadProfile() {
    if (!session?.user?.id) return;
    try {
      const result = await getUserProfileAction(session.user.id);
      if (result.success) setProfile(result.data);
      else setError(result.error);
    } catch (err: any) {
      console.error('[Kakatua] Profile: reload failed:', err);
      setError(err?.message || 'Failed to load profile.');
    }
    setLoading(false);
  }

  function openEdit() {
    if (!profile) return;
    setFormBio(profile.bio || '');
    setFormTraditions(profile.traditions || '');
    setFormFood(profile.favoriteFood || '');
    setFormHistory(profile.historyInterest || '');
    setEditing(true);
    setSaveMsg('');
  }

  async function handleSave() {
    if (!session?.user?.id) return;
    setSaving(true);
    setSaveMsg('');
    try {
      const result = await updateUserProfileAction(session.user.id, {
        bio: formBio.trim() || null,
        traditions: formTraditions.trim() || null,
        favoriteFood: formFood.trim() || null,
        historyInterest: formHistory.trim() || null,
      });
      if (result.success) {
        setSaveMsg('Saved!');
        await loadProfile();
        setTimeout(() => { setEditing(false); setSaveMsg(''); }, 800);
      } else {
        setSaveMsg(result.error);
      }
    } catch (err: any) {
      console.error('[Kakatua] Profile: save failed:', err);
      setSaveMsg(err?.message || 'Failed to save. Please try again.');
    }
    setSaving(false);
  }

  const hasIdentity = profile && (profile.bio || profile.traditions || profile.favoriteFood || profile.historyInterest);
  const isProtectedAmbassador = profile?.isAmbassador && !!profile?.ambassadorRole;

  const identitySections = [
    { key: 'bio', label: 'About Me', icon: 'feather', color: '#5f7d45', bg: '#e8efda', text: profile?.bio },
    { key: 'traditions', label: 'Traditions', icon: 'leaf', color: '#a08050', bg: '#f3e8cf', text: profile?.traditions },
    { key: 'food', label: 'Favourite Food', icon: 'berry', color: '#b26a3a', bg: '#f7e0ce', text: profile?.favoriteFood },
    { key: 'history', label: 'History Interest', icon: 'twig', color: '#6f573d', bg: '#efe3cc', text: profile?.historyInterest },
  ].filter((s) => s.text && s.text.trim().length > 0);

  const tzLabel = profile ? `UTC ${profile.timezoneOffset >= 0 ? '+' : ''}${profile.timezoneOffset}` : '';

  return (
    <LayoutShell activeTab="profile" userId={session?.user?.id}>
      <div className="relative flex flex-col pb-24 pt-2">
        {/* warm organic backdrop — soft, diffused pools of light */}
        <div className="pointer-events-none absolute -top-14 -left-12 w-64 h-64 rounded-full bg-[#d9a441]/15 blur-3xl" />
        <div className="pointer-events-none absolute top-52 -right-14 w-72 h-72 rounded-full bg-[#5f7d45]/15 blur-3xl" />
        <div className="pointer-events-none absolute top-[36rem] -left-16 w-72 h-72 rounded-full bg-[#c9775a]/12 blur-3xl" />
        <div className="pointer-events-none absolute top-[62rem] right-0 w-64 h-64 rounded-full bg-[#a08050]/12 blur-3xl" />

        <div className="relative z-10 flex flex-col">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-8 h-8 border-2 border-[#a08050] border-t-[#3f5a2e] rounded-full animate-spin mb-3" />
              <p className="text-[11px] text-[#8a7a5e]">Gathering twigs for your nest...</p>
            </div>
          )}

          {!loading && error && (
            <div className="bg-[#f7e0ce] border border-[#b26a3a]/30 rounded-2xl px-4 py-3 text-[11px] text-[#a04a2a] text-center">
              <span className="material-symbols-outlined text-sm align-middle mr-1">error</span>
              {error}
            </div>
          )}

          {!loading && !error && !profile && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="material-symbols-outlined text-4xl text-[#cbb894] mb-2">person_off</span>
              <p className="text-[11px] text-[#8a7a5e]">Could not find your nest.</p>
            </div>
          )}

          {!loading && !error && profile && (
            <>
              {/* ─── Header nugget: wreath portrait ─────────────────────── */}
              <Nugget className="-rotate-[0.8deg]">
                <div className="flex flex-col items-center text-center">
                  <div className="relative w-[80px] h-[80px] rounded-full flex-shrink-0">
                    {/* woven twig ring */}
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background:
                          'conic-gradient(#7a5f3e 0deg, #a08050 40deg, #6f573d 85deg, #a88657 130deg, #7a5f3e 175deg, #9c7b4f 220deg, #6f573d 265deg, #a08050 310deg, #7a5f3e 360deg)',
                        boxShadow: '0 6px 16px rgba(74,61,44,0.25)',
                      }}
                    />
                    {/* moss lining */}
                    <div className="absolute inset-[5px] rounded-full" style={{ background: 'linear-gradient(135deg,#8aa668,#5f7d45)' }} />
                    {/* photo */}
                    <div className="absolute inset-[10px] rounded-full overflow-hidden bg-[#f0e2c4]">
                      {profile.avatarUrl ? (
                        <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="w-full h-full flex items-center justify-center text-[#6f573d]">
                          <FeatherIcon className="w-6 h-6" />
                        </span>
                      )}
                    </div>
                    {/* little leaves & berries nestled on the wreath */}
                    <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[#5f7d45] shadow-sm" />
                    <span className="absolute top-2 -left-1 w-2 h-2 rounded-full bg-[#7d9c63] shadow-sm" />
                    <span className="absolute bottom-0.5 -left-0.5 w-2 h-2 rounded-full bg-[#d9a441] shadow-sm" />
                    <span className="absolute bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#b26a3a] shadow-sm" />
                  </div>

                  <h2 className="mt-3 text-base font-bold text-[#3f5a2e] truncate">{profile.name}</h2>
                  <p className="text-[11px] text-[#8a7a5e] truncate max-w-full">{profile.email}</p>

                  <div className="flex items-center gap-2 mt-2 flex-wrap justify-center">
                    <span className={`w-1.5 h-1.5 rounded-full ${profile.status === 'active' ? 'bg-[#5f7d45]' : 'bg-[#b26a3a]'}`} />
                    <span className="text-[10px] text-[#6f573d] font-medium capitalize">{profile.status}</span>
                    {profile.isAmbassador && profile.ambassadorRole && ROLE_LABELS[profile.ambassadorRole] && (
                      <span
                        className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full flex items-center gap-0.5"
                        style={{ color: ROLE_LABELS[profile.ambassadorRole].color, backgroundColor: ROLE_LABELS[profile.ambassadorRole].bg }}
                      >
                        <span className="material-symbols-outlined text-[10px]">{ROLE_LABELS[profile.ambassadorRole].icon}</span>
                        {ROLE_LABELS[profile.ambassadorRole].label}
                      </span>
                    )}
                    {profile.isAmbassador && !profile.ambassadorRole && (
                      <span className="text-[10px] bg-[#f4e2b8] text-[#8a6d4d] px-1.5 py-0.5 rounded-full font-bold">Ambassador</span>
                    )}
                  </div>

                  <TwigDivider className="w-2/3 mt-3" />
                  <p className="text-[10px] italic text-[#a08050] mt-2">« every nest has a story »</p>
                </div>
              </Nugget>

              {/* ─── IDENTITY: Empty state → Create CTA ────────────────── */}
              {!hasIdentity && !editing && !isProtectedAmbassador && (
                <Nugget className="-mt-5 rotate-[0.8deg]">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-[#f4e2b8]/70 flex items-center justify-center mb-3 shadow-inner">
                      <TwigIcon className="w-7 h-7 text-[#a08050]" />
                    </div>
                    <h3 className="text-sm font-bold text-[#6f573d] mb-1">Your cultural card is waiting</h3>
                    <p className="text-[11px] text-[#8a7a5e] leading-relaxed max-w-[80%] mb-4">
                      Share your traditions, flavours, and history with the flock. Every nest has a story — let yours be heard.
                    </p>
                    <Link
                      href="/profile/create-card"
                      className="bg-[#3f5a2e] hover:bg-[#2c4420] active:scale-[0.98] transition-all text-white font-semibold text-xs py-3 px-6 rounded-full flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(63,90,46,0.25)]"
                    >
                      <span className="material-symbols-outlined text-lg">add</span>
                      Create a Cultural Card
                    </Link>
                  </div>
                </Nugget>
              )}

              {/* ─── IDENTITY: Filled state ────────────────────────────── */}
              {hasIdentity && !editing && (
                <Nugget className="-mt-5 rotate-[0.6deg]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-[#e8efda] flex items-center justify-center text-[#3f5a2e]">
                        <TwigIcon className="w-4 h-4" />
                      </span>
                      <h3 className="text-xs font-bold text-[#3f5a2e] tracking-tight">My Identity</h3>
                    </div>
                    {!isProtectedAmbassador ? (
                      <button
                        onClick={openEdit}
                        className="text-[11px] font-semibold text-[#8a6d4d] hover:text-[#6f573d] transition-colors flex items-center gap-1 bg-[#f4e2b8]/60 hover:bg-[#f4e2b8] px-3 py-1 rounded-full"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                        Edit
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold text-[#8a7a5e] flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">shield</span>
                        Guardian
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    {identitySections.map((s, idx) => (
                      <React.Fragment key={s.key}>
                        <div className="flex gap-2.5 items-start">
                          <span
                            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                            style={{ color: s.color, backgroundColor: s.bg }}
                          >
                            {ICONS[s.icon]}
                          </span>
                          <div className="min-w-0">
                            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-[#8a7a5e]">{s.label}</h4>
                            <p className="text-xs text-[#4a3d2c] leading-relaxed mt-0.5">{s.text}</p>
                          </div>
                        </div>
                        {idx < identitySections.length - 1 && <TwigDivider className="my-1.5" />}
                      </React.Fragment>
                    ))}
                  </div>
                </Nugget>
              )}

              {/* ─── IDENTITY: Edit form ───────────────────────────────── */}
              {editing && (
                <Nugget className="-mt-5 rotate-[0.6deg] animate-fade-in">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-8 h-8 rounded-full bg-[#f4e2b8] flex items-center justify-center text-[#8a6d4d]">
                      <FeatherIcon className="w-4 h-4" />
                    </span>
                    <h3 className="text-xs font-bold text-[#6f573d]">Edit Your Card</h3>
                  </div>

                  <div className="flex flex-col gap-3.5">
                    <div>
                      <label className={labelCls}>About You</label>
                      <textarea
                        value={formBio}
                        onChange={(e) => setFormBio(e.target.value)}
                        placeholder="A short bio — who are you beyond the nest?"
                        rows={2}
                        className={inputCls}
                      />
                    </div>

                    <div>
                      <label className={labelCls}>Traditions</label>
                      <textarea
                        value={formTraditions}
                        onChange={(e) => setFormTraditions(e.target.value)}
                        placeholder="What customs or rituals are meaningful to you?"
                        rows={2}
                        className={inputCls}
                      />
                    </div>

                    <div>
                      <label className={labelCls}>Favourite Food</label>
                      <textarea
                        value={formFood}
                        onChange={(e) => setFormFood(e.target.value)}
                        placeholder="A dish that tells a story about your culture?"
                        rows={2}
                        className={inputCls}
                      />
                    </div>

                    <div>
                      <label className={labelCls}>History Interest</label>
                      <textarea
                        value={formHistory}
                        onChange={(e) => setFormHistory(e.target.value)}
                        placeholder="What piece of history or culture fascinates you?"
                        rows={2}
                        className={inputCls}
                      />
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 bg-[#3f5a2e] hover:bg-[#2c4420] active:scale-[0.98] disabled:opacity-50 transition-all text-white font-semibold text-xs py-2.5 px-4 rounded-full flex items-center justify-center gap-1.5 shadow-[0_8px_18px_rgba(63,90,46,0.2)]"
                      >
                        {saving ? (
                          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <span className="material-symbols-outlined text-sm">check</span>
                        )}
                        {saveMsg === 'Saved!' ? 'Saved!' : 'Save Changes'}
                      </button>
                      <button
                        onClick={() => { setEditing(false); setSaveMsg(''); }}
                        className="text-[11px] font-medium text-[#8a7a5e] hover:text-[#6f573d] transition-colors px-3 py-2.5"
                      >
                        Cancel
                      </button>
                    </div>
                    {saveMsg && saveMsg !== 'Saved!' && (
                      <p className="text-[10px] text-[#b26a3a] text-center">{saveMsg}</p>
                    )}
                  </div>
                </Nugget>
              )}

              {/* ─── Nugget: Nest Languages (small eggs) ───────────────── */}
              <Nugget className="-mt-4 -rotate-[1deg]">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-8 h-8 rounded-full bg-[#e8efda] flex items-center justify-center text-[#5f7d45]">
                    <EggIcon className="w-4 h-4" />
                  </span>
                  <h3 className="text-xs font-bold text-[#3f5a2e] tracking-tight">Nest Languages</h3>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {profile.nativeLanguages.map((l) => (
                    <span key={l} className="flex items-center gap-1.5 bg-[#e8efda] text-[#3f5a2e] px-3 py-1.5 rounded-full text-[11px] font-semibold">
                      <EggIcon className="w-3 h-3" /> {l}
                    </span>
                  ))}
                  {profile.nativeLanguages.length > 0 && profile.learningLanguages.length > 0 && (
                    <span className="text-[#a08050] rotate-45 flex-shrink-0">
                      <TwigIcon className="w-4 h-4" />
                    </span>
                  )}
                  {profile.learningLanguages.map((l) => (
                    <span key={l} className="flex items-center gap-1.5 bg-[#f3e8cf] text-[#6f573d] px-3 py-1.5 rounded-full text-[11px] font-semibold">
                      <EggIcon className="w-3 h-3" /> {l}
                    </span>
                  ))}
                  {profile.nativeLanguages.length === 0 && profile.learningLanguages.length === 0 && (
                    <span className="text-[11px] text-[#b3a583]">No languages lined up yet — visit Nest Settings to add eggs.</span>
                  )}
                </div>
              </Nugget>

              {/* ─── Nugget: Interests (leaves & berries) ──────────────── */}
              <Nugget className="-mt-4 rotate-[1deg]">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-8 h-8 rounded-full bg-[#f7e0ce] flex items-center justify-center text-[#b26a3a]">
                    <BerryIcon className="w-4 h-4" />
                  </span>
                  <h3 className="text-xs font-bold text-[#6f573d] tracking-tight">Nest Berries</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((i) => (
                    <span key={i} className="flex items-center gap-1 bg-[#f3e8cf] text-[#6f573d] px-2.5 py-1 rounded-full text-[10px] font-medium">
                      <LeafIcon className="w-3 h-3 text-[#5f7d45]" /> {i}
                    </span>
                  ))}
                  {profile.interests.length === 0 && (
                    <span className="text-[11px] text-[#b3a583]">The berry basket is empty — add interests in Nest Settings.</span>
                  )}
                </div>
              </Nugget>

              {/* ─── Nugget: Nest Rhythm (timezone / availability) ─────── */}
              <Nugget className="-mt-4 -rotate-[0.5deg]">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-8 h-8 rounded-full bg-[#f4e2b8] flex items-center justify-center text-[#8a6d4d]">
                    <span className="material-symbols-outlined text-base">wb_sunny</span>
                  </span>
                  <h3 className="text-xs font-bold text-[#8a6d4d] tracking-tight">Nest Rhythm</h3>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-[#f4e2b8] text-[#8a6d4d] px-3 py-1.5 rounded-full text-[11px] font-bold">{tzLabel}</span>
                  <p className="text-[10px] text-[#8a7a5e]">
                    Your perch stays on this clock. Availability slots are tuned in <span className="font-semibold text-[#6f573d]">Nest Settings</span>.
                  </p>
                </div>
              </Nugget>

              {/* ─── Warm CTAs ─────────────────────────────────────────── */}
              <button
                onClick={() => setGrammarOpen(true)}
                className="w-full -mt-3 -rotate-[0.3deg] rounded-[26px] bg-[#faf1dd] border border-[#e5c98d]/50 px-4 py-3.5 flex items-center gap-3 shadow-[0_8px_20px_rgba(74,61,44,0.08),0_2px_4px_rgba(74,61,44,0.04)] transition-all hover:shadow-[0_14px_30px_rgba(74,61,44,0.14)] hover:-translate-y-0.5 group"
              >
                <span className="w-9 h-9 rounded-full bg-[#f4e2b8] flex items-center justify-center text-[#8a6d4d] flex-shrink-0 group-hover:rotate-6 transition-transform">
                  <FeatherIcon className="w-4 h-4" />
                </span>
                <span className="text-left min-w-0">
                  <span className="block text-xs font-bold text-[#6f573d]">Polishing My Wings</span>
                  <span className="block text-[10px] text-[#8a7a5e] mt-0.5">Grammar & style check for your writing</span>
                </span>
                <span className="material-symbols-outlined text-lg text-[#c2b28a] group-hover:text-[#8a6d4d] transition-colors ml-auto">arrow_forward</span>
              </button>

              <Link
                href="/profile/settings"
                className="w-full -mt-2 rotate-[0.3deg] rounded-[26px] bg-[#faf1dd] border border-[#c8d4ae]/50 px-4 py-3.5 flex items-center gap-3 shadow-[0_8px_20px_rgba(74,61,44,0.08),0_2px_4px_rgba(74,61,44,0.04)] transition-all hover:shadow-[0_14px_30px_rgba(74,61,44,0.14)] hover:-translate-y-0.5 group"
              >
                <span className="w-9 h-9 rounded-full bg-[#e8efda] flex items-center justify-center text-[#5f7d45] flex-shrink-0 group-hover:rotate-6 transition-transform">
                  <span className="material-symbols-outlined text-lg">tune</span>
                </span>
                <span className="text-left min-w-0">
                  <span className="block text-xs font-bold text-[#3f5a2e]">Nest Settings</span>
                  <span className="block text-[10px] text-[#8a7a5e] mt-0.5">Languages, availability, privacy & profile photo</span>
                </span>
                <span className="material-symbols-outlined text-lg text-[#c2b28a] group-hover:text-[#5f7d45] transition-colors ml-auto">arrow_forward</span>
              </Link>
            </>
          )}
        </div>
      </div>
      <GrammarCheckModal isOpen={grammarOpen} onClose={() => setGrammarOpen(false)} />
    </LayoutShell>
  );
}
