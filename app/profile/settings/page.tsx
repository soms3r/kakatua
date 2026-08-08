'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import LayoutShell from '../../components/LayoutShell';
import {
  getProfileSettingsAction,
  updateProfileSettingsAction,
} from '../../actions/profileSettings';
import type {
  InterestOption,
  LanguageOption,
  ProfileSettingsPayload,
  UserLanguageEntry,
} from '../../actions/types';

const inputCls =
  'w-full bg-[#f5f3ef] border border-[#dbdad6] rounded-xl px-3 py-2.5 text-xs text-[#1b1c1a] placeholder:text-[#a0a0a0] focus:outline-none focus:ring-2 focus:ring-[#a1d494] focus:border-transparent transition-all';
const labelCls = 'text-[10px] font-semibold uppercase tracking-wider text-[#72796e] mb-1 block';

const PROFICIENCY_OPTIONS = ['Beginner', 'Elementary', 'Intermediate', 'Upper Intermediate', 'Advanced', 'Fluent', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const GOAL_TYPES = ['FLUENCY', 'CONVERSATION', 'TRAVEL', 'CAREER', 'TEST_PREP', 'CULTURE'];
const GOAL_STATUSES = ['ACTIVE', 'COMPLETED', 'DROPPED'];
const SEEKING_OPTIONS = ['LANGUAGE_PARTNER', 'FRIEND', 'MENTOR', 'TUTOR'];
const CALL_PREFERENCES = ['ALL', 'VIDEO', 'AUDIO', 'TEXT'];
const CALL_PREFERENCE_LABELS: Record<string, string> = {
  ALL: 'All (Any)',
  VIDEO: 'Video',
  AUDIO: 'Audio',
  TEXT: 'Text',
};
const GENDER_OPTIONS = ['Female', 'Male', 'Non-binary', 'Prefer not to say'];
const PARTNER_GENDER_OPTIONS = ['Female', 'Male', 'Non-binary', 'Any'];
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function emptyPayload(): ProfileSettingsPayload {
  return {
    profile: {
      username: '', displayName: '', profilePhoto: '', bio: '',
      dateOfBirth: '', gender: '', country: '', city: '', timezone: '',
      nativeLanguage: '', interfaceLanguage: '',
    },
    nativeLanguages: [],
    learningLanguages: [],
    goals: [],
    matchPreference: {
      seeking: '', partnerGenderPreference: '', partnerAgeMin: null, partnerAgeMax: null,
      callPreference: '', conversationTopics: [],
    },
    interestIds: [],
    availability: [],
    privacySettings: {
      showProfile: true, showOnlineStatus: true, showLastActive: true, showEmail: false,
      showAge: true, showLocation: true, allowDMs: true, allowVideoCalls: true,
    },
  };
}

function normalizePayload(p: ProfileSettingsPayload): ProfileSettingsPayload {
  return {
    ...p,
    profile: {
      username: p.profile.username ?? '',
      displayName: p.profile.displayName ?? '',
      profilePhoto: p.profile.profilePhoto ?? '',
      bio: p.profile.bio ?? '',
      dateOfBirth: p.profile.dateOfBirth ? p.profile.dateOfBirth.slice(0, 10) : '',
      gender: p.profile.gender ?? '',
      country: p.profile.country ?? '',
      city: p.profile.city ?? '',
      timezone: p.profile.timezone ?? '',
      nativeLanguage: p.profile.nativeLanguage ?? '',
      interfaceLanguage: p.profile.interfaceLanguage ?? '',
    },
    matchPreference: {
      seeking: p.matchPreference.seeking ?? '',
      partnerGenderPreference: p.matchPreference.partnerGenderPreference ?? '',
      partnerAgeMin: p.matchPreference.partnerAgeMin,
      partnerAgeMax: p.matchPreference.partnerAgeMax,
      callPreference: p.matchPreference.callPreference ?? '',
      conversationTopics: p.matchPreference.conversationTopics ?? [],
    },
  };
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#ffffff] border border-[#efeeea] rounded-[20px] p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-[#2D5A27] text-lg">{icon}</span>
        <h2 className="text-xs font-bold text-[#154212] tracking-tight">{title}</h2>
      </div>
      <div className="flex flex-col gap-3.5">{children}</div>
    </div>
  );
}

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [form, setForm] = useState<ProfileSettingsPayload>(emptyPayload);
  const [languages, setLanguages] = useState<LanguageOption[]>([]);
  const [interests, setInterests] = useState<InterestOption[]>([]);
  const [topicsText, setTopicsText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const langById = useMemo(() => new Map(languages.map((l) => [l.id, l])), [languages]);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    const load = async () => {
      try {
        const result = await getProfileSettingsAction(userId);
        if (cancelled) return;
        if (result.success) {
          setForm(normalizePayload(result.data.payload));
          setLanguages(result.data.languages);
          setInterests(result.data.interests);
          setTopicsText(result.data.payload.matchPreference.conversationTopics.join(', '));
        } else {
          setMessage({ type: 'err', text: result.error });
        }
      } catch (err: any) {
        if (cancelled) return;
        setMessage({ type: 'err', text: err?.message || 'Failed to load profile settings.' });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [userId]);

  function updateProfile<K extends keyof ProfileSettingsPayload['profile']>(key: K, val: ProfileSettingsPayload['profile'][K]) {
    setForm((prev) => ({ ...prev, profile: { ...prev.profile, [key]: val } }));
  }

  function updateLanguages(
    key: 'nativeLanguages' | 'learningLanguages',
    entries: UserLanguageEntry[]
  ) {
    setForm((prev) => ({ ...prev, [key]: entries }));
  }

  function setLanguageRow(
    key: 'nativeLanguages' | 'learningLanguages',
    index: number,
    patch: Partial<UserLanguageEntry>
  ) {
    const rows = [...form[key]];
    rows[index] = { ...rows[index], ...patch };
    updateLanguages(key, rows);
  }

  function setMatch<K extends keyof ProfileSettingsPayload['matchPreference']>(key: K, val: ProfileSettingsPayload['matchPreference'][K]) {
    setForm((prev) => ({ ...prev, matchPreference: { ...prev.matchPreference, [key]: val } }));
  }

  function toggleInterest(id: string) {
    setForm((prev) => ({
      ...prev,
      interestIds: prev.interestIds.includes(id)
        ? prev.interestIds.filter((x) => x !== id)
        : [...prev.interestIds, id],
    }));
  }

  function setPrivacy<K extends keyof ProfileSettingsPayload['privacySettings']>(key: K, val: boolean) {
    setForm((prev) => ({ ...prev, privacySettings: { ...prev.privacySettings, [key]: val } }));
  }

  async function handleSave() {
    if (!userId) return;
    const username = form.profile.username?.trim();
    const displayName = form.profile.displayName?.trim();
    if (!username || !displayName) {
      setMessage({ type: 'err', text: 'Username and display name are required to save your settings.' });
      return;
    }
    if (form.nativeLanguages.length === 0 || form.learningLanguages.length === 0) {
      setMessage({ type: 'err', text: 'Please select at least one native language and one learning language.' });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const payload: ProfileSettingsPayload = {
        ...form,
        profile: {
          ...form.profile,
          dateOfBirth: form.profile.dateOfBirth || null,
          username: username,
          displayName: displayName,
          profilePhoto: form.profile.profilePhoto?.trim() || null,
          bio: form.profile.bio?.trim() || null,
          timezone: form.profile.timezone?.trim() || null,
        },
        matchPreference: {
          ...form.matchPreference,
          conversationTopics: topicsText.split(',').map((t) => t.trim()).filter(Boolean),
        },
      };
      const result = await updateProfileSettingsAction(userId, payload);
      if (result.success) {
        setMessage({ type: 'ok', text: 'Settings saved. Your nest is updated!' });
        router.refresh();
      } else {
        setMessage({ type: 'err', text: result.error });
      }
    } catch (err: any) {
      setMessage({ type: 'err', text: err?.message || 'Failed to save settings.' });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <LayoutShell activeTab="profile" userId={userId}>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-8 h-8 border-2 border-[#a1d494] border-t-[#2D5A27] rounded-full animate-spin mb-3" />
          <p className="text-[11px] text-[#72796e]">Loading your nest settings...</p>
        </div>
      </LayoutShell>
    );
  }

  return (
    <LayoutShell activeTab="profile" userId={userId}>
      <div className="flex flex-col gap-5 pb-24 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#2D5A27] text-xl">tune</span>
              <h1 className="text-base font-bold text-[#154212] tracking-tight">Nest Settings</h1>
            </div>
            <p className="text-[11px] text-[#72796e] mt-1 leading-relaxed">
              Shape how the flock sees you — your languages, availability, and preferences.
            </p>
          </div>
        </div>

        {/* Profile photo */}
        <Section title="Profile Photo" icon="image">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#2d5a27] border-2 border-[#a1d494] overflow-hidden flex-shrink-0">
              {form.profile.profilePhoto ? (
                <img src={form.profile.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined w-full h-full flex items-center justify-center text-white text-2xl">flutter_dash</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <label className={labelCls}>Image URL</label>
              <input
                value={form.profile.profilePhoto ?? ''}
                onChange={(e) => updateProfile('profilePhoto', e.target.value)}
                placeholder="Paste a link from a free image host (e.g. imgur.com/...)"
                className={inputCls}
              />
              <p className="text-[10px] text-[#a0a0a0] mt-1.5 italic">Use any free image hosting link — it will be stored as your profile photo.</p>
            </div>
          </div>
        </Section>

        {/* Identity */}
        <Section title="Identity" icon="person">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className={labelCls}>Username</label>
              <input value={form.profile.username ?? ''} onChange={(e) => updateProfile('username', e.target.value)} placeholder="@username" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Display Name</label>
              <input value={form.profile.displayName ?? ''} onChange={(e) => updateProfile('displayName', e.target.value)} placeholder="Your name" className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Bio</label>
            <textarea value={form.profile.bio ?? ''} onChange={(e) => updateProfile('bio', e.target.value)} rows={3} placeholder="Tell the flock a little about yourself..." className={inputCls} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
            <div>
              <label className={labelCls}>Date of Birth</label>
              <input type="date" value={form.profile.dateOfBirth ?? ''} onChange={(e) => updateProfile('dateOfBirth', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Gender</label>
              <select value={form.profile.gender ?? ''} onChange={(e) => updateProfile('gender', e.target.value)} className={inputCls}>
                <option value="">Select...</option>
                {GENDER_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Timezone</label>
              <input value={form.profile.timezone ?? ''} onChange={(e) => updateProfile('timezone', e.target.value)} placeholder="Asia/Dhaka or UTC+05:30" className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className={labelCls}>Country</label>
              <input value={form.profile.country ?? ''} onChange={(e) => updateProfile('country', e.target.value)} placeholder="Bangladesh" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>City</label>
              <input value={form.profile.city ?? ''} onChange={(e) => updateProfile('city', e.target.value)} placeholder="Dhaka" className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className={labelCls}>Native Language</label>
              <select value={form.profile.nativeLanguage ?? ''} onChange={(e) => updateProfile('nativeLanguage', e.target.value)} className={inputCls}>
                <option value="">Select...</option>
                {languages.map((l) => <option key={l.id} value={l.code}>{l.flagEmoji ? `${l.flagEmoji} ` : ''}{l.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Interface Language</label>
              <select value={form.profile.interfaceLanguage ?? ''} onChange={(e) => updateProfile('interfaceLanguage', e.target.value)} className={inputCls}>
                <option value="">Select...</option>
                {languages.map((l) => <option key={l.id} value={l.code}>{l.flagEmoji ? `${l.flagEmoji} ` : ''}{l.name}</option>)}
              </select>
            </div>
          </div>
        </Section>

        {/* Languages */}
        <Section title="Languages" icon="translate">
          <LanguageRows
            title="Native Languages"
            rows={form.nativeLanguages}
            languages={languages}
            langById={langById}
            onChange={(rows) => updateLanguages('nativeLanguages', rows)}
            setRow={(i, patch) => setLanguageRow('nativeLanguages', i, patch)}
          />
          <LanguageRows
            title="Learning Languages"
            rows={form.learningLanguages}
            languages={languages}
            langById={langById}
            onChange={(rows) => updateLanguages('learningLanguages', rows)}
            setRow={(i, patch) => setLanguageRow('learningLanguages', i, patch)}
          />
        </Section>

        {/* Goals */}
        <Section title="Learning Goals" icon="flag">
          {form.goals.map((goal, i) => (
            <div key={i} className="flex flex-col gap-2.5 p-3 bg-[#fbf9f5] border border-[#efeeea] rounded-xl">
              <div className="flex items-center gap-2.5">
                <select
                  value={goal.goalType}
                  onChange={(e) => setForm((prev) => {
                    const goals = [...prev.goals];
                    goals[i] = { ...goals[i], goalType: e.target.value };
                    return { ...prev, goals };
                  })}
                  className={inputCls}
                >
                  {GOAL_TYPES.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                </select>
                <select
                  value={goal.languageId ?? ''}
                  onChange={(e) => setForm((prev) => {
                    const goals = [...prev.goals];
                    goals[i] = { ...goals[i], languageId: e.target.value || null };
                    return { ...prev, goals };
                  })}
                  className={inputCls}
                >
                  <option value="">Any language</option>
                  {languages.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, goals: prev.goals.filter((_, idx) => idx !== i) }))}
                  className="material-symbols-outlined text-[#ba1a1a] hover:bg-[#ffdad6] rounded-lg p-2 text-sm transition-colors"
                  aria-label="Remove goal"
                >
                  delete
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <select
                  value={goal.targetLevel ?? ''}
                  onChange={(e) => setForm((prev) => {
                    const goals = [...prev.goals];
                    goals[i] = { ...goals[i], targetLevel: e.target.value || null };
                    return { ...prev, goals };
                  })}
                  className={inputCls}
                >
                  <option value="">Target level</option>
                  {PROFICIENCY_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
                <input
                  type="date"
                  value={goal.targetDate ? goal.targetDate.slice(0, 10) : ''}
                  onChange={(e) => setForm((prev) => {
                    const goals = [...prev.goals];
                    goals[i] = { ...goals[i], targetDate: e.target.value || null };
                    return { ...prev, goals };
                  })}
                  className={inputCls}
                />
                <select
                  value={goal.status}
                  onChange={(e) => setForm((prev) => {
                    const goals = [...prev.goals];
                    goals[i] = { ...goals[i], status: e.target.value };
                    return { ...prev, goals };
                  })}
                  className={inputCls}
                >
                  {GOAL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setForm((prev) => ({
              ...prev,
              goals: [...prev.goals, { goalType: 'CONVERSATION', languageId: null, targetLevel: null, targetDate: null, status: 'ACTIVE' }],
            }))}
            className="self-start flex items-center gap-1.5 text-[11px] font-semibold text-[#2D5A27] hover:text-[#154212] transition-colors"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Add a goal
          </button>
        </Section>

        {/* Match preferences */}
        <Section title="Match Preferences" icon="handshake">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
            <div>
              <label className={labelCls}>Seeking</label>
              <select value={form.matchPreference.seeking ?? ''} onChange={(e) => setMatch('seeking', e.target.value)} className={inputCls}>
                <option value="">Select...</option>
                {SEEKING_OPTIONS.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Partner Gender</label>
              <select value={form.matchPreference.partnerGenderPreference ?? ''} onChange={(e) => setMatch('partnerGenderPreference', e.target.value || null)} className={inputCls}>
                <option value="">Any</option>
                {PARTNER_GENDER_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Call Preference</label>
              <select value={form.matchPreference.callPreference ?? ''} onChange={(e) => setMatch('callPreference', e.target.value)} className={inputCls}>
                <option value="">No preference</option>
                {CALL_PREFERENCES.map((c) => <option key={c} value={c}>{CALL_PREFERENCE_LABELS[c] ?? c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className={labelCls}>Partner Age Min</label>
              <input type="number" min={16} max={99} value={form.matchPreference.partnerAgeMin ?? ''} onChange={(e) => setMatch('partnerAgeMin', e.target.value ? Number(e.target.value) : null)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Partner Age Max</label>
              <input type="number" min={16} max={99} value={form.matchPreference.partnerAgeMax ?? ''} onChange={(e) => setMatch('partnerAgeMax', e.target.value ? Number(e.target.value) : null)} className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Conversation Topics</label>
            <input value={topicsText} onChange={(e) => setTopicsText(e.target.value)} placeholder="food, travel, music, technology (comma separated)" className={inputCls} />
          </div>
        </Section>

        {/* Interests */}
        <Section title="Interests" icon="star">
          {interests.length === 0 && <p className="text-[11px] text-[#72796e]">No interests available yet.</p>}
          <div className="flex flex-wrap gap-2">
            {interests.map((interest) => {
              const active = form.interestIds.includes(interest.id);
              return (
                <button
                  type="button"
                  key={interest.id}
                  onClick={() => toggleInterest(interest.id)}
                  className={`text-[11px] font-medium px-3 py-1.5 rounded-full border transition-all ${
                    active
                      ? 'bg-[#2D5A27] text-white border-[#2D5A27] shadow-sm'
                      : 'bg-[#f5f3ef] text-[#42493e] border-[#dbdad6] hover:border-[#a1d494]'
                  }`}
                >
                  {interest.name}
                </button>
              );
            })}
          </div>
        </Section>

        {/* Availability */}
        <Section title="Availability" icon="schedule">
          {form.availability.map((slot, i) => (
            <div key={i} className="flex items-center gap-2.5 p-3 bg-[#fbf9f5] border border-[#efeeea] rounded-xl">
              <select
                value={slot.dayOfWeek}
                onChange={(e) => setForm((prev) => {
                  const availability = [...prev.availability];
                  availability[i] = { ...availability[i], dayOfWeek: Number(e.target.value) };
                  return { ...prev, availability };
                })}
                className={`${inputCls} sm:w-32`}
              >
                {DAY_LABELS.map((d, idx) => <option key={d} value={idx}>{d}</option>)}
              </select>
              <input type="time" value={slot.startTime} onChange={(e) => setForm((prev) => {
                const availability = [...prev.availability];
                availability[i] = { ...availability[i], startTime: e.target.value };
                return { ...prev, availability };
              })} className={inputCls} />
              <span className="text-[11px] text-[#72796e]">to</span>
              <input type="time" value={slot.endTime} onChange={(e) => setForm((prev) => {
                const availability = [...prev.availability];
                availability[i] = { ...availability[i], endTime: e.target.value };
                return { ...prev, availability };
              })} className={inputCls} />
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, availability: prev.availability.filter((_, idx) => idx !== i) }))}
                className="material-symbols-outlined text-[#ba1a1a] hover:bg-[#ffdad6] rounded-lg p-2 text-sm transition-colors"
                aria-label="Remove slot"
              >
                delete
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setForm((prev) => ({
              ...prev,
              availability: [...prev.availability, { dayOfWeek: 1, startTime: '18:00', endTime: '21:00', timezone: null }],
            }))}
            className="self-start flex items-center gap-1.5 text-[11px] font-semibold text-[#2D5A27] hover:text-[#154212] transition-colors"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Add a time slot
          </button>
        </Section>

        {/* Privacy */}
        <Section title="Privacy" icon="lock">
          <ToggleRow label="Show my profile to the flock" value={form.privacySettings.showProfile} onChange={(v) => setPrivacy('showProfile', v)} />
          <ToggleRow label="Show my online status" value={form.privacySettings.showOnlineStatus} onChange={(v) => setPrivacy('showOnlineStatus', v)} />
          <ToggleRow label="Show my last active time" value={form.privacySettings.showLastActive} onChange={(v) => setPrivacy('showLastActive', v)} />
          <ToggleRow label="Show my email address" value={form.privacySettings.showEmail} onChange={(v) => setPrivacy('showEmail', v)} />
          <ToggleRow label="Show my age" value={form.privacySettings.showAge} onChange={(v) => setPrivacy('showAge', v)} />
          <ToggleRow label="Show my location" value={form.privacySettings.showLocation} onChange={(v) => setPrivacy('showLocation', v)} />
          <ToggleRow label="Allow direct messages" value={form.privacySettings.allowDMs} onChange={(v) => setPrivacy('allowDMs', v)} />
          <ToggleRow label="Allow video calls" value={form.privacySettings.allowVideoCalls} onChange={(v) => setPrivacy('allowVideoCalls', v)} />
        </Section>

        {message && (
          <div className={`rounded-xl px-4 py-3 text-[11px] text-center ${
            message.type === 'ok' ? 'bg-[#e8f5e3] text-[#2D5A27]' : 'bg-[#ffdad6] text-[#ba1a1a]'
          }`}>
            {message.text}
          </div>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="bg-[#2D5A27] hover:bg-[#154212] active:scale-[0.98] disabled:opacity-50 transition-all text-white font-semibold text-xs py-3 px-6 rounded-full flex items-center justify-center gap-2 shadow-md shadow-[#2d5a27]/10"
        >
          {saving ? (
            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <span className="material-symbols-outlined text-lg">save</span>
          )}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </LayoutShell>
  );
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="flex items-center justify-between w-full text-left"
    >
      <span className="text-xs text-[#42493e]">{label}</span>
      <span className={`relative w-10 h-6 rounded-full transition-colors ${value ? 'bg-[#2D5A27]' : 'bg-[#dbdad6]'}`}>
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${value ? 'left-[18px]' : 'left-0.5'}`} />
      </span>
    </button>
  );
}

function LanguageRows({
  title,
  rows,
  languages,
  langById,
  onChange,
  setRow,
}: {
  title: string;
  rows: UserLanguageEntry[];
  languages: LanguageOption[];
  langById: Map<string, LanguageOption>;
  onChange: (rows: UserLanguageEntry[]) => void;
  setRow: (i: number, patch: Partial<UserLanguageEntry>) => void;
}) {
  const usedIds = rows.map((r) => r.languageId);
  return (
    <div>
      <label className={labelCls}>{title}</label>
      {rows.map((row, i) => (
        <div key={i} className="flex items-center gap-2.5 mb-2">
          <select
            value={row.languageId}
            onChange={(e) => setRow(i, { languageId: e.target.value })}
            className={inputCls}
          >
            <option value="">Select a language...</option>
            {languages.filter((l) => !usedIds.includes(l.id) || l.id === row.languageId).map((l) => (
              <option key={l.id} value={l.id}>{l.flagEmoji ? `${l.flagEmoji} ` : ''}{l.name}</option>
            ))}
          </select>
          <select
            value={row.proficiency ?? ''}
            onChange={(e) => setRow(i, { proficiency: e.target.value || null })}
            className={`${inputCls} sm:w-44`}
          >
            <option value="">Proficiency</option>
            {PROFICIENCY_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <button
            type="button"
            onClick={() => onChange(rows.filter((_, idx) => idx !== i))}
            className="material-symbols-outlined text-[#ba1a1a] hover:bg-[#ffdad6] rounded-lg p-2 text-sm transition-colors"
            aria-label={`Remove ${title.toLowerCase().slice(0, -1)}`}
          >
            delete
          </button>
          {langById.get(row.languageId) && (
            <span className="text-[10px] text-[#a0a0a0] hidden sm:inline">{langById.get(row.languageId)?.name}</span>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...rows, { languageId: '', proficiency: null }])}
        className="flex items-center gap-1.5 text-[11px] font-semibold text-[#2D5A27] hover:text-[#154212] transition-colors"
      >
        <span className="material-symbols-outlined text-sm">add</span>
        Add {title.toLowerCase().slice(0, -1)}
      </button>
    </div>
  );
}
