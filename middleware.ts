import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/login',
  },
});

export const config = {
  matcher: [
    '/((?!login|register|api/auth|api/register|_next/static|_next/image|favicon\\.svg|manifest\\.json|sw\\.js|icons/.*|legal/.*).*)',
  ],
};
