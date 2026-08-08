'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  getModerationAccessAction,
  getModerationQueueAction,
  answerModerationTicketAction,
} from '../../actions/guardians';
import type { GuardianTicketData } from '../../actions/guardians';

const TYPE_LABELS: Record<string, string> = {
  GUIDANCE: 'Guidance',
  PRACTICE_SESSION: 'Practice Session',
  SAFETY_FLAG: 'Safety Flag',
};

const inputCls =
  'w-full bg-[#f7ecd8] border border-[#dcc9a0] rounded-xl px-3 py-2 text-xs text-stone-800 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-[#a08050]/60 focus:border-transparent transition-all';

function SourceBadge({ source }: { source: string }) {
  if (source === 'BOT') {
    return (
      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#e8f2e3] text-[#2D5A27]">
        Kakatua Bot
      </span>
    );
  }
  return (
    <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#eef0f4] text-[#4a5568]">
      Moderator
    </span>
  );
}

function ConfidenceBar({ value }: { value: number | null }) {
  const pct = value == null ? 0 : Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-14 h-1.5 rounded-full bg-[#e5dfd2] overflow-hidden">
        <div
          className="h-full rounded-full bg-[#8fae72]"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[9px] text-stone-500">confidence {pct}%</span>
    </div>
  );
}

function PendingCard({
  ticket,
  onDispatch,
  busy,
}: {
  ticket: GuardianTicketData;
  onDispatch: (id: string, answer: string) => Promise<void>;
  busy: boolean;
}) {
  const [answer, setAnswer] = useState('');

  return (
    <div className="rounded-2xl border border-[#e3ddd0] bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p className="text-xs font-bold text-stone-900 truncate">
          {ticket.user?.name} → {ticket.guardian?.name ?? 'Kakatua Guide'}
        </p>
        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#fdf0d8] text-[#a26a1a]">
          {TYPE_LABELS[ticket.type] ?? ticket.type}
        </span>
      </div>
      <p className="text-[11px] text-stone-800 font-semibold mt-2">{ticket.subject}</p>
      <p className="text-[11px] text-stone-600 leading-relaxed mt-1">{ticket.message}</p>
      <div className="flex items-center justify-between mt-2">
        <ConfidenceBar value={ticket.confidence} />
        <span className="text-[9px] text-stone-400">
          {new Date(ticket.createdAt).toLocaleString()}
        </span>
      </div>
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        rows={3}
        placeholder="Type the custom answer to dispatch back to the member…"
        className={`${inputCls} mt-3`}
      />
      <div className="flex justify-end mt-2">
        <button
          onClick={() => onDispatch(ticket.id, answer)}
          disabled={busy || !answer.trim()}
          className="text-[11px] font-semibold text-white bg-[#2D5A27] hover:bg-[#154212] disabled:opacity-50 active:scale-[0.98] transition-all rounded-full px-4 py-2 flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-sm">send</span>
          Dispatch answer
        </button>
      </div>
    </div>
  );
}

export default function AdminGuardiansPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [pending, setPending] = useState<GuardianTicketData[]>([]);
  const [recent, setRecent] = useState<GuardianTicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<{ msg: string; err?: boolean } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    const uid = userId;
    if (!uid) return;
    const currentUid: string = uid;
    let cancelled = false;

    async function load() {
      try {
        const access = await getModerationAccessAction(currentUid);
        if (cancelled) return;
        if (!access.success || !access.data?.authorized) {
          setAuthorized(false);
          setLoading(false);
          return;
        }
        setAuthorized(true);
        const queue = await getModerationQueueAction(currentUid);
        if (cancelled) return;
        if (queue.success && queue.data) {
          setPending(queue.data.pending);
          setRecent(queue.data.recent);
        } else if (!queue.success) {
          setNotice({ msg: queue.error, err: true });
        }
      } catch (err: any) {
        if (cancelled) return;
        setNotice({ msg: err?.message || 'Failed to load the moderation queue.', err: true });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [userId]);

  async function reload() {
    const uid = userId;
    if (!uid) return;
    const queue = await getModerationQueueAction(uid);
    if (queue.success && queue.data) {
      setPending(queue.data.pending);
      setRecent(queue.data.recent);
    }
  }

  async function handleDispatch(id: string, answer: string) {
    const uid = userId;
    if (!uid) return;
    setBusyId(id);
    const res = await answerModerationTicketAction(uid, id, answer);
    setBusyId(null);
    if (res.success) {
      setNotice({ msg: res.message });
      await reload();
    } else {
      setNotice({ msg: res.error, err: true });
    }
    setTimeout(() => setNotice(null), 4000);
  }

  return (
    <div className="min-h-screen bg-[#eae8e4] font-sans antialiased">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6">
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#2D5A27] text-2xl">manage_search</span>
            <div>
              <h1 className="text-base font-bold text-[#154212] tracking-tight">Moderation Console</h1>
              <p className="text-[10px] text-stone-500">Guardian fallback queue · backend review</p>
            </div>
          </div>
          <Link
            href="/"
            className="text-[11px] font-semibold text-stone-600 hover:text-stone-900 transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">home</span>
            Back to the nest
          </Link>
        </header>

        {notice && (
          <div className={`mb-4 rounded-xl px-3 py-2 text-[11px] font-medium ${notice.err ? 'bg-red-50 text-red-700' : 'bg-[#e8f2e3] text-[#2D5A27]'}`}>
            {notice.msg}
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-9 h-9 border-2 border-[#c9ab72] border-t-[#8fae72] rounded-full animate-spin mb-4" />
            <p className="text-[11px] text-stone-500">Opening the queue…</p>
          </div>
        )}

        {!loading && authorized === false && (
          <div className="rounded-2xl border border-[#e3ddd0] bg-white p-8 text-center">
            <span className="material-symbols-outlined text-4xl text-stone-400 mb-2">lock</span>
            <p className="text-sm font-bold text-stone-900">Not authorized</p>
            <p className="text-[11px] text-stone-600 mt-1">
              This console is for developers and moderators. Ask your admin to add your email to{' '}
              <code className="bg-[#f7ecd8] px-1 rounded">ADMIN_EMAILS</code> or set{' '}
              <code className="bg-[#f7ecd8] px-1 rounded">isModerator=true</code> on your account.
            </p>
          </div>
        )}

        {!loading && authorized && (
          <div className="flex flex-col gap-6">
            <section>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xs font-bold text-stone-900 tracking-tight">Needs a human</h2>
                <span className="text-[10px] font-semibold text-stone-500">
                  {pending.length} waiting
                </span>
              </div>
              {pending.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#d8d2c4] bg-white/60 p-6 text-center">
                  <span className="material-symbols-outlined text-2xl text-[#8fae72]">task_alt</span>
                  <p className="text-[11px] text-stone-500 mt-1">Queue clear — the bot handled everything.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {pending.map((t) => (
                    <PendingCard
                      key={t.id}
                      ticket={t}
                      busy={busyId === t.id}
                      onDispatch={handleDispatch}
                    />
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="text-xs font-bold text-stone-900 tracking-tight mb-2">Recently answered</h2>
              {recent.length === 0 ? (
                <p className="text-[11px] text-stone-400 italic">Nothing answered yet.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {recent.map((t) => (
                    <div key={t.id} className="rounded-xl border border-[#e3ddd0] bg-white p-3">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <p className="text-[11px] font-semibold text-stone-800 truncate">
                          {t.user?.name} → {t.guardian?.name ?? 'Kakatua Guide'}
                        </p>
                        <div className="flex items-center gap-1.5">
                          <SourceBadge source={t.answerSource ?? 'MODERATOR'} />
                          <span className="text-[9px] text-stone-400">{t.answeredBy?.name}</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-stone-800 font-semibold mt-1.5">{t.subject}</p>
                      {t.answerText && (
                        <p className="text-[11px] text-stone-600 leading-relaxed mt-1 bg-[#f7ecd8]/70 rounded-lg px-2.5 py-2">
                          {t.answerText}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
