'use client';

import React, { useState } from 'react';

interface GrammarCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GrammarResult {
  original: string;
  corrected: string;
  tips: string[];
}

function simulateGrammarCheck(text: string): GrammarResult {
  const tips: string[] = [];
  let corrected = text;

  const rules: [RegExp, string, string][] = [
    [/\bi\b/g, 'I', 'Capitalize the pronoun "I"'],
    [/\bi'm\b/gi, "I'm", 'Always capitalize "I\'m"'],
    [/\bi am\b/gi, 'I am', 'Always capitalize "I"'],
    [/\bi was\b/gi, 'I was', 'Always capitalize "I"'],
    [/\bi have\b/gi, 'I have', 'Always capitalize "I"'],
    [/\bi will\b/gi, 'I will', 'Always capitalize "I"'],
    [/\bi can\b/gi, 'I can', 'Always capitalize "I"'],
    [/\bi do\b/gi, 'I do', 'Always capitalize "I"'],
    [/\bcant\b/gi, "can't", "Use an apostrophe in contractions: can't"],
    [/\bwont\b/gi, "won't", "Use an apostrophe in contractions: won't"],
    [/\bdont\b/gi, "don't", "Use an apostrophe in contractions: don't"],
    [/\bdoesnt\b/gi, "doesn't", "Use an apostrophe in contractions: doesn't"],
    [/\bisnt\b/gi, "isn't", "Use an apostrophe in contractions: isn't"],
    [/\barent\b/gi, "aren't", "Use an apostrophe in contractions: aren't"],
    [/\btheyre\b/gi, "they're", "Use an apostrophe in contractions: they're"],
    [/\byoure\b/gi, "you're", "Use an apostrophe in contractions: you're"],
    [/\bits\b(?=\s)/gi, "it's", "Consider if you mean \"it's\" (it is) or \"its\" (possessive)"],
    [/([^.!?,;\s])\s*$/gm, '$1.', 'Add punctuation at the end of sentences'],
    [/\s{2,}/g, ' ', 'Remove extra spaces'],
    [/\bvery good\b/gi, 'excellent', 'Consider a stronger word than "very good"'],
    [/\bbad\b/gi, 'poor', 'Consider if "poor" or "subpar" fits better than "bad"'],
    [/\bgood\b/gi, 'fine', 'Consider if "fine", "great", or "excellent" is more precise'],
  ];

  for (const [pattern, replacement, tip] of rules) {
    if (pattern.test(corrected)) {
      corrected = corrected.replace(pattern, replacement);
      tips.push(tip);
    }
  }

  if (corrected === text && tips.length === 0) {
    tips.push('Your text looks well-polished! Keep writing with confidence.');
  }

  return { original: text, corrected, tips: tips.slice(0, 4) };
}

export default function GrammarCheckModal({ isOpen, onClose }: GrammarCheckModalProps) {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<GrammarResult | null>(null);
  const [checking, setChecking] = useState(false);

  function handleCheck() {
    if (!input.trim()) return;
    setChecking(true);
    // Simulate network delay for realism
    setTimeout(() => {
      setResult(simulateGrammarCheck(input));
      setChecking(false);
    }, 600);
  }

  function handleReset() {
    setInput('');
    setResult(null);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#1b1c1a]/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-[#fbf9f5] border border-[#dbdad6] rounded-[24px] shadow-[0_20px_60px_rgba(21,66,18,0.2)] flex flex-col max-h-[85vh] animate-fade-in">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#bcf0ae]/40 flex items-center justify-center">
              <span className="material-symbols-outlined text-lg text-[#2D5A27]">edit_note</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#154212]">Polishing My Wings</h3>
              <p className="text-[10px] text-[#72796e]">Grammar & style suggestions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#efeeea] transition-colors text-[#72796e]"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Powered by Guide attribution */}
        <div className="mx-6 mb-3 flex items-center gap-2 bg-[#f5f3ef] border border-[#efeeea] rounded-xl px-3 py-2">
          <span className="material-symbols-outlined text-sm text-[#2D5A27]">menu_book</span>
          <span className="text-[10px] text-[#42493e]">
            Powered by <span className="font-bold text-[#154212]">Kakatua Guide</span> — your grammar guardian
          </span>
        </div>

        {/* Body */}
        <div className="px-6 pb-6 flex flex-col gap-4 overflow-y-auto">
          {/* Input */}
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-[#72796e] mb-1.5 block">
              Paste your text
            </label>
            <textarea
              value={input}
              onChange={(e) => { setInput(e.target.value); setResult(null); }}
              placeholder="Write or paste something you'd like to polish..."
              rows={4}
              className="w-full bg-[#ffffff] border border-[#dbdad6] rounded-xl px-3.5 py-3 text-xs text-[#1b1c1a] placeholder:text-[#b0b0b0] focus:outline-none focus:ring-2 focus:ring-[#a1d494] resize-none transition-all leading-relaxed"
            />
          </div>

          {/* Check Button */}
          {!result && (
            <button
              onClick={handleCheck}
              disabled={checking || !input.trim()}
              className="w-full bg-[#2D5A27] hover:bg-[#154212] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all text-white font-semibold text-xs py-2.5 rounded-full flex items-center justify-center gap-1.5"
            >
              {checking ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Polishing...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">auto_fix_high</span>
                  Polish My Wings
                </>
              )}
            </button>
          )}

          {/* Results */}
          {result && (
            <div className="flex flex-col gap-3 animate-fade-in">
              {/* Corrected text */}
              <div className="bg-[#ffffff] border border-[#a1d494]/30 rounded-xl p-3.5">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="material-symbols-outlined text-sm text-[#2D5A27]">check_circle</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#2D5A27]">Polished</span>
                </div>
                <p className="text-xs text-[#42493e] leading-relaxed whitespace-pre-wrap">{result.corrected}</p>
              </div>

              {/* Tips */}
              {result.tips.length > 0 && (
                <div className="bg-[#ffdea5]/30 border border-[#fdbb24]/20 rounded-xl p-3.5">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="material-symbols-outlined text-sm text-[#7b5800]">tips_and_updates</span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#7b5800]">Tips</span>
                  </div>
                  <ul className="flex flex-col gap-1.5">
                    {result.tips.map((tip, i) => (
                      <li key={i} className="text-[11px] text-[#42493e] flex items-start gap-1.5">
                        <span className="text-[#7b5800] mt-0.5">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 bg-[#f5f3ef] hover:bg-[#efeeea] active:scale-[0.98] transition-all text-[#42493e] font-semibold text-xs py-2.5 rounded-full"
                >
                  Check Another
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 bg-[#2D5A27] hover:bg-[#154212] active:scale-[0.98] transition-all text-white font-semibold text-xs py-2.5 rounded-full"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
