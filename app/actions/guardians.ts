// Guardian Support System — server actions (app/actions/guardians.ts)
// Community members can raise tickets to "guardians" (verified ambassadors).
// Ambassadors see a live roster, a claimable inbox, and pending reports.

'use server';

import { prisma } from './db';
import { ActionResponse } from './types';

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

export interface GuardianTicketData {
  id: string;
  type: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
  acceptedAt: string | null;
  resolvedAt: string | null;
  resolution: string | null;
  guardian: GuardianMini | null;
  user: { id: string; name: string } | null;
}

export interface CommunityReportData {
  id: string;
  reason: string;
  status: string;
  createdAt: string;
  reporter: { id: string; name: string };
  reported: { id: string; name: string };
}

export interface GuardianDashboardData {
  profile: GuardianProfile;
  openTickets: GuardianTicketData[];
  assignedTickets: GuardianTicketData[];
  pendingReports: CommunityReportData[];
}

function toTicket(t: any): GuardianTicketData {
  return {
    id: t.id,
    type: t.type,
    subject: t.subject,
    message: t.message,
    status: t.status,
    createdAt: t.createdAt.toISOString(),
    acceptedAt: t.acceptedAt ? t.acceptedAt.toISOString() : null,
    resolvedAt: t.resolvedAt ? t.resolvedAt.toISOString() : null,
    resolution: t.resolution,
    guardian: t.guardian
      ? {
          id: t.guardian.id,
          name: t.guardian.name,
          avatarUrl: t.guardian.avatarUrl,
          ambassadorBadge: t.guardian.ambassadorBadge,
        }
      : null,
    user: t.user ? { id: t.user.id, name: t.user.name } : null,
  };
}

async function getAmbassadorProfile(userId: string): Promise<GuardianProfile | null> {
  const user = await prisma.user.findFirst({
    where: { id: userId, isAmbassador: true },
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
  });
  return user as GuardianProfile | null;
}

// ─── Community-facing actions ─────────────────────────────────────────────────

export async function getGuardiansAction(): Promise<ActionResponse<GuardianProfile[]>> {
  try {
    const guardians = await prisma.user.findMany({
      where: { isAmbassador: true },
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

    // Preferred guardian must be a real, online ambassador; otherwise auto-assign.
    let assignedGuardianId: string | null = null;
    if (guardianId) {
      const preferred = await prisma.user.findFirst({
        where: { id: guardianId, isAmbassador: true },
        select: { id: true, isOnline: true },
      });
      if (preferred) assignedGuardianId = preferred.id;
    }
    if (!assignedGuardianId) {
      const online = await prisma.user.findFirst({
        where: { isAmbassador: true, isOnline: true },
        select: { id: true },
      });
      if (online) assignedGuardianId = online.id;
    }

    const ticket = await prisma.guardianTicket.create({
      data: {
        userId,
        guardianId: assignedGuardianId,
        type,
        subject: subject.trim(),
        message: message.trim(),
        status: 'OPEN',
      },
      include: { guardian: true, user: true },
    });

    return {
      success: true,
      message: assignedGuardianId
        ? 'Your request has reached a guardian. They will reply at their perch.'
        : 'Your request is queued for the next available guardian.',
      data: toTicket(ticket),
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
      include: { guardian: true, user: true },
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

// ─── Guardian-facing actions ──────────────────────────────────────────────────

export async function getGuardianDashboardAction(
  userId: string
): Promise<ActionResponse<GuardianDashboardData | null>> {
  try {
    const profile = await getAmbassadorProfile(userId);
    if (!profile) {
      return { success: true, message: 'Not a guardian.', data: null };
    }

    const [openTickets, assignedTickets, pendingReports] = await Promise.all([
      prisma.guardianTicket.findMany({
        where: { status: 'OPEN' },
        orderBy: { createdAt: 'asc' },
        include: { guardian: true, user: true },
      }),
      prisma.guardianTicket.findMany({
        where: { status: 'ACCEPTED', guardianId: userId },
        orderBy: { acceptedAt: 'asc' },
        include: { guardian: true, user: true },
      }),
      prisma.userReport.findMany({
        where: { status: 'PENDING' },
        orderBy: { createdAt: 'asc' },
        include: {
          reporter: { select: { id: true, name: true } },
          reported: { select: { id: true, name: true } },
        },
      }),
    ]);

    return {
      success: true,
      message: 'Guardian dashboard loaded.',
      data: {
        profile,
        openTickets: openTickets.map(toTicket),
        assignedTickets: assignedTickets.map(toTicket),
        pendingReports: pendingReports.map((r) => ({
          id: r.id,
          reason: r.reason,
          status: r.status,
          createdAt: r.createdAt.toISOString(),
          reporter: r.reporter,
          reported: r.reported,
        })),
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to load guardian dashboard.' };
  }
}

export async function acceptGuardianTicketAction(
  guardianId: string,
  ticketId: string
): Promise<ActionResponse<null>> {
  try {
    const profile = await getAmbassadorProfile(guardianId);
    if (!profile) {
      return { success: false, error: 'Only guardians can accept requests.' };
    }

    const ticket = await prisma.guardianTicket.findUnique({ where: { id: ticketId } });
    if (!ticket) return { success: false, error: 'Request not found.' };
    if (ticket.status !== 'OPEN') {
      return { success: false, error: 'This request has already been handled.' };
    }

    await prisma.guardianTicket.update({
      where: { id: ticketId },
      data: { guardianId, status: 'ACCEPTED', acceptedAt: new Date() },
    });

    return { success: true, message: 'Request accepted. The flock member has been notified.', data: null };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to accept the request.' };
  }
}

export async function closeGuardianTicketAction(
  guardianId: string,
  ticketId: string,
  resolution: string
): Promise<ActionResponse<null>> {
  try {
    const profile = await getAmbassadorProfile(guardianId);
    if (!profile) {
      return { success: false, error: 'Only guardians can close requests.' };
    }

    const ticket = await prisma.guardianTicket.findUnique({ where: { id: ticketId } });
    if (!ticket) return { success: false, error: 'Request not found.' };
    if (ticket.guardianId !== guardianId || ticket.status !== 'ACCEPTED') {
      return { success: false, error: 'This request is not assigned to you.' };
    }
    if (!resolution?.trim()) {
      return { success: false, error: 'Please write a short resolution note.' };
    }

    await prisma.guardianTicket.update({
      where: { id: ticketId },
      data: { status: 'CLOSED', resolution: resolution.trim(), resolvedAt: new Date() },
    });

    return { success: true, message: 'Request resolved. Great guardian work.', data: null };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to close the request.' };
  }
}

export async function resolveCommunityReportAction(
  guardianId: string,
  reportId: string,
  resolution: string,
  outcome: 'ACTIONED' | 'DISMISSED'
): Promise<ActionResponse<null>> {
  try {
    const profile = await getAmbassadorProfile(guardianId);
    if (!profile) {
      return { success: false, error: 'Only guardians can moderate reports.' };
    }

    const report = await prisma.userReport.findUnique({ where: { id: reportId } });
    if (!report) return { success: false, error: 'Report not found.' };
    if (report.status !== 'PENDING') {
      return { success: false, error: 'This report has already been reviewed.' };
    }
    if (!resolution?.trim()) {
      return { success: false, error: 'Please note what action you took.' };
    }

    await prisma.userReport.update({
      where: { id: reportId },
      data: {
        status: outcome,
        resolution: resolution.trim(),
        resolvedById: guardianId,
        resolvedAt: new Date(),
      },
    });

    return {
      success: true,
      message: outcome === 'ACTIONED'
        ? 'Report actioned. The flock is safer now.'
        : 'Report dismissed.',
      data: null,
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to resolve the report.' };
  }
}
