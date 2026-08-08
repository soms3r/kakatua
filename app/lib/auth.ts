import { NextAuthOptions, getServerSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '../actions/db';
import bcrypt from 'bcryptjs';
import { sendVerificationForUser } from './email';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      emailVerified?: boolean | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Email & Password',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'your@nest.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Every bird needs a name and a key to their nest.');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });

        if (!user) {
          throw new Error('No nest found with this email. Have you built one yet?');
        }

        if (user.isAmbassador) {
          return null;
        }

        if (!user.password) {
          throw new Error('This account was created without a password. Try a different way in.');
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error('That key does not fit this lock. Try again.');
        }

        if (user.status === 'suspended') {
          throw new Error('Your wings are clipped. Please wait before flying again.');
        }

        if (user.status === 'banned') {
          throw new Error('This nest is no longer part of the canopy.');
        }

        // Unverified birds get a fresh confirmation link on every login attempt.
        const verification = await prisma.verification.findUnique({
          where: { userId: user.id },
          select: { emailVerified: true },
        });
        if (verification && !verification.emailVerified) {
          void sendVerificationForUser(user.id, user.email, user.name);
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    newUser: '/register',
  },
  events: {
    async signIn({ user }) {
      // Mark the bird as present on the guardian roster.
      if (user?.id) {
        await prisma.user.update({
          where: { id: user.id },
          data: { isOnline: true },
        });
      }
    },
    async signOut({ token }) {
      // Mark the bird as away when they leave the nest.
      const id = token?.id;
      if (id) {
        await prisma.user.update({
          where: { id },
          data: { isOnline: false },
        });
      }
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        const verification = await prisma.verification.findUnique({
          where: { userId: token.id },
          select: { emailVerified: true },
        });
        session.user.emailVerified = verification?.emailVerified ?? null;
      }
      return session;
    },
  },
};

export async function getAuthSession() {
  return getServerSession(authOptions);
}
