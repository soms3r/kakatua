'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import LayoutShell from '../components/LayoutShell';
import {
  getGuardiansAction,
  getMyGuardianRequestsAction,
  createGuardianTicketAction,
  getGuardianDashboardAction,
  acceptGuardianTicketAction,
  closeGuardianTicketAction,
  resolveCommunityReportAction,
} from '../actions/guardians';
import type {
  GuardianProfile,
  GuardianTicketData,
  GuardianDashboardData,
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
  { value: 'SAFETY_FLAG', label: 'Safety Flag', hint: 'Something in the flock feels wrong' },
];

const STATUS_STYLES: Record<string, string> = {
  OPEN: 'bg-[#f5f3ef] text-[#42493e]',
  ACCEPTED: 'bg-[#e8f2e3] text-[#2D5A27]',
  CLOSED: 'bg-[#efeeea] text-[#72796e]',
};

const inputCls =
  'w-full bg-[#f5f3ef] border border-[#dbdad6] rounded-xl px-3 py-2.5 text-xs text-[#1b1c1a] placeholder:text-[#a0a0a0] focus:outline-none focus:ring-2 focus:ring-[#a1d494] focus:border-transparent transition-all';
const labelCls = 'text-[10px] font-semibold uppercase tracking-wider text-[#72796e] mb-1 block';

function Section({ title, icon, sub, children }: { title: string; icon: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#ffffff] border border-[#efeeea] rounded-[20px] p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <span className="material-symbols-outlined text-[#2D5A27] text-lg">{icon}</span>
        <h2 className="text-xs font-bold text-[#154212] tracking-tight">{title}</h2>
      </div>
      {sub && <p className="text-[11px] text-[#72796e] mb-3 leading-relaxed">{sub}</p>}
      <div className="flex flex-col gap-3.5">{children}</div>
    </div>
  );
}

function StatusChip({ status }: { status: string }) {
  return (
    <span className={`text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${STATUS_STYLES[status] || STATUS_STYLES.OPEN}`}>
      {status}
    </span>
  );
}

function GuardianCard({ g, onAsk }: { g: GuardianProfile; onAsk: (id: string) => void }) {
  const initials = g.name.split(' ').map((w) => w[0]).slice(0, 2).join('');
  return (
    <div className="flex flex-col items-center text-center bg-[#ffffff] border border-[#efeeea] rounded-[20px] p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="relative">
        <div className="w-12 h-12 rounded-full bg-[#2d5a27] border-2 border-[#a1d494] flex items-center justify-center text-white font-semibold text-sm overflow-hidden">
          {g.avatarUrl ? (
            <img src={g.avatarUrl} alt={g.name} className="w-full h-full object-cover" />
          ) : (
            initials
          )}
        </div>
        <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${g.isOnline ? 'bg-[#3bb54a] animate-pulse' : 'bg-[#c2c9bb]'}`} />
      </div>
      <p className="text-xs font-bold text-[#1b1c1a] mt-2 leading-tight">{g.name}</p>
      {g.ambassadorBadge && (
        <span className="text-[9px] font-semibold text-[#2D5A27] bg-[#e8f2e3] rounded-full px-2 py-0.5 mt-1">
          {g.ambassadorBadge}
        </span>
      )}
      {g.specialtyLanguages.length > 0 && (
        <div className="flex flex-wrap justify-center gap-1 mt-2">
          {g.specialtyLanguages.map((lang) => (
            <span key={lang} className="text-[9px] text-[#72796e] bg-[#f5f3ef] rounded-full px-2 py-0.5">
              {lang}
            </span>
          ))}
        </div>
      )}
      <button
        onClick={() => onAsk(g.id)}
        className="mt-3 flex items-center gap-1 text-[10px] font-semibold text-white bg-[#2D5A27] hover:bg-[#154212] active:scale-95 transition-all rounded-full px-4 py-1.5"
      >
        <span className="material-symbols-outlined text-[13px]">forum</span>
        {g.isOnline ? 'Ask Now' : 'Leave a Note'}
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
            <h3 className="text-sm font-bold text-[#154212]">Ask a Guardian</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#f5f3ef] hover:bg-[#efeeea] text-[#42493e]">
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
                    <span className="block text-[11px] font-semibold text-[#1b1c1a]">{opt.label}</span>
                    <span className="block text-[10px] text-[#72796e]">{opt.hint}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelCls}>Guardian</label>
            <select value={guardianId} onChange={(e) => setGuardianId(e.target.value)} className={inputCls}>
              {guardians.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} {g.isOnline ? '— online' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Subject</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="A short title, e.g. Rooftop etiquette in Dhaka"
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

          {error && <p className="text-[11px] text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-white bg-[#2D5A27] hover:bg-[#154212] active:scale-[0.98] transition-all rounded-xl px-4 py-2.5 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-base">send</span>
            {submitting ? 'Sending…' : 'Send to Guardian'}
          </button>
        </form>
      </div>
    </div>
  );
}

function RequestList({ tickets }: { tickets: GuardianTicketData[] }) {
  if (tickets.length === 0) {
    return (
      <p className="text-[11px] text-[#a0a0a0] italic">
        No requests yet. When you ask a guardian, your threads appear here.
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      {tickets.map((t) => (
        <div key={t.id} className="rounded-xl border border-[#efeeea] bg-[#fbf9f5] p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="material-symbols-outlined text-[#2D5A27] text-base shrink-0">{TYPE_ICONS[t.type] || 'forum'}</span>
              <p className="text-[11px] font-semibold text-[#1b1c1a] truncate">{t.subject}</p>
            </div>
            <StatusChip status={t.status} />
          </div>
          <p className="text-[11px] text-[#72796e] mt-1 leading-relaxed">{t.message}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[9px] text-[#a0a0a0]">
              {t.guardian ? `With ${t.guardian.name}` : 'Waiting for a guardian'} · {TYPE_LABELS[t.type]}
            </span>
            {t.resolution && (
              <span className="text-[9px] text-[#2D5A27] max-w-[55%] truncate" title={t.resolution}>
                Resolved: {t.resolution}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

interface GuardianConsoleProps {
  dashboard: GuardianDashboardData;
  onChanged: () => void;
  notify: (msg: string, err?: boolean) => void;
}

function GuardianConsole({ dashboard, onChanged, notify }: GuardianConsoleProps) {
  const [busy, setBusy] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState<Record<string, string>>({});
  const [reportNotes, setReportNotes] = useState<Record<string, string>>({});

  async function run(id: string, fn: () => Promise<{ success: boolean; message?: string; error?: string }>) {
    setBusy(id);
    const res = await fn();
    setBusy(null);
    if (res.success) {
      notify(res.message || 'Done.');
      onChanged();
    } else {
      notify(res.error || 'Something went wrong.', true);
    }
  }

  const open = dashboard.openTickets.filter((t) => !t.guardian || t.guardian.id === dashboard.profile.id);
  const mine = dashboard.assignedTickets;

  return (
    <>
      <Section title="Claim Queue" icon="inbox" sub="Requests awaiting a guardian. The oldest flocked first.">
        {open.length === 0 ? (
          <p className="text-[11px] text-[#a0a0a0] italic">All clear — no requests waiting.</p>
        ) : (
          open.map((t) => (
            <div key={t.id} className="rounded-xl border border-[#efeeea] bg-[#fbf9f5] p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-semibold text-[#1b1c1a] truncate">
                  {TYPE_LABELS[t.type]} — {t.subject}
                </p>
                <StatusChip status={t.status} />
              </div>
              <p className="text-[10px] text-[#72796e] mt-1 leading-relaxed">{t.message}</p>
              <p className="text-[9px] text-[#a0a0a0] mt-1">From {t.user?.name || 'A flock member'}</p>
              <button
                onClick={() => run(t.id, () => acceptGuardianTicketAction(dashboard.profile.id, t.id))}
                disabled={busy === t.id}
                className="mt-2 text-[10px] font-semibold text-white bg-[#2D5A27] hover:bg-[#154212] active:scale-95 transition-all rounded-full px-3 py-1 disabled:opacity-50"
              >
                {busy === t.id ? 'Accepting…' : 'Accept & Reply'}
              </button>
            </div>
          ))
        )}
      </Section>

      <Section title="In Your Care" icon="handshake" sub="Accepted requests you are resolving.">
        {mine.length === 0 ? (
          <p className="text-[11px] text-[#a0a0a0] italic">Nothing accepted yet.</p>
        ) : (
          mine.map((t) => (
            <div key={t.id} className="rounded-xl border border-[#efeeea] bg-[#fbf9f5] p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-semibold text-[#1b1c1a] truncate">
                  {TYPE_LABELS[t.type]} — {t.subject}
                </p>
                <StatusChip status={t.status} />
              </div>
              <p className="text-[10px] text-[#72796e] mt-1 leading-relaxed">{t.message}</p>
              <p className="text-[9px] text-[#a0a0a0] mt-1">From {t.user?.name || 'A flock member'}</p>
              <div className="mt-2 flex items-center gap-2">
                <input
                  value={resolutionNotes[t.id] || ''}
                  onChange={(e) => setResolutionNotes((s) => ({ ...s, [t.id]: e.target.value }))}
                  placeholder="Resolution note…"
                  className="flex-1 bg-[#f5f3ef] border border-[#dbdad6] rounded-lg px-2.5 py-1.5 text-[10px] focus:outline-none focus:ring-2 focus:ring-[#a1d494]"
                />
                <button
                  onClick={() => run(t.id, () => closeGuardianTicketAction(dashboard.profile.id, t.id, resolutionNotes[t.id] || ''))}
                  disabled={busy === t.id}
                  className="text-[10px] font-semibold text-white bg-[#2D5A27] hover:bg-[#154212] active:scale-95 transition-all rounded-full px-3 py-1.5 disabled:opacity-50"
                >
                  {busy === t.id ? 'Closing…' : 'Resolve'}
                </button>
              </div>
            </div>
          ))
        )}
      </Section>

      <Section title="Community Watch" icon="radar" sub="Pending reports from flock members. Review and note your action.">
        {dashboard.pendingReports.length === 0 ? (
          <p className="text-[11px] text-[#a0a0a0] italic">No pending reports. The nest is calm.</p>
        ) : (
          dashboard.pendingReports.map((r) => (
            <div key={r.id} className="rounded-xl border border-[#efeeea] bg-[#fbf9f5] p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-semibold text-[#1b1c1a] truncate">
                  {r.reporter.name} reported {r.reported.name}
                </p>
                <StatusChip status={r.status} />
              </div>
              <p className="text-[10px] text-[#72796e] mt-1 leading-relaxed">{r.reason}</p>
              <input
                value={reportNotes[r.id] || ''}
                onChange={(e) => setReportNotes((s) => ({ ...s, [r.id]: e.target.value }))}
                placeholder="Note the action taken (e.g. warned, escalated)…"
                className="mt-2 w-full bg-[#f5f3ef] border border-[#dbdad6] rounded-lg px-2.5 py-1.5 text-[10px] focus:outline-none focus:ring-2 focus:ring-[#a1d494]"
              />
              <div className="mt-2 flex items-center gap-2">
                <button
                  onClick={() => run(r.id, () => resolveCommunityReportAction(dashboard.profile.id, r.id, reportNotes[r.id] || 'Actioned', 'ACTIONED'))}
                  disabled={busy === r.id}
                  className="text-[10px] font-semibold text-white bg-[#2D5A27] hover:bg-[#154212] active:scale-95 transition-all rounded-full px-3 py-1 disabled:opacity-50"
                >
                  {busy === r.id ? '…' : 'Actioned'}
                </button>
                <button
                  onClick={() => run(r.id, () => resolveCommunityReportAction(dashboard.profile.id, r.id, reportNotes[r.id] || 'Dismissed', 'DISMISSED'))}
                  disabled={busy === r.id}
                  className="text-[10px] font-semibold text-[#72796e] bg-[#f5f3ef] hover:bg-[#efeeea] active:scale-95 transition-all rounded-full px-3 py-1 disabled:opacity-50"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ))
        )}
      </Section>
    </>
  );
}

export default function GuardiansPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [guardians, setGuardians] = useState<GuardianProfile[]>([]);
  const [tickets, setTickets] = useState<GuardianTicketData[]>([]);
  const [dashboard, setDashboard] = useState<GuardianDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState<{ msg: string; err?: boolean } | null>(null);

  const [askOpen, setAskOpen] = useState(false);
  const [askPreselect, setAskPreselect] = useState('');

  useEffect(() => {
    if (!userId) return;
    const uid: string = userId;
    let cancelled = false;

    async function load() {
      try {
        const [gRes, tRes, dRes] = await Promise.all([
          getGuardiansAction(),
          getMyGuardianRequestsAction(uid),
          getGuardianDashboardAction(uid),
        ]);
        if (cancelled) return;
        if (gRes.success) setGuardians(gRes.data);
        else setError(gRes.error);
        if (tRes.success) setTickets(tRes.data);
        if (dRes.success) setDashboard(dRes.data);
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
    setTimeout(() => setNotice(null), 4000);
  };

  const reload = () => {
    if (!userId) return;
    const uid: string = userId;
    Promise.all([
      getMyGuardianRequestsAction(uid),
      getGuardianDashboardAction(uid),
    ]).then(([tRes, dRes]) => {
      if (tRes.success) setTickets(tRes.data);
      if (dRes.success) setDashboard(dRes.data);
    });
  };

  async function handleAsk(payload: { type: TicketType; subject: string; message: string; guardianId?: string }) {
    if (!userId) return 'Sign in to ask a guardian.';
    const res = await createGuardianTicketAction(userId, payload);
    if (res.success) {
      notify(res.message);
      reload();
      return null;
    }
    return res.error;
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
          <p className="text-[11px] text-[#72796e] mt-1 leading-relaxed">
            Verified ambassadors who keep the nest safe, share local wisdom, and answer your
            questions — {onlineCount} online now.
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
            { icon: 'edit_note', label: 'Ask', sub: 'Raise a ticket to a guardian' },
            { icon: 'handshake', label: 'Receive', sub: 'A guardian accepts & replies' },
            { icon: 'verified', label: 'Resolved', sub: 'Note recorded in your thread' },
          ].map((s) => (
            <div key={s.label} className="bg-[#ffffff] border border-[#efeeea] rounded-2xl p-3 text-center">
              <span className="material-symbols-outlined text-[#2D5A27] text-lg">{s.icon}</span>
              <p className="text-[10px] font-bold text-[#1b1c1a] mt-1">{s.label}</p>
              <p className="text-[9px] text-[#72796e] mt-0.5 leading-snug">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Live roster */}
        <Section title="Live Roster" icon="radar" sub="Green dot means the guardian is at their perch right now.">
          {loading ? (
            <p className="text-[11px] text-[#a0a0a0]">Roosting the roster…</p>
          ) : guardians.length === 0 ? (
            <p className="text-[11px] text-[#a0a0a0] italic">No guardians are online right now.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
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
          <RequestList tickets={tickets} />
        </Section>

        {/* Guardian console */}
        {dashboard && !loading && (
          <GuardianConsole dashboard={dashboard} onChanged={reload} notify={notify} />
        )}

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
