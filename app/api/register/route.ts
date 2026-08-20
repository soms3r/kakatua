import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '../../actions/db';
import bcrypt from 'bcryptjs';
import {
  createEmailVerificationToken,
  sendVerificationEmail,
} from '../../lib/email';
import { generateUniqueReferralCode, linkReferralSignup } from '../../actions/referrals';

// Reserved ambassador emails — cannot be registered by public users.
// Exactly the two global guardians of the flock.
const RESERVED_EMAILS = [
  'guide@kakatua.app',
  'buddy@kakatua.app',
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, referralCode: bodyReferralCode } = body;

    // Fall back to the HTTP-only cookie set by /join/[code] if the body
    // doesn't carry a referral code (e.g. user navigated directly to /register).
    let referralCode = bodyReferralCode || null;
    if (!referralCode) {
      const cookieStore = await cookies();
      referralCode = cookieStore.get('kakatua_ref_code')?.value || null;
    }

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required to build your nest.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Your passkey should be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Block registration with reserved ambassador emails
    if (RESERVED_EMAILS.includes(normalizedEmail)) {
      return NextResponse.json(
        { error: 'This nest is reserved for a guardian of the flock.' },
        { status: 403 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A nest with this email already exists. Try logging in instead.' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const cleanName = name.trim();

    // Each bird gets a unique, human-readable invite code based on their name.
    let user = null;
    for (let attempt = 0; attempt < 5 && !user; attempt++) {
      const referralCode = await generateUniqueReferralCode(cleanName);
      try {
        user = await prisma.user.create({
          data: {
            email: normalizedEmail,
            name: cleanName,
            password: hashedPassword,
            referralCode,
            nativeLanguages: JSON.stringify([]),
            learningLanguages: JSON.stringify([]),
            interests: JSON.stringify([]),
            timezoneOffset: 0,
            status: 'active',
          },
        });
      } catch (err: any) {
        // Rare race: two birds claimed the same code — regenerate and retry.
        if (err?.code === 'P2002' && String(err?.meta?.target ?? '').includes('referral')) {
          continue;
        }
        throw err;
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: 'The nest builder hit a hiccup minting your invite code. Please try again.' },
        { status: 500 }
      );
    }

    // If the new bird arrived via a referral link, link them to their inviter.
    // Never block the nest-building flow on referral bookkeeping.
    if (referralCode) {
      try {
        await linkReferralSignup(referralCode, user.id);
      } catch (refErr: any) {
        console.warn('[referral] Signup linking skipped for', user.id, ':', refErr?.message);
      }
    }

    // Create an unverified verification record and fire off the confirmation email.
    // Email delivery must never block registration.
    await prisma.verification.upsert({
      where: { userId: user.id },
      create: { userId: user.id, emailVerified: false, method: 'EMAIL' },
      update: {},
    });

    const token = createEmailVerificationToken(user.id);
    void sendVerificationEmail({ email: user.email, name: user.name, token }).then(
      (result) => {
        if (!result.ok && !result.skipped) {
          console.error(`[email] Verification email delivery failed for ${user.email}:`, result.error);
        }
      }
    );

    // Clear the referral cookie — it has served its purpose.
    const response = NextResponse.json(
      {
        success: true,
        message: 'Your nest has been built. Welcome to the flock.',
        user: { id: user.id, email: user.email, name: user.name, referralCode: user.referralCode },
      },
      { status: 201 }
    );
    response.cookies.set('kakatua_ref_code', '', { maxAge: 0, path: '/' });
    return response;
  } catch (error: any) {
    console.error('=== REGISTRATION ERROR ===');
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    console.error('Meta:', error.meta);
    console.error('Stack:', error.stack);
    console.error('==========================');

    const code = error?.code ?? null;
    const message = error?.message ?? 'Unknown database or runtime error.';

    return NextResponse.json(
      {
        error: 'The nest builder encountered an unexpected error. Please try again.',
        _debug: { code, message },
      },
      { status: 500 }
    );
  }
}
