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
  GUIDE: { label: 'Kakatua Guide', icon: 'menu_book', color: '#2d5a27', bg: '#bcf0ae' },
  MATCHMAKER: { label: 'Global Buddy', icon: 'handshake', color: '#7b5800', bg: '#ffdea5' },
  CULTURAL_ADVISOR: { label: 'Dhaka Local', icon: 'location_on', color: '#6d1d06', bg: '#ffdbd1' },
};

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
    { key: 'bio', label: 'About Me', icon: 'person', color: '#2d5a27', bg: '#bcf0ae', text: profile?.bio },
    { key: 'traditions', label: 'Traditions', icon: 'diversity_3', color: '#7b5800', bg: '#ffdea5', text: profile?.traditions },
    { key: 'food', label: 'Favourite Food', icon: 'restaurant', color: '#6d1d06', bg: '#ffdbd1', text: profile?.favoriteFood },
    { key: 'history', label: 'History Interest', icon: 'auto_stories', color: '#154212', bg: '#bcf0ae', text: profile?.historyInterest },
  ].filter((s) => s.text && s.text.trim().length > 0);

  return (
    <LayoutShell activeTab="profile" userId={session?.user?.id}>
      <div className="flex flex-col gap-5 pb-24 pt-2">

        {loading && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-8 h-8 border-2 border-[#a1d494] border-t-[#2D5A27] rounded-full animate-spin mb-3" />
            <p className="text-[11px] text-[#72796e]">Loading your nest...</p>
          </div>
        )}

        {!loading && error && (
          <div className="bg-[#ffdad6] border border-[#ba1a1a]/20 rounded-xl px-4 py-3 text-[11px] text-[#ba1a1a] text-center">
            <span className="material-symbols-outlined text-sm align-middle mr-1">error</span>
            {error}
          </div>
        )}

        {!loading && !error && !profile && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="material-symbols-outlined text-4xl text-[#c2c9bb] mb-2">person_off</span>
            <p className="text-[11px] text-[#72796e]">Could not load your profile.</p>
          </div>
        )}

        {!loading && !error && profile && (
          <>
            {/* Profile Header */}
            <div className="flex items-center gap-4 bg-[#ffffff] border border-[#efeeea] rounded-[20px] p-5 shadow-sm">
              <div className="w-14 h-14 rounded-full bg-[#2d5a27] border-2 border-[#a1d494] overflow-hidden flex-shrink-0">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined w-full h-full flex items-center justify-center text-white text-2xl">flutter_dash</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-bold text-[#154212] truncate">{profile.name}</h2>
                <p className="text-[11px] text-[#72796e] truncate">{profile.email}</p>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <span className={`w-1.5 h-1.5 rounded-full ${profile.status === 'active' ? 'bg-[#2D5A27]' : 'bg-[#ba1a1a]'}`} />
                  <span className="text-[10px] text-[#42493e] font-medium capitalize">{profile.status}</span>
                  {profile.isAmbassador && profile.ambassadorRole && ROLE_LABELS[profile.ambassadorRole] && (
                    <span
                      className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full flex items-center gap-0.5"
                      style={{ color: ROLE_LABELS[profile.ambassadorRole].color, backgroundColor: `${ROLE_LABELS[profile.ambassadorRole].bg}60` }}
                    >
                      <span className="material-symbols-outlined text-[10px]">{ROLE_LABELS[profile.ambassadorRole].icon}</span>
                      {ROLE_LABELS[profile.ambassadorRole].label}
                    </span>
                  )}
                  {profile.isAmbassador && !profile.ambassadorRole && (
                    <span className="text-[10px] bg-[#ffdea5] text-[#6c4d00] px-1.5 py-0.5 rounded-full font-bold ml-1">Ambassador</span>
                  )}
                </div>
              </div>
            </div>

            {/* ====== IDENTITY: Empty State → Create CTA (blocked for ambassadors) ====== */}
            {!hasIdentity && !editing && !isProtectedAmbassador && (
              <div className="bg-gradient-to-br from-[#f5f3ef] to-[#efeeea] border border-[#c2c9bb]/30 rounded-[24px] p-6 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-[#bcf0ae]/40 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-3xl text-[#2D5A27]">nest_eco_leaf</span>
                </div>
                <h3 className="text-sm font-bold text-[#154212] mb-1">Your cultural card is waiting</h3>
                <p className="text-[11px] text-[#72796e] leading-relaxed max-w-[80%] mb-5">
                  Share your traditions, flavours, and history with the flock. Every nest has a story — let yours be heard.
                </p>
                <Link
                  href="/profile/create-card"
                  className="bg-[#2D5A27] hover:bg-[#154212] active:scale-[0.98] transition-all text-white font-semibold text-xs py-3 px-6 rounded-full flex items-center justify-center gap-2 shadow-md shadow-[#2d5a27]/10"
                >
                  <span className="material-symbols-outlined text-lg">add</span>
                  Create a Cultural Card
                </Link>
              </div>
            )}

            {/* ====== IDENTITY: Filled State → Display ====== */}
            {hasIdentity && !editing && (
              <div className="bg-[#ffffff] border border-[#efeeea] rounded-[20px] shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 pt-4 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#2D5A27] text-lg">nest_eco_leaf</span>
                    <h3 className="text-xs font-bold text-[#154212] tracking-tight">My Identity</h3>
                  </div>
                  {/* Hide Edit for protected ambassadors */}
                  {!isProtectedAmbassador && (
                    <button
                      onClick={openEdit}
                      className="text-[11px] font-semibold text-[#2D5A27] hover:text-[#154212] transition-colors flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                      Edit
                    </button>
                  )}
                  {isProtectedAmbassador && (
                    <span className="text-[10px] font-bold text-[#72796e] flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">shield</span>
                      Guardian
                    </span>
                  )}
                </div>
                <div className="px-5 pb-4 flex flex-col gap-3">
                  {identitySections.map((s) => (
                    <div key={s.key} className="flex gap-2.5 items-start">
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
                </div>
              </div>
            )}

            {/* ====== EDIT FORM (inline) ====== */}
            {editing && (
              <div className="bg-[#ffffff] border border-[#a1d494]/40 rounded-[20px] shadow-md p-5 flex flex-col gap-4 animate-fade-in">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#2D5A27] text-lg">edit_note</span>
                  <h3 className="text-xs font-bold text-[#154212]">Edit Your Card</h3>
                </div>

                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-[#72796e] mb-1 block">About You</label>
                  <textarea
                    value={formBio}
                    onChange={(e) => setFormBio(e.target.value)}
                    placeholder="A short bio — who are you beyond the nest?"
                    rows={2}
                    className="w-full bg-[#f5f3ef] border border-[#dbdad6] rounded-xl px-3 py-2.5 text-xs text-[#1b1c1a] placeholder:text-[#a0a0a0] focus:outline-none focus:ring-2 focus:ring-[#a1d494] resize-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-[#72796e] mb-1 block">Traditions</label>
                  <textarea
                    value={formTraditions}
                    onChange={(e) => setFormTraditions(e.target.value)}
                    placeholder="What customs or rituals are meaningful to you?"
                    rows={2}
                    className="w-full bg-[#f5f3ef] border border-[#dbdad6] rounded-xl px-3 py-2.5 text-xs text-[#1b1c1a] placeholder:text-[#a0a0a0] focus:outline-none focus:ring-2 focus:ring-[#a1d494] resize-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-[#72796e] mb-1 block">Favourite Food</label>
                  <textarea
                    value={formFood}
                    onChange={(e) => setFormFood(e.target.value)}
                    placeholder="A dish that tells a story about your culture?"
                    rows={2}
                    className="w-full bg-[#f5f3ef] border border-[#dbdad6] rounded-xl px-3 py-2.5 text-xs text-[#1b1c1a] placeholder:text-[#a0a0a0] focus:outline-none focus:ring-2 focus:ring-[#a1d494] resize-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-[#72796e] mb-1 block">History Interest</label>
                  <textarea
                    value={formHistory}
                    onChange={(e) => setFormHistory(e.target.value)}
                    placeholder="What piece of history or culture fascinates you?"
                    rows={2}
                    className="w-full bg-[#f5f3ef] border border-[#dbdad6] rounded-xl px-3 py-2.5 text-xs text-[#1b1c1a] placeholder:text-[#a0a0a0] focus:outline-none focus:ring-2 focus:ring-[#a1d494] resize-none transition-all"
                  />
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 bg-[#2D5A27] hover:bg-[#154212] active:scale-[0.98] disabled:opacity-50 transition-all text-white font-semibold text-xs py-2.5 px-4 rounded-full flex items-center justify-center gap-1.5"
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
                    className="text-[11px] font-medium text-[#72796e] hover:text-[#42493e] transition-colors px-3 py-2.5"
                  >
                    Cancel
                  </button>
                </div>
                {saveMsg && saveMsg !== 'Saved!' && (
                  <p className="text-[10px] text-[#ba1a1a] text-center">{saveMsg}</p>
                )}
              </div>
            )}

            {/* Polishing My Wings CTA */}
            <button
              onClick={() => setGrammarOpen(true)}
              className="w-full bg-[#ffffff] border border-[#dbdad6] hover:border-[#a1d494]/50 rounded-[20px] p-4 shadow-sm flex items-center gap-3 transition-all hover:shadow-md group"
            >
              <div className="w-10 h-10 rounded-full bg-[#ffdea5]/40 flex items-center justify-center flex-shrink-0 group-hover:bg-[#ffdea5]/60 transition-colors">
                <span className="material-symbols-outlined text-lg text-[#7b5800]">edit_note</span>
              </div>
              <div className="text-left min-w-0">
                <h3 className="text-xs font-bold text-[#154212]">Polishing My Wings</h3>
                <p className="text-[10px] text-[#72796e] mt-0.5">Grammar & style check for your writing</p>
              </div>
              <span className="material-symbols-outlined text-[#c2c9bb] group-hover:text-[#2D5A27] transition-colors ml-auto">arrow_forward</span>
            </button>

            {/* Quick Info */}
            <div className="bg-[#ffffff] border border-[#efeeea] rounded-2xl p-4 shadow-sm">
              <h3 className="text-[10px] font-semibold uppercase tracking-wider text-[#72796e] mb-3">Quick Info</h3>
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-sm text-[#2D5A27]">language</span>
                  <span className="text-xs text-[#1b1c1a]">
                    Speaks {profile.nativeLanguages.length > 0 ? profile.nativeLanguages.join(', ') : '—'} → Learning {profile.learningLanguages.length > 0 ? profile.learningLanguages.join(', ') : '—'}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-sm text-[#7b5800]">schedule</span>
                  <span className="text-xs text-[#1b1c1a]">
                    UTC {profile.timezoneOffset >= 0 ? '+' : ''}{profile.timezoneOffset}
                  </span>
                </div>
                {profile.interests.length > 0 && (
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-sm text-[#6d1d06] mt-0.5">star</span>
                    <div className="flex flex-wrap gap-1">
                      {profile.interests.map((interest) => (
                        <span key={interest} className="text-[10px] bg-[#f5f3ef] text-[#42493e] px-2 py-0.5 rounded-full">
                          #{interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
      <GrammarCheckModal isOpen={grammarOpen} onClose={() => setGrammarOpen(false)} />
    </LayoutShell>
  );
}
