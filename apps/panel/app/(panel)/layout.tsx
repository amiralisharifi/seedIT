import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/supabase/server';
import { Sidebar } from '@/components/layout/sidebar';

/**
 * Layout for everything inside (panel) — the auth-gated admin area.
 *
 * Three responsibilities:
 *   1. Fetch the current user (or redirect to login if not signed in)
 *   2. Check the account is active
 *   3. Render the sidebar + content shell
 *
 * Middleware also redirects unauthenticated users to /login. This double-check
 * is intentional belt-and-braces — if middleware misses, we still don't render
 * the admin to anonymous users.
 */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (!user.isActive) {
    redirect('/login?error=account_disabled');
  }

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar user={user} />
      <div className="flex-1 min-w-0 flex flex-col">{children}</div>
    </div>
  );
}
