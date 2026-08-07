import { NextResponse } from 'next/server';
import { prisma } from '../../actions/db';
import { verifyEmailVerificationToken } from '../../lib/email';

function renderPage(content: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#eae8e4;font-family:ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif;">
    <div style="max-width:520px;margin:0 auto;padding:64px 16px;">
      <div style="background:#fbf9f5;border:1px solid #dbdad6;border-radius:24px;overflow:hidden;box-shadow:0 20px 50px rgba(21,66,18,0.12);">
        <div style="height:6px;background:linear-gradient(90deg,#154212,#2D5A27,#a1d494);"></div>
        <div style="padding:44px 32px;text-align:center;">
          ${content}
        </div>
      </div>
    </div>
  </body>
</html>`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  if (!token) {
    return new NextResponse(
      renderPage(`
        <div style="font-size:40px;">🔒</div>
        <h1 style="color:#154212;font-size:20px;margin:12px 0 4px;">Missing verification link</h1>
        <p style="color:#72796e;font-size:13px;line-height:1.6;margin:8px 0 0;">
          This link is incomplete. Try opening the full link from your email again.
        </p>
      `),
      { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }

  const userId = verifyEmailVerificationToken(token);

  if (!userId) {
    return new NextResponse(
      renderPage(`
        <div style="font-size:40px;">🫥</div>
        <h1 style="color:#154212;font-size:20px;margin:12px 0 4px;">Link invalid or expired</h1>
        <p style="color:#72796e;font-size:13px;line-height:1.6;margin:8px 0 0;">
          This confirmation link is no longer valid. Log in to your nest to request a fresh one.
        </p>
      `),
      { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return new NextResponse(
      renderPage(`
        <div style="font-size:40px;">🪹</div>
        <h1 style="color:#154212;font-size:20px;margin:12px 0 4px;">Nest not found</h1>
        <p style="color:#72796e;font-size:13px;line-height:1.6;margin:8px 0 0;">
          We couldn't find the nest for this link. It may have been removed.
        </p>
      `),
      { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }

  // Mark the email as verified (idempotent — safe to click twice).
  await prisma.verification.upsert({
    where: { userId },
    create: { userId, emailVerified: true, method: 'EMAIL', verifiedAt: new Date() },
    update: { emailVerified: true, method: 'EMAIL', verifiedAt: new Date() },
  });

  return new NextResponse(
    renderPage(`
      <div style="font-size:40px;">🌿</div>
      <h1 style="color:#154212;font-size:20px;margin:12px 0 4px;">Your nest is confirmed!</h1>
      <p style="color:#72796e;font-size:13px;line-height:1.6;margin:8px 0 24px;">
        Thanks, <strong>${user.name}</strong>. Your email is verified — the canopy is all yours.
      </p>
      <a href="/login" style="display:inline-block;background:#2D5A27;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 28px;border-radius:9999px;">
        Return to my nest
      </a>
    `),
    { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}
