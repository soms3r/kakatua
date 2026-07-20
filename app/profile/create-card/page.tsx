'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { createUserCultureCardAction, WizardFormData } from '../../actions/createCard';

// ─── Step Definitions ─────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, title: 'Language & Roots', icon: 'translate', color: '#2d5a27', bg: '#bcf0ae' },
  { id: 2, title: 'Traditions & Rituals', icon: 'celebration', color: '#7b5800', bg: '#ffdea5' },
  { id: 3, title: 'Culinary Stories', icon: 'restaurant', color: '#6d1d06', bg: '#ffdbd1' },
  { id: 4, title: 'History & Etiquette', icon: 'auto_stories', color: '#154212', bg: '#bcf0ae' },
] as const;

// ─── Default empty form state ─────────────────────────────────────────────────

function emptyForm(): WizardFormData {
  return {
    primaryLanguage: '',
    keyPhrases: [''],
    traditionsSummary: '',
    rituals: [{ festivalName: '', description: '' }],
    foodSummary: '',
    dishes: [{ dishName: '', historicalOrigin: '', culturalSignificance: '' }],
    historySummary: '',
    funFact: '',
    socialEtiquette: [''],
  };
}

// ─── Shared Input Styles ──────────────────────────────────────────────────────

const inputCls = 'w-full bg-[#f5f3ef] border border-[#dbdad6] rounded-2xl px-4 py-3 text-sm text-[#1b1c1a] placeholder:text-[#b0b0b0] focus:outline-none focus:ring-2 focus:ring-[#a1d494] focus:border-transparent resize-none transition-all';
const labelCls = 'text-[11px] font-medium text-[#72796e] mb-1 block';
const hintCls = 'text-[10px] text-[#a0a0a0] mb-2 italic leading-relaxed';

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CreateCardPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<WizardFormData>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // ── Helpers ──────────────────────────────────────────────────────────────

  function update<K extends keyof WizardFormData>(key: K, val: WizardFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  function addRitual() {
    update('rituals', [...form.rituals, { festivalName: '', description: '' }]);
  }
  function removeRitual(i: number) {
    update('rituals', form.rituals.filter((_, idx) => idx !== i));
  }
  function updateRitual(i: number, field: 'festivalName' | 'description', val: string) {
    const next = [...form.rituals];
    next[i] = { ...next[i], [field]: val };
    update('rituals', next);
  }

  function addDish() {
    update('dishes', [...form.dishes, { dishName: '', historicalOrigin: '', culturalSignificance: '' }]);
  }
  function removeDish(i: number) {
    update('dishes', form.dishes.filter((_, idx) => idx !== i));
  }
  function updateDish(i: number, field: keyof typeof form.dishes[number], val: string) {
    const next = [...form.dishes];
    next[i] = { ...next[i], [field]: val };
    update('dishes', next);
  }

  function addPhrase() { update('keyPhrases', [...form.keyPhrases, '']); }
  function removePhrase(i: number) { update('keyPhrases', form.keyPhrases.filter((_, idx) => idx !== i)); }
  function updatePhrase(i: number, val: string) {
    const next = [...form.keyPhrases]; next[i] = val; update('keyPhrases', next);
  }

  function addEtiquette() { update('socialEtiquette', [...form.socialEtiquette, '']); }
  function removeEtiquette(i: number) { update('socialEtiquette', form.socialEtiquette.filter((_, idx) => idx !== i)); }
  function updateEtiquette(i: number, val: string) {
    const next = [...form.socialEtiquette]; next[i] = val; update('socialEtiquette', next);
  }

  // ── Validation per step ──────────────────────────────────────────────────

  function canProceed(): boolean {
    switch (step) {
      case 1: return form.primaryLanguage.trim().length > 0;
      case 2: return form.traditionsSummary.trim().length > 0 && form.rituals.some((r) => r.festivalName.trim());
      case 3: return form.foodSummary.trim().length > 0 && form.dishes.some((d) => d.dishName.trim());
      case 4: return form.historySummary.trim().length > 0;
      default: return true;
    }
  }

  // ── Submit ───────────────────────────────────────────────────────────────

  async function handleSubmit() {
    if (!session?.user?.id) return;
    setSaving(true);
    setError('');
    const result = await createUserCultureCardAction(session.user.id, form);
    if (result.success) {
      router.push('/profile');
      router.refresh();
    } else {
      setError(result.error);
      setSaving(false);
    }
  }

  // ── Preview Data ─────────────────────────────────────────────────────────

  const previewCard = {
    traditions: form.traditionsSummary,
    food: form.foodSummary,
    history: form.historySummary,
    funFact: form.funFact,
  };

  // ════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════════════════

  if (showPreview) {
    return (
      <div className="min-h-screen bg-[#eae8e4] flex items-center justify-center font-sans antialiased text-[#1b1c1a] p-4 sm:p-8">
        <div className="w-full max-w-lg bg-[#fbf9f5] shadow-[0_20px_50px_rgba(21,66,18,0.15)] rounded-[32px] flex flex-col relative border border-[#dbdad6] overflow-hidden">

          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#154212] via-[#2D5A27] to-[#a1d494]" />

          {/* Preview Header */}
          <div className="px-6 pt-8 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#2D5A27] text-xl">visibility</span>
              <h2 className="text-sm font-bold text-[#154212]">Card Preview</h2>
            </div>
            <button
              onClick={() => setShowPreview(false)}
              className="text-[11px] font-semibold text-[#2D5A27] hover:text-[#154212] flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">edit</span>
              Edit
            </button>
          </div>

          {/* Preview Card */}
          <div className="px-5 pb-5">
            <div className="bg-white border border-[#efeeea] rounded-[20px] shadow-sm p-5 flex flex-col gap-4">

              {/* Name header */}
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#2d5a27] border-2 border-[#a1d494] flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-xl">flutter_dash</span>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#1b1c1a]">{session?.user?.name || 'Your Name'}</h3>
                  {form.primaryLanguage && (
                    <p className="text-[11px] text-[#72796e] flex items-center gap-1 mt-0.5">
                      <span className="material-symbols-outlined text-[12px]">translate</span>
                      {form.primaryLanguage}
                    </p>
                  )}
                </div>
              </div>

              {/* Key Phrases */}
              {form.keyPhrases.filter((p) => p.trim()).length > 0 && (
                <div className="bg-[#fbf9f5] border border-[#efeeea] rounded-xl px-3 py-2.5">
                  <h4 className="text-[10px] font-semibold uppercase tracking-wider text-[#72796e] mb-1.5">Key Phrases</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {form.keyPhrases.filter((p) => p.trim()).map((p, i) => (
                      <span key={i} className="text-[10px] bg-[#f5f3ef] text-[#42493e] px-2 py-0.5 rounded-full">{p}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Traditions */}
              {previewCard.traditions && (
                <div className="flex gap-2.5 items-start">
                  <span className="material-symbols-outlined text-base p-1.5 rounded-lg flex-shrink-0 mt-0.5 text-[#2d5a27] bg-[#bcf0ae]/40">diversity_3</span>
                  <div className="min-w-0">
                    <h4 className="text-[10px] font-semibold uppercase tracking-wider text-[#72796e]">Traditions</h4>
                    <p className="text-xs text-[#42493e] leading-relaxed mt-0.5">{previewCard.traditions}</p>
                  </div>
                </div>
              )}

              {/* Rituals */}
              {form.rituals.filter((r) => r.festivalName.trim()).length > 0 && (
                <div className="flex flex-col gap-2">
                  {form.rituals.filter((r) => r.festivalName.trim()).map((r, i) => (
                    <div key={i} className="bg-[#ffdea5]/20 border border-[#ffdea5]/30 rounded-xl px-3 py-2.5">
                      <h4 className="text-[11px] font-bold text-[#154212]">{r.festivalName}</h4>
                      {r.description && <p className="text-[10px] text-[#42493e] mt-0.5 leading-relaxed">{r.description}</p>}
                    </div>
                  ))}
                </div>
              )}

              {/* Food */}
              {previewCard.food && (
                <div className="flex gap-2.5 items-start">
                  <span className="material-symbols-outlined text-base p-1.5 rounded-lg flex-shrink-0 mt-0.5 text-[#7b5800] bg-[#ffdea5]/40">restaurant</span>
                  <div className="min-w-0">
                    <h4 className="text-[10px] font-semibold uppercase tracking-wider text-[#72796e]">Local Flavours</h4>
                    <p className="text-xs text-[#42493e] leading-relaxed mt-0.5">{previewCard.food}</p>
                  </div>
                </div>
              )}

              {/* Dishes */}
              {form.dishes.filter((d) => d.dishName.trim()).length > 0 && (
                <div className="flex flex-col gap-2">
                  {form.dishes.filter((d) => d.dishName.trim()).map((d, i) => (
                    <div key={i} className="bg-[#ffdbd1]/30 border border-[#ffdbd1]/30 rounded-xl px-3 py-2.5">
                      <h4 className="text-[11px] font-bold text-[#154212]">{d.dishName}</h4>
                      {d.culturalSignificance && <p className="text-[10px] text-[#42493e] mt-0.5 leading-relaxed italic">{d.culturalSignificance}</p>}
                    </div>
                  ))}
                </div>
              )}

              {/* Fun Fact */}
              {previewCard.funFact && (
                <div className="bg-[#fbf9f5] border border-[#efeeea] rounded-xl px-3 py-2.5 flex gap-2 items-start">
                  <span className="material-symbols-outlined text-sm text-[#2d5a27] mt-0.5">tips_and_updates</span>
                  <p className="text-[11px] text-[#42493e] leading-relaxed italic">&ldquo;{previewCard.funFact}&rdquo;</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 pb-8 pt-2 flex flex-col gap-3">
            {error && (
              <div className="bg-[#ffdad6] border border-[#ba1a1a]/20 rounded-2xl px-4 py-3 text-xs text-[#ba1a1a] text-center">{error}</div>
            )}
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="w-full bg-[#2D5A27] hover:bg-[#154212] active:scale-[0.98] disabled:opacity-40 transition-all text-white font-semibold text-sm py-3 px-6 rounded-full flex items-center justify-center gap-2 shadow-md shadow-[#2d5a27]/10"
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Weaving your card...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">check</span>
                  Weave My Card
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="w-full text-[11px] font-medium text-[#72796e] hover:text-[#42493e] transition-colors py-2"
            >
              I&apos;ll do this later
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // WIZARD
  // ════════════════════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen bg-[#eae8e4] flex items-center justify-center font-sans antialiased text-[#1b1c1a] p-4 sm:p-8">
      <div className="w-full max-w-lg bg-[#fbf9f5] shadow-[0_20px_50px_rgba(21,66,18,0.15)] rounded-[32px] flex flex-col relative border border-[#dbdad6] overflow-hidden">

        {/* Decorative top */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#154212] via-[#2D5A27] to-[#a1d494]" />

        {/* ─── Progress Bar ──────────────────────────────────────────────── */}
        <div className="px-6 pt-8 pb-2">
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((s, i) => (
              <React.Fragment key={s.id}>
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                      step >= s.id
                        ? 'text-white shadow-md'
                        : 'bg-[#f5f3ef] text-[#b0b0b0] border border-[#dbdad6]'
                    }`}
                    style={step >= s.id ? { backgroundColor: s.color } : {}}
                  >
                    <span className="material-symbols-outlined text-lg">{s.icon}</span>
                  </div>
                  <span className={`text-[9px] font-semibold tracking-wide transition-colors ${step >= s.id ? 'text-[#1b1c1a]' : 'text-[#b0b0b0]'}`}>
                    {s.title}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="flex-1 mx-1 mb-5">
                    <div className="h-0.5 bg-[#dbdad6] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#2D5A27] rounded-full transition-all duration-500"
                        style={{ width: step > s.id ? '100%' : '0%' }}
                      />
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* ─── Step Content ──────────────────────────────────────────────── */}
        <div className="px-6 pb-4 flex-1 overflow-y-auto min-h-[340px]">

          {/* ── STEP 1: Language & Roots ──────────────────────────────────── */}
          {step === 1 && (
            <div className="flex flex-col gap-5 animate-fade-in">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-[#2D5A27] text-lg">translate</span>
                  <h2 className="text-sm font-bold text-[#154212]">Language & Roots</h2>
                </div>
                <p className="text-[11px] text-[#72796e] leading-relaxed">
                  Every nest has a mother tongue. What language carries your stories?
                </p>
              </div>

              <div>
                <label className={labelCls}>Primary Language</label>
                <p className={hintCls}>The language you dream in, argue in, and say &lsquo;I love you&rsquo; in.</p>
                <input
                  type="text"
                  value={form.primaryLanguage}
                  onChange={(e) => update('primaryLanguage', e.target.value)}
                  placeholder="e.g. Bengali, Japanese, Spanish..."
                  className={`${inputCls} !rounded-xl`}
                />
              </div>

              <div>
                <label className={labelCls}>Key Phrases</label>
                <p className={hintCls}>Add 2-3 phrases that every visitor to your culture should know — a greeting, a term of endearment, a food word.</p>
                <div className="flex flex-col gap-2">
                  {form.keyPhrases.map((phrase, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text"
                        value={phrase}
                        onChange={(e) => updatePhrase(i, e.target.value)}
                        placeholder={i === 0 ? 'e.g. Shukriya (Thank you)' : i === 1 ? 'e.g. Ki khobor? (How are you?)' : 'Add a phrase...'}
                        className={`${inputCls} !rounded-xl flex-1`}
                      />
                      {form.keyPhrases.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePhrase(i)}
                          className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#ffdad6]/40 text-[#ba1a1a] hover:bg-[#ffdad6] transition-colors flex-shrink-0"
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addPhrase}
                  className="mt-2 text-[11px] font-semibold text-[#2D5A27] hover:text-[#154212] flex items-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  Add another phrase
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: Traditions & Rituals ──────────────────────────────── */}
          {step === 2 && (
            <div className="flex flex-col gap-5 animate-fade-in">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-[#7b5800] text-lg">celebration</span>
                  <h2 className="text-sm font-bold text-[#154212]">Traditions & Rituals</h2>
                </div>
                <p className="text-[11px] text-[#72796e] leading-relaxed">
                  What customs shape your world? Festivals, ceremonies, daily habits — the rituals that thread through your life.
                </p>
              </div>

              <div>
                <label className={labelCls}>Traditions Overview</label>
                <p className={hintCls}>Paint a picture of your cultural landscape in a few sentences.</p>
                <textarea
                  value={form.traditionsSummary}
                  onChange={(e) => update('traditionsSummary', e.target.value)}
                  placeholder="e.g. In our community, we gather every autumn for..."
                  rows={3}
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Festivals & Rituals</label>
                <p className={hintCls}>Add at least one festival, ceremony, or daily custom that matters to you.</p>
                <div className="flex flex-col gap-3">
                  {form.rituals.map((ritual, i) => (
                    <div key={i} className="bg-white border border-[#efeeea] rounded-2xl p-4 flex flex-col gap-2.5 relative">
                      {form.rituals.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRitual(i)}
                          className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full bg-[#ffdad6]/40 text-[#ba1a1a] hover:bg-[#ffdad6] transition-colors"
                        >
                          <span className="material-symbols-outlined text-xs">close</span>
                        </button>
                      )}
                      <div>
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-[#72796e] mb-1 block">Festival / Ritual Name</label>
                        <input
                          type="text"
                          value={ritual.festivalName}
                          onChange={(e) => updateRitual(i, 'festivalName', e.target.value)}
                          placeholder="e.g. Pohela Boishakh, Diwali, Obon..."
                          className={`${inputCls} !rounded-xl`}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-[#72796e] mb-1 block">What happens & why it matters</label>
                        <textarea
                          value={ritual.description}
                          onChange={(e) => updateRitual(i, 'description', e.target.value)}
                          placeholder="Describe what happens during this ritual and why it's meaningful..."
                          rows={2}
                          className={inputCls}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addRitual}
                  className="mt-2 text-[11px] font-semibold text-[#2D5A27] hover:text-[#154212] flex items-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  Add another ritual
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Culinary Narrative ────────────────────────────────── */}
          {step === 3 && (
            <div className="flex flex-col gap-5 animate-fade-in">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-[#6d1d06] text-lg">restaurant</span>
                  <h2 className="text-sm font-bold text-[#154212]">Culinary Stories</h2>
                </div>
                <p className="text-[11px] text-[#72796e] leading-relaxed">
                  What flavour defines your home? Every dish carries a history, a memory, a love letter from someone&rsquo;s kitchen.
                </p>
              </div>

              <div>
                <label className={labelCls}>Cuisine Overview</label>
                <p className={hintCls}>Describe the flavours, ingredients, and eating traditions of your culture.</p>
                <textarea
                  value={form.foodSummary}
                  onChange={(e) => update('foodSummary', e.target.value)}
                  placeholder="e.g. Our cuisine is defined by bold spices, slow-cooked stews, and the ritual of communal eating..."
                  rows={3}
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Signature Dishes</label>
                <p className={hintCls}>Add at least one dish — its name, where it came from, and why it matters to your people.</p>
                <div className="flex flex-col gap-3">
                  {form.dishes.map((dish, i) => (
                    <div key={i} className="bg-white border border-[#efeeea] rounded-2xl p-4 flex flex-col gap-2.5 relative">
                      {form.dishes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDish(i)}
                          className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full bg-[#ffdad6]/40 text-[#ba1a1a] hover:bg-[#ffdad6] transition-colors"
                        >
                          <span className="material-symbols-outlined text-xs">close</span>
                        </button>
                      )}
                      <div>
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-[#72796e] mb-1 block">Dish Name</label>
                        <input
                          type="text"
                          value={dish.dishName}
                          onChange={(e) => updateDish(i, 'dishName', e.target.value)}
                          placeholder="e.g. Hilsa Bhapa, Ramen, Biryani..."
                          className={`${inputCls} !rounded-xl`}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-[#72796e] mb-1 block">Historical Origin</label>
                        <textarea
                          value={dish.historicalOrigin}
                          onChange={(e) => updateDish(i, 'historicalOrigin', e.target.value)}
                          placeholder="Where did this dish come from? What era, what people, what circumstance..."
                          rows={2}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-[#72796e] mb-1 block">Cultural Significance</label>
                        <textarea
                          value={dish.culturalSignificance}
                          onChange={(e) => updateDish(i, 'culturalSignificance', e.target.value)}
                          placeholder="Why does this dish matter? What memories, emotions, or identity does it carry..."
                          rows={2}
                          className={inputCls}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addDish}
                  className="mt-2 text-[11px] font-semibold text-[#2D5A27] hover:text-[#154212] flex items-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  Add another dish
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 4: History & Etiquette ───────────────────────────────── */}
          {step === 4 && (
            <div className="flex flex-col gap-5 animate-fade-in">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-[#154212] text-lg">auto_stories</span>
                  <h2 className="text-sm font-bold text-[#154212]">History & Etiquette</h2>
                </div>
                <p className="text-[11px] text-[#72796e] leading-relaxed">
                  Every culture has a story — a poem written across centuries. And every visitor needs a guide to the unspoken rules.
                </p>
              </div>

              <div>
                <label className={labelCls}>Historical Context</label>
                <p className={hintCls}>Write a poetic summary of your culture&rsquo;s history — the chapters that define who you are today.</p>
                <textarea
                  value={form.historySummary}
                  onChange={(e) => update('historySummary', e.target.value)}
                  placeholder="e.g. Our story begins at the crossroads of ancient trade routes, where..."
                  rows={4}
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Fun Fact</label>
                <p className={hintCls}>One memorable, surprising fact that visitors always find fascinating.</p>
                <input
                  type="text"
                  value={form.funFact}
                  onChange={(e) => update('funFact', e.target.value)}
                  placeholder="e.g. We have over 1,500 varieties of bread..."
                  className={`${inputCls} !rounded-xl`}
                />
              </div>

              <div>
                <label className={labelCls}>Social Etiquette — Flock Guidelines</label>
                <p className={hintCls}>Add the dos and don&rsquo;ts every visitor should know before entering your nest.</p>
                <div className="flex flex-col gap-2">
                  {form.socialEtiquette.map((rule, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#bcf0ae]/40 flex items-center justify-center flex-shrink-0 mt-1.5">
                        <span className="text-[9px] font-bold text-[#2D5A27]">{i + 1}</span>
                      </span>
                      <input
                        type="text"
                        value={rule}
                        onChange={(e) => updateEtiquette(i, e.target.value)}
                        placeholder={i === 0 ? 'e.g. Always remove shoes before entering a home' : 'Add a guideline...'}
                        className={`${inputCls} !rounded-xl flex-1`}
                      />
                      {form.socialEtiquette.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeEtiquette(i)}
                          className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#ffdad6]/40 text-[#ba1a1a] hover:bg-[#ffdad6] transition-colors flex-shrink-0 mt-0.5"
                        >
                          <span className="material-symbols-outlined text-xs">close</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addEtiquette}
                  className="mt-2 text-[11px] font-semibold text-[#2D5A27] hover:text-[#154212] flex items-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  Add another guideline
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ─── Navigation ──────────────────────────────────────────────────── */}
        <div className="px-6 pb-8 pt-2 flex flex-col gap-3">
          <div className="flex gap-3">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex-1 bg-[#f5f3ef] hover:bg-[#efeeea] active:scale-[0.98] transition-all text-[#42493e] font-semibold text-xs py-3 rounded-full flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Back
              </button>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="flex-1 bg-[#2D5A27] hover:bg-[#154212] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all text-white font-semibold text-xs py-3 rounded-full flex items-center justify-center gap-1"
              >
                Next
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                disabled={!canProceed()}
                className="flex-1 bg-[#2D5A27] hover:bg-[#154212] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all text-white font-semibold text-xs py-3 rounded-full flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">visibility</span>
                Preview My Card
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => router.back()}
            className="w-full text-[11px] font-medium text-[#72796e] hover:text-[#42493e] transition-colors py-2"
          >
            I&rsquo;ll do this later
          </button>
        </div>
      </div>
    </div>
  );
}
