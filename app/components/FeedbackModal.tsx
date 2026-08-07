// React Component: FeedbackModal (app/components/FeedbackModal.tsx)
'use client';

import React, { useState } from 'react';
import { submitFeedbackAction } from '../actions/submitFeedback';
import type { FeedbackCategory } from '../actions/types';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

const categories: { value: FeedbackCategory; label: string; icon: string }[] = [
  { value: 'Idea', label: 'A Bright Idea', icon: 'lightbulb' },
  { value: 'Bug', label: 'Something\'s Broken', icon: 'bug_report' },
  { value: 'FeatureRequest', label: 'Wish for a New Branch', icon: 'neurology' },
  { value: 'Other', label: 'Just Chirping', icon: 'flutter_dash' },
];

export default function FeedbackModal({ isOpen, onClose, userId }: FeedbackModalProps) {
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<FeedbackCategory>('Idea');
  const [contactInfo, setContactInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);

    const res = await submitFeedbackAction(
      { message, category, contactInfo: contactInfo || undefined },
      userId
    );

    setResult({ success: res.success, message: res.success ? res.message : res.error });
    setSubmitting(false);

    if (res.success) {
      setTimeout(() => {
        setMessage('');
        setCategory('Idea');
        setContactInfo('');
        setResult(null);
        onClose();
      }, 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#1b1c1a]/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-[#fbf9f5] rounded-t-[32px] sm:rounded-[32px] p-6 pb-8 shadow-[0_20px_50px_rgba(21,66,18,0.2)] animate-slide-up border border-[#efeeea] max-h-[90vh] overflow-y-auto">
        {result ? (
          /* Result state */
          <div className="flex flex-col items-center py-12 gap-4">
            <span className={`material-symbols-outlined text-5xl ${
              result.success ? 'text-[#2D5A27]' : 'text-[#C05A3E]'
            }`}>
              {result.success ? 'nest_eco_leaf' : 'sadness'}
            </span>
            <p className="text-sm text-[#42493e] text-center leading-relaxed max-w-[85%]">
              {result.message}
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#2D5A27] text-2xl bg-[#bcf0ae]/30 p-2 rounded-xl">
                  forum
                </span>
                <div>
                  <h2 className="font-bold text-lg text-[#1b1c1a] tracking-tight">Tell the Flock</h2>
                  <p className="text-[11px] text-[#72796e] -mt-0.5">
                    Your voice helps our nest grow stronger
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-[#f5f3ef] hover:bg-[#efeeea] active:scale-90 transition-all text-[#42493e]"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Category Picker */}
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => {
                  const isActive = category === cat.value;
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setCategory(cat.value)}
                      className={`flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-full border transition-all ${
                        isActive
                          ? 'bg-[#2D5A27] text-white border-[#2D5A27] shadow-sm'
                          : 'bg-[#f5f3ef] text-[#42493e] border-[#c2c9bb]/30 hover:bg-[#efeeea]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">{cat.icon}</span>
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* Message Area */}
              <div className="relative">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share your thoughts, ideas, or concerns with the flock..."
                  rows={4}
                  maxLength={2000}
                  className="w-full bg-[#f5f3ef] border border-[#dbdad6] rounded-2xl p-4 text-sm text-[#1b1c1a] placeholder:text-[#72796e] resize-none focus:outline-none focus:ring-2 focus:ring-[#a1d494] focus:border-transparent transition-all"
                />
                <span className="absolute bottom-3 right-3 text-[10px] text-[#72796e] font-mono">
                  {message.length}/2000
                </span>
              </div>

              {/* Optional Contact Info */}
              <div>
                <label className="text-[11px] font-medium text-[#72796e] flex items-center gap-1 mb-1.5">
                  <span className="material-symbols-outlined text-[13px]">alternate_email</span>
                  Leave a branch to reach you (optional)
                </label>
                <input
                  type="text"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  placeholder="Email, username, or any contact..."
                  className="w-full bg-[#f5f3ef] border border-[#dbdad6] rounded-2xl px-4 py-2.5 text-sm text-[#1b1c1a] placeholder:text-[#72796e] focus:outline-none focus:ring-2 focus:ring-[#a1d494] focus:border-transparent transition-all"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || !message.trim()}
                className="w-full bg-[#2D5A27] hover:bg-[#154212] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all text-white font-semibold text-sm py-3 px-6 rounded-full flex items-center justify-center gap-2 shadow-md shadow-[#2d5a27]/10 mt-2"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">send</span>
                    Send to the Flock
                  </>
                )}
              </button>
            </form>

            {/* Footer note */}
            <p className="text-[10px] text-[#72796e] text-center mt-4 leading-relaxed">
              Feature requests are shared with the nest builders.
              You will not receive a direct reply unless you leave contact info.
            </p>
          </>
        )}
      </div>

      {/* Slide-up animation keyframes */}
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
}
