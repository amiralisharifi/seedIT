'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setStatus('error');
      setErrorMsg(error.message);
      return;
    }
    setStatus('sent');
  }

  if (status === 'sent') {
    return (
      <div className="rounded-md border border-border bg-muted/50 p-4 text-center">
        <p className="text-sm font-medium">Check your inbox</p>
        <p className="mt-1 text-xs text-muted-foreground">
          We sent a sign-in link to <strong>{email}</strong>. It expires in 1 hour.
        </p>
      </div>
    );
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
          disabled={status === 'sending'}
        />
      </div>

      {status === 'error' && (
        <p className="text-xs text-red-600">{errorMsg || 'Something went wrong. Try again.'}</p>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium
                   hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {status === 'sending' ? 'Sending…' : 'Send sign-in link'}
      </button>

      <p className="text-xs text-center text-muted-foreground">
        New here? Ask an admin to invite you.
      </p>
    </form>
  );
}
