'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError(result.error);
      return;
    }

    router.push('/');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#eae8e4] flex items-center justify-center font-sans antialiased text-[#1b1c1a] p-4 sm:p-8">
      <div className="w-full max-w-lg bg-[#fbf9f5] shadow-[0_20px_50px_rgba(21,66,18,0.15)] rounded-[32px] flex flex-col relative border border-[#dbdad6] overflow-hidden">

        {/* Decorative top leaf */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#154212] via-[#2D5A27] to-[#a1d494]" />

        <div className="px-8 pt-12 pb-8 flex flex-col items-center text-center">
          <span className="material-symbols-outlined text-5xl text-[#2D5A27] mb-3">nest_eco_leaf</span>
          <h1 className="text-xl font-bold text-[#154212] tracking-tight">Welcome Back</h1>
          <p className="text-xs text-[#72796e] mt-1 max-w-[80%] leading-relaxed">
            The canopy missed you. Enter your passkey to return to your nest.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-8 pb-8 flex flex-col gap-4">
          {error && (
            <div className="bg-[#ffdad6] border border-[#ba1a1a]/20 rounded-2xl px-4 py-3 text-xs text-[#ba1a1a] text-center leading-relaxed">
              <span className="material-symbols-outlined text-sm align-middle mr-1">sadness</span>
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="text-[11px] font-medium text-[#72796e] mb-1.5 block">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@nest.com"
              required
              className="w-full bg-[#f5f3ef] border border-[#dbdad6] rounded-2xl px-4 py-3 text-sm text-[#1b1c1a] placeholder:text-[#72796e] focus:outline-none focus:ring-2 focus:ring-[#a1d494] focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label htmlFor="password" className="text-[11px] font-medium text-[#72796e] mb-1.5 block">
              Passkey
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-[#f5f3ef] border border-[#dbdad6] rounded-2xl px-4 py-3 text-sm text-[#1b1c1a] placeholder:text-[#72796e] focus:outline-none focus:ring-2 focus:ring-[#a1d494] focus:border-transparent transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full bg-[#2D5A27] hover:bg-[#154212] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all text-white font-semibold text-sm py-3 px-6 rounded-full flex items-center justify-center gap-2 shadow-md shadow-[#2d5a27]/10 mt-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Entering the Canopy...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-lg">login</span>
                Return to My Nest
              </>
            )}
          </button>
        </form>

        <div className="px-8 pb-8 flex flex-col items-center gap-3 text-xs text-[#72796e]">
          <p>
            Haven&apos;t built your nest yet?{' '}
            <Link href="/register" className="text-[#2D5A27] font-semibold hover:underline">
              Build one here
            </Link>
          </p>
          <Link href="/" className="flex items-center gap-1 hover:text-[#2D5A27] transition-colors">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Home
          </Link>
        </div>

      </div>
    </div>
  );
}
