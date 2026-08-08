'use server';

// Next.js Server Actions: Referral System (app/actions/referrals.ts)
// Every bird gets a short, human-readable invite code (e.g. "tasneem") that
// powers a referral link like {origin}/join/tasneem. Clicks are logged
// anonymously; signups that arrive through a code are linked to the inviter.

import QRCode from 'qrcode';
import { prisma } from './db';
import { ActionResponse } from './types';
import { logActivity } from './activity';

const CODE_ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789'; // no look-alike chars
const MAX_CODE_LENGTH = 20;

// ─── Code Generation ─────────────────────────────────────────────────────────
// Turn a display name into a clean, human-readable slug (kept ASCII/lowercase).
function slugifyReferralBase(name: string): string {
  const slug = name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '')
    .replace(/^[0-9]+/, '')
    .slice(0, MAX_CODE_LENGTH);
  return slug || 'kakatua';
}

function randomSuffix(length: number): string {
  let out = '';
  for (let i = 0; i < length; i++) {
    out += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return out;
}

// Generate a referral code that is guaranteed to be unique in the users table.
export async function generateUniqueReferralCode(baseName: string): Promise<string> {
  const base = slugifyReferralBase(baseName);
  const taken = await prisma.user.findMany({
    where: { referralCode: { startsWith: base } },
    select: { referralCode: true },
  });
  const used = new Set(taken.map((u) => u.referralCode).filter(Boolean) as string[]);

  if (!used.has(base) && base.length >= 4) return base;

  for (let len = 2; len <= 6; len++) {
    for (let attempt = 0; attempt < 8; attempt++) {
      const candidate = `${base.slice(0, Math.max(4, MAX_CODE_LENGTH - len))}${randomSuffix(len)}`;
      if (!used.has(candidate)) return candidate;
    }
  }

  // Fallback: full random code (unlikely to ever be reached).
  for (let attempt = 0; attempt < 12; attempt++) {
    const candidate = randomSuffix(10);
    if (!used.has(candidate)) return candidate;
  }
  return `${base}_${Date.now().toString(36)}`;
}

export async function getUserReferralCode(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { referralCode: true, name: true },
  });
  if (user?.referralCode) return user.referralCode;
  if (!user) return null;

  const code = await generateUniqueReferralCode(user.name);
  await prisma.user.update({ where: { id: userId }, data: { referralCode: code } });
  return code;
}

// ─── Referral Stats ──────────────────────────────────────────────────────────
export interface ReferralInvitedUser {
  id: string;
  name: string;
  avatarUrl: string | null;
  joinedAt: string;
}

export interface ReferralStats {
  code: string;
  link: string;
  clicks: number;
  signups: number;
  invitedUsers: ReferralInvitedUser[];
  qrDataUrl: string;
}

export async function getReferralStatsAction(
  userId: string,
  origin?: string
): Promise<ActionResponse<ReferralStats>> {
  try {
    const code = await getUserReferralCode(userId);
    if (!code) {
      return { success: false, error: 'We could not find a referral code for your nest.' };
    }

    const [clickCount, signupRows] = await Promise.all([
      prisma.referralClick.count({ where: { referralCode: code } }),
      prisma.referralSignup.findMany({
        where: { referralCode: code },
        orderBy: { createdAt: 'desc' },
        select: { id: true, createdAt: true, newUser: { select: { id: true, name: true, avatarUrl: true } } },
      }),
    ]);

    const safeOrigin =
      origin && /^https?:\/\//.test(origin) ? origin.replace(/\/+$/, '') : 'https://kakatua.vercel.app';
    const link = `${safeOrigin}/join/${encodeURIComponent(code)}`;
    const qrDataUrl = await QRCode.toDataURL(link, { margin: 1, width: 320 });

    return {
      success: true,
      message: 'Your referral nest is ready.',
      data: {
        code,
        link,
        clicks: clickCount,
        signups: signupRows.length,
        invitedUsers: signupRows.map((s) => ({
          id: s.newUser.id,
          name: s.newUser.name,
          avatarUrl: s.newUser.avatarUrl,
          joinedAt: s.createdAt.toISOString(),
        })),
        qrDataUrl,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to load your referral stats.' };
  }
}

// ─── Click Tracking ──────────────────────────────────────────────────────────
// Called by /join/[code] — records that an invite link was visited.
export async function logReferralClickAction(
  referralCode: string,
  ipAddress?: string | null
): Promise<ActionResponse<{ referralCode: string }>> {
  const code = referralCode?.trim().toLowerCase();
  if (!code) return { success: false, error: 'No referral code provided.' };

  try {
    const owner = await prisma.user.findUnique({
      where: { referralCode: code },
      select: { id: true },
    });
    if (!owner) {
      return { success: false, error: 'That invite code does not belong to the flock.' };
    }

    await prisma.referralClick.create({
      data: {
        referralCode: code,
        ipAddress: ipAddress || null,
      },
    });

    return { success: true, message: 'Invite visit recorded.', data: { referralCode: code } };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to record the invite visit.' };
  }
}

// ─── Signup Linking ──────────────────────────────────────────────────────────
// Called by the registration route: links a brand-new nest to its inviter.
export async function linkReferralSignup(
  referralCode: string,
  newUserId: string
): Promise<ActionResponse<{ inviterId: string }>> {
  const code = referralCode?.trim().toLowerCase();
  if (!code) return { success: false, error: 'No referral code provided.' };

  try {
    const inviter = await prisma.user.findUnique({
      where: { referralCode: code },
      select: { id: true, name: true },
    });
    if (!inviter) {
      return { success: false, error: 'That invite code does not belong to the flock.' };
    }

    // Guard against self-referral and double-linking.
    if (inviter.id === newUserId) {
      return { success: false, error: 'A bird cannot invite itself to the nest.' };
    }
    const existing = await prisma.referralSignup.findFirst({ where: { newUserId } });
    if (existing) {
      return { success: false, error: 'This nest has already been linked to an inviter.' };
    }

    await prisma.$transaction([
      prisma.referralSignup.create({
        data: { referralCode: code, newUserId },
      }),
      prisma.user.update({
        where: { id: newUserId },
        data: { invitedById: inviter.id },
      }),
    ]);

    await logActivity(
      inviter.id,
      'REFERRAL_SIGNUP',
      `${inviter.name} invited a new bird`,
      'Someone built their nest through your referral link.',
      { referralCode: code }
    );

    return { success: true, message: 'Welcome to the flock!', data: { inviterId: inviter.id } };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to link your referral.' };
  }
}
