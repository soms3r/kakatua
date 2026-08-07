import crypto from 'crypto';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_missing');

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || 'Kakatua <onboarding@resend.dev>';

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXTAUTH_URL ||
  'http://localhost:3000';

const SIGNING_SECRET =
  process.env.EMAIL_TOKEN_SECRET || process.env.NEXTAUTH_SECRET || 'kakatua-dev-signing-secret';

const VERIFICATION_TOKEN_TTL_SECONDS = 24 * 60 * 60; // 24 hours

function base64UrlEncode(data: string): string {
  return Buffer.from(data, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlDecode(data: string): string {
  return Buffer.from(data.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
}

function sign(payload: string): string {
  return crypto.createHmac('sha256', SIGNING_SECRET).update(payload).digest('base64url');
}

// ─── Verification tokens (HMAC-signed, self-contained — no DB storage) ───

export function createEmailVerificationToken(userId: string): string {
  const payload = base64UrlEncode(
    JSON.stringify({ sub: userId, exp: Math.floor(Date.now() / 1000) + VERIFICATION_TOKEN_TTL_SECONDS })
  );
  return `${payload}.${sign(payload)}`;
}

export function verifyEmailVerificationToken(token: string): string | null {
  try {
    const [payload, signature] = token.split('.');
    if (!payload || !signature) return null;

    const expected = sign(payload);
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

    const decoded = JSON.parse(base64UrlDecode(payload)) as { sub?: string; exp?: number };
    if (!decoded.sub || !decoded.exp) return null;
    if (Date.now() / 1000 > decoded.exp) return null; // expired

    return decoded.sub;
  } catch {
    return null;
  }
}

export function getVerificationUrl(token: string): string {
  return `${APP_URL}/api/verify-email?token=${encodeURIComponent(token)}`;
}

export async function sendVerificationForUser(
  userId: string,
  email: string,
  name: string
): Promise<SendVerificationEmailResult> {
  const token = createEmailVerificationToken(userId);
  return sendVerificationEmail({ email, name, token });
}

// ─── Email sending ────────────────────────────────────────────────────────

export interface SendVerificationEmailResult {
  ok: boolean;
  skipped?: boolean;
  error?: string;
}

export async function sendVerificationEmail(input: {
  email: string;
  name: string;
  token: string;
}): Promise<SendVerificationEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(`[email] RESEND_API_KEY not set — skipping verification email to ${input.email}`);
    return { ok: false, skipped: true };
  }

  const verifyUrl = getVerificationUrl(input.token);
  const displayName = input.name.trim() || 'friend';

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#eae8e4;font-family:ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif;">
    <div style="max-width:520px;margin:0 auto;padding:32px 16px;">
      <div style="background:#fbf9f5;border:1px solid #dbdad6;border-radius:24px;overflow:hidden;box-shadow:0 20px 50px rgba(21,66,18,0.12);">
        <div style="height:6px;background:linear-gradient(90deg,#154212,#2D5A27,#a1d494);"></div>
        <div style="padding:36px 32px;text-align:center;">
          <div style="font-size:40px;">🌿</div>
          <h1 style="color:#154212;font-size:20px;margin:12px 0 4px;">Confirm your nest</h1>
          <p style="color:#72796e;font-size:13px;line-height:1.6;margin:8px 0 24px;">
            Hello <strong>${displayName}</strong>! The canopy is almost yours. Confirm your email
            so your nest is safe and ready for the flock.
          </p>
          <a href="${verifyUrl}" style="display:inline-block;background:#2D5A27;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 28px;border-radius:9999px;">
            Verify my email
          </a>
          <p style="color:#72796e;font-size:12px;line-height:1.6;margin:24px 0 0;">
            Or copy this link into your browser:<br />
            <span style="color:#2D5A27;word-break:break-all;">${verifyUrl}</span>
          </p>
          <p style="color:#9aa29a;font-size:11px;line-height:1.6;margin:20px 0 0;border-top:1px solid #dbdad6;padding-top:16px;">
            This link expires in 24 hours. If you didn't build a nest on Kakatua, you can ignore this email.
          </p>
        </div>
      </div>
    </div>
  </body>
</html>`;

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: input.email,
      subject: 'Confirm your email — welcome to Kakatua',
      html,
    });

    if (error) {
      console.error('[email] Resend send failed:', error);
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (err: any) {
    console.error('[email] Resend threw while sending:', err?.message ?? err);
    return { ok: false, error: err?.message ?? 'Unknown email error' };
  }
}
