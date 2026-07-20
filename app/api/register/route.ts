import { NextResponse } from 'next/server';
import { prisma } from '../../actions/db';
import bcrypt from 'bcryptjs';

// Reserved ambassador emails — cannot be registered by public users.
const RESERVED_EMAILS = [
  'guide@kakatua.app',
  'buddy@kakatua.app',
  'dhaka@kakatua.app',
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

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

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: name.trim(),
        password: hashedPassword,
        nativeLanguages: JSON.stringify([]),
        learningLanguages: JSON.stringify([]),
        interests: JSON.stringify([]),
        timezoneOffset: 0,
        status: 'active',
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Your nest has been built. Welcome to the flock.',
        user: { id: user.id, email: user.email, name: user.name },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('=== REGISTRATION ERROR ===');
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    console.error('Meta:', error.meta);
    console.error('Stack:', error.stack);
    console.error('==========================');
    return NextResponse.json(
      {
        error: 'The nest builder encountered an unexpected error. Please try again.',
        _debug: process.env.NODE_ENV !== 'production' ? { code: error.code, message: error.message } : undefined,
      },
      { status: 500 }
    );
  }
}
