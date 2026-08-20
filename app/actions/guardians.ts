// Guardian Support System — server actions (app/actions/guardians.ts)
//
// Exactly two global guardians serve the flock: Global Buddy (MATCHMAKER, casual
// conversation & culture) and Kakatua Guide (GUIDE, platform expertise & support).
//
// Flow: a member raises a ticket → the Kakatua bot answers from their live app
// context (languages, missions, settings, profile). Confident answers close the
// ticket instantly (source BOT); ambiguous, complex, technical, or safety queries
// land in the PENDING_MODERATION queue for an authorized developer/moderator.

'use server';

import { prisma } from './db';
import { ActionResponse } from './types';
import { buildUserContext, answerFromContext } from './guardianBot';
import { GLOBAL_GUARDIAN_ROLES } from './roles';
import { trackUserAction } from './missions';

export type TicketType = 'GUIDANCE' | 'PRACTICE_SESSION' | 'SAFETY_FLAG';

export interface GuardianProfile {
  id: string;
  name: string;
  avatarUrl: string | null;
  ambassadorRole: string | null;
  ambassadorBadge: string | null;
  specialtyLanguages: string[];
  isOnline: boolean;
  countrySlug: string | null;
}

export interface GuardianMini {
  id: string;
  name: string;
  avatarUrl: string | null;
  ambassadorBadge: string | null;
}

export interface GuardianMessageData {
  id: string;
  sender: string; // USER | BOT | MODERATOR
  senderId: string | null;
  content: string;
  createdAt: string;
}

export interface GuardianTicketData {
  id: string;
  type: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
  answerText: string | null;
  answerSource: string | null;
  confidence: number | null;
  answeredAt: string | null;
  guardian: GuardianMini | null;
  user: { id: string; name: string } | null;
  answeredBy: GuardianMini | null;
  messages: GuardianMessageData[];
}

export interface ModerationQueueData {
  pending: GuardianTicketData[];
  recent: GuardianTicketData[];
}

function toMessage(m: any): GuardianMessageData {
  return {
    id: m.id,
    sender: m.sender,
    senderId: m.senderId ?? null,
    content: m.content,
    createdAt: m.createdAt.toISOString(),
  };
}

function toTicket(t: any): GuardianTicketData {
  return {
    id: t.id,
    type: t.type,
    subject: t.subject,
    message: t.message,
    status: t.status,
    createdAt: t.createdAt.toISOString(),
    answerText: t.answerText,
    answerSource: t.answerSource,
    confidence: t.confidence != null ? Number(t.confidence) : null,
    answeredAt: t.answeredAt ? t.answeredAt.toISOString() : null,
    guardian: t.guardian
      ? {
          id: t.guardian.id,
          name: t.guardian.name,
          avatarUrl: t.guardian.avatarUrl,
          ambassadorBadge: t.guardian.ambassadorBadge,
        }
      : null,
    user: t.user ? { id: t.user.id, name: t.user.name } : null,
    answeredBy: t.answeredBy
      ? {
          id: t.answeredBy.id,
          name: t.answeredBy.name,
          avatarUrl: t.answeredBy.avatarUrl,
          ambassadorBadge: t.answeredBy.ambassadorBadge,
        }
      : null,
    messages: t.messages ? t.messages.map(toMessage) : [],
  };
}

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

async function isAuthorizedModerator(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, isModerator: true },
  });
  if (!user) return false;
  return user.isModerator || ADMIN_EMAILS.includes(user.email.toLowerCase());
}

async function resolveGuardian(guardianId?: string): Promise<{ id: string; role: string | null }> {
  const toResult = (u: { id: string; ambassadorRole: string | null } | null) =>
    u ? { id: u.id, role: u.ambassadorRole } : { id: '', role: null };

  if (guardianId) {
    const found = await prisma.user.findFirst({
      where: {
        id: guardianId,
        isAmbassador: true,
        ambassadorRole: { in: GLOBAL_GUARDIAN_ROLES },
      },
      select: { id: true, ambassadorRole: true },
    });
    if (found) return toResult(found);
  }
  // Default to Kakatua Guide (platform expertise) when nothing specific is chosen.
  const guide = await prisma.user.findFirst({
    where: { ambassadorRole: 'GUIDE', isAmbassador: true },
    select: { id: true, ambassadorRole: true },
  });
  return toResult(guide);
}

// ─── Roster ───────────────────────────────────────────────────────────────────

export async function getGuardiansAction(): Promise<ActionResponse<GuardianProfile[]>> {
  try {
    const guardians = await prisma.user.findMany({
      where: { isAmbassador: true, ambassadorRole: { in: GLOBAL_GUARDIAN_ROLES } },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        ambassadorRole: true,
        ambassadorBadge: true,
        specialtyLanguages: true,
        isOnline: true,
        countrySlug: true,
      },
      orderBy: [{ isOnline: 'desc' }, { name: 'asc' }],
    });
    return {
      success: true,
      message: 'Guardian roster loaded.',
      data: guardians as GuardianProfile[],
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to load the guardian roster.' };
  }
}

// ─── Ask the flock guardian → auto bot → moderation fallback ──────────────────

export interface CreateTicketPayload {
  type: TicketType;
  subject: string;
  message: string;
  guardianId?: string;
}

export async function createGuardianTicketAction(
  userId: string,
  payload: CreateTicketPayload
): Promise<ActionResponse<GuardianTicketData>> {
  const { type, subject, message, guardianId } = payload;
  if (!type || !subject?.trim() || !message?.trim()) {
    return { success: false, error: 'Subject and message are required.' };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, status: true },
    });
    if (!user) return { success: false, error: 'Bird not found in the flock.' };
    if (user.status === 'suspended' || user.status === 'banned') {
      return { success: false, error: 'Suspended birds cannot raise guardian tickets.' };
    }

    const guardian = await resolveGuardian(guardianId);

    const ticket = await prisma.guardianTicket.create({
      data: {
        userId,
        guardianId: guardian.id || null,
        type,
        subject: subject.trim(),
        message: message.trim(),
        status: 'OPEN',
        messages: {
          create: {
            sender: 'USER',
            senderId: userId,
            content: message.trim(),
          },
        },
      },
      include: { guardian: true, user: true, messages: true },
    });

    // Run the automated context bot immediately.
    const ctx = await buildUserContext(userId);
    const verdict = answerFromContext(ctx, {
      type,
      subject: subject.trim(),
      message: message.trim(),
      guardianRole: guardian.role,
    });
    const now = new Date();

    let answered = false;
    if (verdict.source === 'BOT' && verdict.answer) {
      await prisma.guardianTicket.update({
        where: { id: ticket.id },
        data: {
          status: 'CLOSED',
          answerText: verdict.answer,
          answerSource: 'BOT',
          confidence: verdict.confidence,
          answeredAt: now,
        },
      });
      // Save the bot reply as a thread message
      await prisma.guardianMessage.create({
        data: {
          ticketId: ticket.id,
          sender: 'BOT',
          senderId: null,
          content: verdict.answer,
        },
      });
      answered = true;
    } else {
      await prisma.guardianTicket.update({
        where: { id: ticket.id },
        data: { status: 'PENDING_MODERATION', confidence: verdict.confidence },
      });
    }

    const saved = await prisma.guardianTicket.findUnique({
      where: { id: ticket.id },
      include: { guardian: true, user: true, messages: true },
    });

    await trackUserAction(userId, 'GUARDIAN_QUESTION_ASKED', { label: `Guardian question: ${subject.trim()}` });

    return {
      success: true,
      message: answered
        ? 'The Kakatua bot answered instantly. Your answer is ready below.'
        : 'This one needs a human touch — it has been routed to our moderation queue.',
      data: toTicket(saved),
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to raise the guardian ticket.' };
  }
}

export async function getMyGuardianRequestsAction(
  userId: string
): Promise<ActionResponse<GuardianTicketData[]>> {
  try {
    const tickets = await prisma.guardianTicket.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { guardian: true, user: true, messages: { orderBy: { createdAt: 'asc' } } },
    });
    return {
      success: true,
      message: 'Your guardian requests loaded.',
      data: tickets.map(toTicket),
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to load your requests.' };
  }
}

// ─── Developer / moderator queue ──────────────────────────────────────────────

export async function getModerationAccessAction(
  userId: string
): Promise<ActionResponse<{ authorized: boolean }>> {
  try {
    const authorized = await isAuthorizedModerator(userId);
    return {
      success: true,
      message: authorized ? 'Access granted.' : 'Not a moderator.',
      data: { authorized },
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to verify moderator access.' };
  }
}

export async function getModerationQueueAction(
  userId: string
): Promise<ActionResponse<ModerationQueueData | null>> {
  try {
    if (!(await isAuthorizedModerator(userId))) {
      return { success: true, message: 'Not authorized.', data: null };
    }

    const [pending, recent] = await Promise.all([
      prisma.guardianTicket.findMany({
        where: { status: 'PENDING_MODERATION' },
        orderBy: [{ confidence: 'asc' }, { createdAt: 'asc' }],
        include: { guardian: true, user: true, answeredBy: true, messages: { orderBy: { createdAt: 'asc' } } },
      }),
      prisma.guardianTicket.findMany({
        where: { status: 'CLOSED', answeredBy: { isNot: null } },
        orderBy: { answeredAt: 'desc' },
        take: 8,
        include: { guardian: true, user: true, answeredBy: true, messages: { orderBy: { createdAt: 'asc' } } },
      }),
    ]);

    return {
      success: true,
      message: 'Moderation queue loaded.',
      data: { pending: pending.map(toTicket), recent: recent.map(toTicket) },
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to load the moderation queue.' };
  }
}

export async function answerModerationTicketAction(
  moderatorId: string,
  ticketId: string,
  answer: string
): Promise<ActionResponse<null>> {
  try {
    if (!(await isAuthorizedModerator(moderatorId))) {
      return { success: false, error: 'Only authorized moderators can dispatch answers.' };
    }
    if (!answer?.trim()) {
      return { success: false, error: 'Write an answer before dispatching.' };
    }

    const ticket = await prisma.guardianTicket.findUnique({ where: { id: ticketId } });
    if (!ticket) return { success: false, error: 'Request not found.' };
    if (ticket.status !== 'PENDING_MODERATION') {
      return { success: false, error: 'This request is no longer in the queue.' };
    }

    await prisma.guardianTicket.update({
      where: { id: ticketId },
      data: {
        status: 'CLOSED',
        answerText: answer.trim(),
        answerSource: 'MODERATOR',
        answeredById: moderatorId,
        answeredAt: new Date(),
      },
    });

    return {
      success: true,
      message: 'Answer dispatched to the flock member.',
      data: null,
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to dispatch the answer.' };
  }
}

// ─── Thread replies — continue the conversation inside a ticket ───────────────

export async function replyToGuardianTicketAction(
  userId: string,
  ticketId: string,
  message: string
): Promise<ActionResponse<GuardianMessageData[]>> {
  if (!message?.trim()) {
    return { success: false, error: 'Write a message before sending.' };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, status: true },
    });
    if (!user) return { success: false, error: 'Bird not found in the flock.' };
    if (user.status === 'suspended' || user.status === 'banned') {
      return { success: false, error: 'Suspended birds cannot send messages.' };
    }

    const ticket = await prisma.guardianTicket.findUnique({
      where: { id: ticketId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
    if (!ticket) return { success: false, error: 'Ticket not found.' };
    if (ticket.userId !== userId) {
      return { success: false, error: 'This is not your ticket.' };
    }
    if (ticket.status === 'CLOSED') {
      return { success: false, error: 'This conversation is closed. Start a new request to continue.' };
    }

    // Append the user's reply
    const userMsg = await prisma.guardianMessage.create({
      data: {
        ticketId,
        sender: 'USER',
        senderId: userId,
        content: message.trim(),
      },
    });

    // If the ticket is handled by the bot, generate a follow-up reply
    if (ticket.status === 'OPEN') {
      const ctx = await buildUserContext(userId);
      const threadHistory = ticket.messages.map((m) => `${m.sender}: ${m.content}`).join('\n');
      const verdict = answerFromContext(ctx, {
        type: ticket.type,
        subject: ticket.subject,
        message: `${threadHistory}\nUSER: ${message.trim()}`,
        guardianRole: null,
      });

      if (verdict.source === 'BOT' && verdict.answer) {
        await prisma.guardianMessage.create({
          data: {
            ticketId,
            sender: 'BOT',
            senderId: null,
            content: verdict.answer,
          },
        });
        // Update ticket metadata
        await prisma.guardianTicket.update({
          where: { id: ticketId },
          data: {
            answerText: verdict.answer,
            answerSource: 'BOT',
            confidence: verdict.confidence,
            answeredAt: new Date(),
          },
        });
      } else {
        // Bot is unsure — escalate to moderation
        await prisma.guardianTicket.update({
          where: { id: ticketId },
          data: {
            status: 'PENDING_MODERATION',
            confidence: verdict.confidence,
          },
        });
      }
    }
    // If PENDING_MODERATION, the user's message is already saved —
    // moderators will see the full thread when they open the queue.

    // Return the full updated thread
    const updated = await prisma.guardianTicket.findUnique({
      where: { id: ticketId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });

    return {
      success: true,
      message: 'Reply sent.',
      data: updated!.messages.map(toMessage),
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to send reply.' };
  }
}
