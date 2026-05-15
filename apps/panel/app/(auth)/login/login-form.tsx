'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setStatus('error');
      setErrorMsg(error.message);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-xs font-medium text-muted-foreground">
          Email address
        </label>
        <input
          type="email"
          id="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="w-full h-10 px-3 rounded-md border border-border bg-background
                     focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                     text-sm placeholder:text-muted-foreground/60"
          disabled={status === 'loading'}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-xs font-medium text-muted-foreground">
          Password
        </label>
        <input
          type="password"
          id="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full h-10 px-3 rounded-md border border-border bg-background
                     focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                     text-sm placeholder:text-muted-foreground/60"
          disabled={status === 'loading'}
        />
      </div>

      {status === 'error' && (
        <p className="text-xs text-red-600">{errorMsg || 'Invalid email or password.'}</p>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium
                   hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {status === 'loading' ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
