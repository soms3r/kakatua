'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import LayoutShell from '../components/LayoutShell';
import {
  getGuardiansAction,
  getMyGuardianRequestsAction,
  createGuardianTicketAction,
  replyToGuardianTicketAction,
} from '../actions/guardians';
import type {
  GuardianProfile,
  GuardianTicketData,
  GuardianMessageData,
  TicketType,
} from '../actions/guardians';

const TYPE_LABELS: Record<string, string> = {
  GUIDANCE: 'Guidance',
  PRACTICE_SESSION: 'Practice Session',
  SAFETY_FLAG: 'Safety Flag',
};

const TYPE_ICONS: Record<string, string> = {
  GUIDANCE: 'explore',
  PRACTICE_SESSION: 'record_voice_over',
  SAFETY_FLAG: 'flag',
};

const TYPE_OPTIONS: { value: TicketType; label: string; hint: string }[] = [
  { value: 'GUIDANCE', label: 'Guidance', hint: 'Culture, etiquette, or settling-in advice' },
  { value: 'PRACTICE_SESSION', label: 'Practice Session', hint: 'Book a language practice chat' },
  { value: 'SAFETY_FLAG', label: 'Safety Flag', hint: 'Always reviewed by a human moderator' },
];

const STATUS_STYLES: Record<string, string> = {
  OPEN: 'bg-[#f5f3ef] text-stone-600',
  PENDING_MODERATION: 'bg-[#fdf0d8] text-[#a26a1a]',
  CLOSED: 'bg-[#e8f2e3] text-[#2D5A27]',
};

const inputCls =
  'w-full bg-[#f5f3ef] border border-[#dbdad6] rounded-xl px-3 py-2.5 text-xs text-stone-800 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-[#a1d494] focus:border-transparent transition-all';
const labelCls = 'text-[10px] font-semibold uppercase tracking-wider text-stone-600 mb-1 block';

function Section({ title, icon, sub, children }: { title: string; icon: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#ffffff] border border-[#efeeea] rounded-[20px] p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <span className="material-symbols-outlined text-[#2D5A27] text-lg">{icon}</span>
        <h2 className="text-xs font-bold text-stone-900 tracking-tight">{title}</h2>
      </div>
      {sub && <p className="text-[11px] text-stone-600 mb-3 leading-relaxed">{sub}</p>}
      <div className="flex flex-col gap-3.5">{children}</div>
    </div>
  );
}

function StatusChip({ status }: { status: string }) {
  const label =
    status === 'PENDING_MODERATION'
      ? 'In review'
      : status === 'CLOSED'
        ? 'Answered'
        : status;
  return (
    <span className={`text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${STATUS_STYLES[status] || STATUS_STYLES.OPEN}`}>
      {label}
    </span>
  );
}

function SourceBadge({ source }: { source: string | null }) {
  if (source === 'BOT') {
    return (
      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#e8f2e3] text-[#2D5A27]">
        Kakatua Bot
      </span>
    );
  }
  return (
    <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#eef0f4] text-[#4a5568]">
      Human Moderator
    </span>
  );
}

function GuardianCard({ g, onAsk }: { g: GuardianProfile; onAsk: (id: string) => void }) {
  const initials = g.name.split(' ').map((w) => w[0]).slice(0, 2).join('');
  const isBuddy = g.ambassadorRole === 'MATCHMAKER';
  return (
    <div className="flex flex-col items-center text-center bg-[#ffffff] border border-[#efeeea] rounded-[20px] p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="relative">
        <div className="w-14 h-14 rounded-full bg-[#2d5a27] border-2 border-[#a1d494] flex items-center justify-center text-white font-semibold text-base overflow-hidden">
          {g.avatarUrl ? (
            <img src={g.avatarUrl} alt={g.name} className="w-full h-full object-cover" />
          ) : (
            initials
          )}
        </div>
        <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${g.isOnline ? 'bg-[#3bb54a] animate-pulse' : 'bg-[#c2c9bb]'}`} />
      </div>
      <p className="text-sm font-bold text-stone-900 mt-2.5 leading-tight">{g.name}</p>
      {g.ambassadorBadge && (
        <span className={`text-[9px] font-semibold rounded-full px-2.5 py-0.5 mt-1.5 ${isBuddy ? 'bg-[#f4e2b8] text-[#7a5a1e]' : 'bg-[#e8f2e3] text-[#2D5A27]'}`}>
          {g.ambassadorBadge}
        </span>
      )}
      <p className="text-[10px] text-stone-600 leading-relaxed mt-2">
        {isBuddy
          ? 'Friendly, casual peer for conversation practice, cultural exchange, and casual questions.'
          : 'Platform expert for app navigation, missions, settings help, and technical support.'}
      </p>
      {g.specialtyLanguages.length > 0 && (
        <div className="flex flex-wrap justify-center gap-1 mt-3">
          {g.specialtyLanguages.map((lang) => (
            <span key={lang} className="text-[9px] text-stone-600 bg-[#f5f3ef] rounded-full px-2 py-0.5">
              {lang}
            </span>
          ))}
        </div>
      )}
      <button
        onClick={() => onAsk(g.id)}
        className="mt-4 flex items-center gap-1.5 text-[10px] font-semibold text-white bg-[#2D5A27] hover:bg-[#154212] active:scale-95 transition-all rounded-full px-5 py-2"
      >
        <span className="material-symbols-outlined text-[13px]">forum</span>
        Ask {g.name.split(' ')[0]}
      </button>
    </div>
  );
}

interface AskModalProps {
  isOpen: boolean;
  guardians: GuardianProfile[];
  preselectId: string;
  onClose: () => void;
  onSubmit: (payload: { type: TicketType; subject: string; message: string; guardianId?: string }) => Promise<string | null>;
}

function AskModal({ isOpen, guardians, preselectId, onClose, onSubmit }: AskModalProps) {
  const [type, setType] = useState<TicketType>('GUIDANCE');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [guardianId, setGuardianId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      const preferred = guardians.find((g) => g.isOnline)?.id || guardians[0]?.id || '';
      setGuardianId(preselectId || preferred);
      setType('GUIDANCE');
      setSubject('');
      setMessage('');
      setError('');
    }
  }, [isOpen, preselectId, guardians]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    const err = await onSubmit({ type, subject, message, guardianId: guardianId || undefined });
    setSubmitting(false);
    if (err) {
      setError(err);
      return;
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-[#fbf9f5] rounded-t-[24px] sm:rounded-[24px] p-5 pb-8 max-h-[85dvh] overflow-y-auto scrollbar-none">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#2D5A27] text-xl">support_agent</span>
            <h3 className="text-sm font-bold text-stone-900">Ask a Guardian</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#f5f3ef] hover:bg-[#efeeea] text-stone-700">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className={labelCls}>Request type</label>
            <div className="grid grid-cols-1 gap-1.5">
              {TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setType(opt.value)}
                  className={`flex items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition-all ${
                    type === opt.value
                      ? 'border-[#2D5A27] bg-[#e8f2e3]'
                      : 'border-[#dbdad6] bg-[#f5f3ef] hover:border-[#a1d494]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[#2D5A27] text-base">{TYPE_ICONS[opt.value]}</span>
                  <span>
                    <span className="block text-[11px] font-semibold text-stone-900">{opt.label}</span>
                    <span className="block text-[10px] text-stone-600">{opt.hint}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelCls}>Guardian</label>
            <div className="grid grid-cols-1 gap-1.5">
              {guardians.map((g) => {
                const isBuddy = g.ambassadorRole === 'MATCHMAKER';
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGuardianId(g.id)}
                    className={`flex items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition-all ${
                      guardianId === g.id
                        ? 'border-[#2D5A27] bg-[#e8f2e3]'
                        : 'border-[#dbdad6] bg-[#f5f3ef] hover:border-[#a1d494]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[#2D5A27] text-base">
                      {isBuddy ? 'handshake' : 'menu_book'}
                    </span>
                    <span>
                      <span className="block text-[11px] font-semibold text-stone-900">
                        {isBuddy ? 'Global Buddy' : 'Kakatua Guide'}
                      </span>
                      <span className="block text-[10px] text-stone-600">
                        {isBuddy
                          ? 'Friendly peer for conversation, culture & practice'
                          : 'Expert for navigation, missions, support & settings'}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className={labelCls}>Subject</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="A short title, e.g. How do missions earn EXP?"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="Tell the guardian what you need…"
              className={inputCls}
            />
          </div>

          <p className="text-[10px] text-stone-500 leading-relaxed">
            The Kakatua bot answers instantly from your profile. Tricky questions go to a
            human moderator who replies here.
          </p>

          {error && <p className="text-[11px] text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-white bg-[#2D5A27] hover:bg-[#154212] active:scale-[0.98] transition-all rounded-xl px-4 py-2.5 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-base">send</span>
            {submitting ? 'Asking…' : 'Ask a Guardian'}
          </button>
        </form>
      </div>
    </div>
  );
}

function ChatBubble({ msg, isOwn }: { msg: GuardianMessageData; isOwn: boolean }) {
  const time = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const senderLabel = msg.sender === 'BOT' ? 'Kakatua' : msg.sender === 'MODERATOR' ? 'Moderator' : null;
  return (
    <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
      {senderLabel && (
        <span className="text-[9px] font-semibold uppercase tracking-wider text-stone-500 mb-0.5 px-1">
          {senderLabel}
        </span>
      )}
      <div
        className={`max-w-[82%] rounded-2xl px-3 py-2 text-[11px] leading-relaxed whitespace-pre-line ${
          isOwn
            ? 'bg-[#2D5A27] text-white rounded-br-md'
            : msg.sender === 'BOT'
              ? 'bg-[#e8f2e3] text-stone-800 border border-[#c3e0b8] rounded-bl-md'
              : 'bg-[#f7ecd8] text-stone-800 border border-[#ead9b0] rounded-bl-md'
        }`}
      >
        {msg.content}
      </div>
      <span className="text-[8px] text-stone-400 mt-0.5 px-1">{time}</span>
    </div>
  );
}

function ThreadTicket({ t, userId, onReply }: { t: GuardianTicketData; userId: string; onReply: (ticketId: string, msg: string) => Promise<boolean> }) {
  const [expanded, setExpanded] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const threadRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when expanded or when messages change
  useEffect(() => {
    if (expanded && threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [expanded, t.messages.length]);

  const canReply = t.status !== 'CLOSED';
  const msgCount = t.messages.length;

  async function handleSend() {
    if (!replyText.trim() || sending) return;
    setSending(true);
    const ok = await onReply(t.id, replyText.trim());
    if (ok) setReplyText('');
    setSending(false);
  }

  return (
    <div className="rounded-xl border border-[#efeeea] bg-[#fbf9f5] overflow-hidden">
      {/* Header — always visible, clickable to expand */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between gap-2 px-3.5 py-3 text-left hover:bg-[#f5f3ef] transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="material-symbols-outlined text-[#2D5A27] text-base shrink-0">{TYPE_ICONS[t.type] || 'forum'}</span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-stone-900 truncate">{t.subject}</p>
            <p className="text-[9px] text-stone-400 mt-0.5">
              {t.guardian ? `With ${t.guardian.name}` : 'Waiting for a guardian'} · {msgCount} message{msgCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <StatusChip status={t.status} />
          <span className={`material-symbols-outlined text-stone-400 text-base transition-transform ${expanded ? 'rotate-180' : ''}`}>expand_more</span>
        </div>
      </button>

      {/* Expanded thread view */}
      {expanded && (
        <div className="border-t border-[#efeeea]">
          {/* Messages area */}
          <div ref={threadRef} className="max-h-72 overflow-y-auto px-3.5 py-3 flex flex-col gap-2.5 scrollbar-none">
            {t.messages.map((msg) => (
              <ChatBubble key={msg.id} msg={msg} isOwn={msg.sender === 'USER'} />
            ))}
          </div>

          {/* PENDING_MODERATION notice */}
          {t.status === 'PENDING_MODERATION' && (
            <div className="px-3.5 pb-2">
              <p className="text-[10px] text-[#a26a1a] bg-[#fdf0d8] rounded-lg px-2.5 py-1.5">
                A human moderator is reviewing this — your next reply will be saved for them to see.
              </p>
            </div>
          )}

          {/* Reply input */}
          {canReply ? (
            <div className="px-3.5 pb-3 pt-1">
              <div className="flex items-end gap-2">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  rows={1}
                  placeholder="Reply to Guardian…"
                  className="flex-1 bg-white border border-[#dbdad6] rounded-xl px-3 py-2 text-[11px] text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#a1d494] focus:border-transparent resize-none min-h-[34px] max-h-24 transition-all"
                />
                <button
                  onClick={handleSend}
                  disabled={!replyText.trim() || sending}
                  className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-[#2D5A27] text-white hover:bg-[#154212] active:scale-95 transition-all disabled:opacity-40"
                >
                  <span className="material-symbols-outlined text-[15px]">{sending ? 'hourglass_top' : 'send'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="px-3.5 pb-3">
              <p className="text-[10px] text-stone-400 italic">This conversation is closed.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RequestList({ tickets, userId, onReply }: { tickets: GuardianTicketData[]; userId: string; onReply: (ticketId: string, msg: string) => Promise<boolean> }) {
  if (tickets.length === 0) {
    return (
      <p className="text-[11px] text-stone-400 italic">
        No requests yet. When you ask a guardian, your threads appear here.
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-2.5">
      {tickets.map((t) => (
        <ThreadTicket key={t.id} t={t} userId={userId} onReply={onReply} />
      ))}
    </div>
  );
}

export default function GuardiansPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [guardians, setGuardians] = useState<GuardianProfile[]>([]);
  const [tickets, setTickets] = useState<GuardianTicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState<{ msg: string; err?: boolean } | null>(null);

  const [askOpen, setAskOpen] = useState(false);
  const [askPreselect, setAskPreselect] = useState('');

  useEffect(() => {
    const uid = userId;
    if (!uid) return;
    const currentUid: string = uid;
    let cancelled = false;

    async function load() {
      try {
        const [gRes, tRes] = await Promise.all([
          getGuardiansAction(),
          getMyGuardianRequestsAction(currentUid),
        ]);
        if (cancelled) return;
        if (gRes.success) setGuardians(gRes.data);
        else setError(gRes.error);
        if (tRes.success) setTickets(tRes.data);
      } catch (err: any) {
        if (cancelled) return;
        setError(err?.message || 'Failed to load Guardians. Please try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [userId]);

  const notify = (msg: string, err = false) => {
    setNotice({ msg, err });
    setTimeout(() => setNotice(null), 5000);
  };

  const reload = () => {
    const uid = userId;
    if (!uid) return;
    getMyGuardianRequestsAction(uid).then((res) => {
      if (res.success) setTickets(res.data);
    });
  };

  async function handleAsk(payload: { type: TicketType; subject: string; message: string; guardianId?: string }) {
    const uid = userId;
    if (!uid) return 'Sign in to ask a guardian.';
    const res = await createGuardianTicketAction(uid, payload);
    if (res.success) {
      notify(res.message);
      reload();
      return null;
    }
    return res.error;
  }

  async function handleReply(ticketId: string, message: string): Promise<boolean> {
    const uid = userId;
    if (!uid) { notify('Sign in to reply.', true); return false; }
    const res = await replyToGuardianTicketAction(uid, ticketId, message);
    if (res.success) {
      reload();
      return true;
    }
    notify(res.error, true);
    return false;
  }

  const onlineCount = guardians.filter((g) => g.isOnline).length;

  return (
    <LayoutShell activeTab="guardians" userId={userId}>
      <div className="flex flex-col gap-5 pb-24 pt-2">

        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#2D5A27] text-xl">support_agent</span>
            <h1 className="text-base font-bold text-[#154212] tracking-tight">Guardians of the Flock</h1>
          </div>
          <p className="text-[11px] text-stone-600 mt-1 leading-relaxed">
            Two global guardians keep the nest in order — {onlineCount} online now. Ask anything,
            and the Kakatua bot answers from your own profile.
          </p>
        </div>

        {notice && (
          <div className={`rounded-xl px-3 py-2 text-[11px] font-medium ${notice.err ? 'bg-red-50 text-red-700' : 'bg-[#e8f2e3] text-[#2D5A27]'}`}>
            {notice.msg}
          </div>
        )}

        {error && (
          <div className="rounded-xl px-3 py-2 text-[11px] font-medium bg-red-50 text-red-700">{error}</div>
        )}

        {/* How it works */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: 'edit_note', label: 'Ask', sub: 'Raise a question to a guardian' },
            { icon: 'auto_awesome', label: 'Bot answers', sub: 'Instant, from your profile' },
            { icon: 'support_agent', label: 'Human fallback', sub: 'Hard cases go to moderators' },
          ].map((s) => (
            <div key={s.label} className="bg-[#ffffff] border border-[#efeeea] rounded-2xl p-3 text-center">
              <span className="material-symbols-outlined text-[#2D5A27] text-lg">{s.icon}</span>
              <p className="text-[10px] font-bold text-stone-900 mt-1">{s.label}</p>
              <p className="text-[9px] text-stone-600 mt-0.5 leading-snug">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Live roster: the two global guardians */}
        <Section title="The Two Guardians" icon="radar" sub="Global Buddy for casual conversation, Kakatua Guide for platform help.">
          {loading ? (
            <p className="text-[11px] text-stone-400">Roosting the roster…</p>
          ) : guardians.length === 0 ? (
            <p className="text-[11px] text-stone-400 italic">No guardians are online right now.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {guardians.map((g) => (
                <GuardianCard
                  key={g.id}
                  g={g}
                  onAsk={(id) => {
                    setAskPreselect(id);
                    setAskOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </Section>

        {/* Ask a guardian */}
        <button
          onClick={() => { setAskPreselect(''); setAskOpen(true); }}
          className="flex items-center justify-center gap-2 rounded-[20px] px-4 py-3.5 text-xs font-bold text-white bg-gradient-to-r from-[#2D5A27] to-[#154212] hover:opacity-95 active:scale-[0.98] transition-all shadow-md"
        >
          <span className="material-symbols-outlined text-lg">forum</span>
          Ask a Guardian
        </button>

        {/* My requests */}
        <Section title="My Requests" icon="forum">
          <RequestList tickets={tickets} userId={userId || ''} onReply={handleReply} />
        </Section>

        <AskModal
          isOpen={askOpen}
          guardians={guardians}
          preselectId={askPreselect}
          onClose={() => setAskOpen(false)}
          onSubmit={handleAsk}
        />
      </div>
    </LayoutShell>
  );
}
