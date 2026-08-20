import { redirect } from 'next/navigation';
import { headers, cookies } from 'next/headers';
import { getAuthSession } from '../../lib/auth';
import { logReferralClickAction } from '../../actions/referrals';

// 30 days in seconds
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

// /join/[code] — the tip of an invite link. Logs the visit anonymously,
// persists the referral code in an HTTP-only cookie, then sends the bird
// to registration with their invite attached.
export default async function JoinPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const cleanCode = decodeURIComponent(code).trim().toLowerCase();

  const session = await getAuthSession();
  if (session?.user?.id) {
    redirect('/');
  }

  // Capture the visitor's IP for click analytics (best-effort; never blocking).
  const headerList = await headers();
  const forwarded = headerList.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || headerList.get('x-real-ip') || null;

  if (cleanCode) {
    // Record the click asynchronously — don't block the redirect.
    logReferralClickAction(cleanCode, ip).catch(() => {});

    // Persist the referral code in an HTTP-only cookie so it survives
    // page navigations, tab closes, and works even if the ?ref= param
    // is stripped by intermediaries.
    const cookieStore = await cookies();
    cookieStore.set('kakatua_ref_code', cleanCode, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: COOKIE_MAX_AGE,
    });
  }

  redirect(`/register?ref=${encodeURIComponent(cleanCode)}`);
}
