/**
 * Auth middleware.
 *
 * Runs on every request. Refreshes the Supabase session (so users don't get
 * logged out unexpectedly) and redirects unauthenticated users to /login
 * when they try to access protected routes.
 *
 * Three route categories:
 *   - MACHINE:   /api/n8n/*, /api/webhooks/* — skipped entirely (see below)
 *   - PUBLIC:    /login, /auth/* (callback URLs)
 *   - PROTECTED: everything else
 *
 * Note: we keep the auth check loose here ("is there a session?") and let
 * server components do the deeper role/permission check. That way the
 * middleware stays fast.
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/auth'];

/**
 * Machine-to-machine endpoints. These authenticate themselves — n8n sends the
 * shared secret (`verifyN8nRequest`), providers sign their webhooks — and they
 * arrive with no session cookie. Without this exemption the redirect below
 * bounces them to /login with a 307, so the route handler never runs and the
 * caller sees an HTML redirect instead of its JSON response.
 *
 * Deliberately NOT including `/api/trigger/*`: that direction is admin UI →
 * n8n, called from the browser with a session, so it stays protected.
 */
const MACHINE_PATHS = ['/api/n8n', '/api/webhooks'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Return before touching Supabase — there's no session to refresh, and this
  // runs on every inbound webhook.
  if (MACHINE_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Static assets and Next internals are excluded via the matcher below
  const response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookies: { name: string; value: string; options: CookieOptions }[]) => {
          cookies.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // Refresh the session — Supabase docs warn this MUST run on every request
  // to avoid the user getting silently logged out.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  if (!user && !isPublic) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Already-logged-in users should skip the login page
  if (user && pathname === '/login') {
    const next = request.nextUrl.searchParams.get('next') ?? '/dashboard';
    return NextResponse.redirect(new URL(next, request.url));
  }

  return response;
}

export const config = {
  // Match everything except Next internals and static assets
  matcher: ['/((?!_next/static|_next/image|favicon.ico|brand/|.*\\.svg$|.*\\.png$).*)'],
};
