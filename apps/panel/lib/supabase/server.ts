/**
 * Server-side auth helpers.
 *
 * Use `getCurrentUser()` in server components and route handlers to get the
 * logged-in user. It pulls from Supabase Auth + joins to the local `users`
 * table so you also get the role.
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { db, users } from '@seed-panel/db';
import type { PanelUser } from '@seed-panel/core';
import { eq } from 'drizzle-orm';

export async function getServerSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookieList) => {
          try {
            cookieList.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server components can't set cookies; that's OK
          }
        },
      },
    },
  );
}

export async function getCurrentUser(): Promise<PanelUser | null> {
  const supabase = await getServerSupabase();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  // Look up the app-level profile (role, etc.)
  let profile = await db.query.users.findFirst({
    where: eq(users.id, authUser.id),
  });

  // If they're authed but missing from our users table, create on the fly.
  // First sign-in fires multiple server components in parallel, so we need
  // onConflictDoNothing + refetch to survive the race.
  if (!profile) {
    await db
      .insert(users)
      .values({
        id: authUser.id,
        email: authUser.email ?? '',
        role: 'admin', // first user is admin; refine when invitation system exists
      })
      .onConflictDoNothing();
    profile = await db.query.users.findFirst({
      where: eq(users.id, authUser.id),
    });
    if (!profile) return null;
  }

  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.fullName,
    role: profile.role as PanelUser['role'],
    isActive: profile.isActive,
  };
}

export async function signOut() {
  const supabase = await getServerSupabase();
  await supabase.auth.signOut();
}
