import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { getAuthSession } from '../../lib/auth';
import { logReferralClickAction } from '../../actions/referrals';

// /join/[code] — the tip of an invite link. Logs the visit anonymously,
// then sends the bird to registration with their invite attached.
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
    await logReferralClickAction(cleanCode, ip);
  }

  redirect(`/register?ref=${encodeURIComponent(cleanCode)}`);
}
