/**
 * Supabase client factories.
 *
 * - `createBrowserSupabase()` — for client components / hooks
 * - `createServerSupabase()` — for server components / route handlers
 *     (reads cookies, refreshes session)
 * - `createAdminSupabase()` — bypasses RLS, server-only
 *     (use sparingly; only for ops like inviting users)
 *
 * These wrap @supabase/ssr so app code doesn't depend on Supabase types
 * directly — if we ever swap auth providers, only this file changes.
 */

import { createBrowserClient, createServerClient } from '@supabase/ssr';
import type { CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
if (!anonKey) throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');

/**
 * Browser client — for "use client" components.
 * Auth state syncs via cookies set by the server.
 */
export function createBrowserSupabase() {
  return createBrowserClient(url, anonKey);
}

/**
 * Server client — for server components, server actions, route handlers.
 * Needs to be called with the request's cookie store.
 *
 * Usage in a server component:
 *   import { cookies } from 'next/headers';
 *   const supabase = await createServerSupabase(cookies);
 */
export async function createServerSupabase(
  cookieStore: () => Promise<{
    getAll: () => { name: string; value: string }[];
    set?: (name: string, value: string, options?: CookieOptions) => void;
  }>,
) {
  const store = await cookieStore();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (cookies: { name: string; value: string; options: CookieOptions }[]) => {
        try {
          cookies.forEach(({ name, value, options }) => {
            store.set?.(name, value, options);
          });
        } catch {
          // Server components can't set cookies; that's fine.
          // Set happens in middleware / route handlers.
        }
      },
    },
  });
}

/**
 * Admin client — bypasses RLS. Server-only. Never expose to the browser.
 */
export function createAdminSupabase() {
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set — required for admin operations');
  }
  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
