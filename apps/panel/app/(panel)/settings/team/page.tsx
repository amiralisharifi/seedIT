import { PageHeader } from '@/components/layout/page-header';
import { getCurrentUser } from '@/lib/supabase/server';
import { queries } from '@seed-panel/db';

export const metadata = { title: 'Team' };
export const revalidate = 0;

const SUPABASE_PROJECT_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
// Derive the project ref from the URL so we can deep-link to the right dashboard
const supabaseProjectRef = SUPABASE_PROJECT_URL.match(/https?:\/\/([^.]+)\./)?.[1];
const supabaseInviteUrl = supabaseProjectRef
  ? `https://supabase.com/dashboard/project/${supabaseProjectRef}/auth/users`
  : 'https://supabase.com/dashboard';

export default async function TeamPage() {
  const current = await getCurrentUser();
  let members: Awaited<ReturnType<typeof queries.listUsers>> = [];
  let loadError: string | null = null;
  try {
    members = await queries.listUsers();
  } catch (e) {
    loadError = e instanceof Error ? e.message : String(e);
  }

  return (
    <>
      <PageHeader
        title="Team"
        description="Everyone with admin access to this panel."
        actions={
          <a
            href={supabaseInviteUrl}
            target="_blank"
            rel="noreferrer"
            className="h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 flex items-center gap-1"
          >
            Invite via Supabase
            <span>↗</span>
          </a>
        }
      />

      <div className="p-8 max-w-3xl space-y-6">
        {loadError && (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {loadError}
          </div>
        )}

        <div className="rounded-md border border-border bg-muted/30 p-4 text-sm">
          <p className="font-medium mb-1">How invites work</p>
          <p className="text-muted-foreground">
            Auth runs through Supabase magic links. To add a teammate:
          </p>
          <ol className="text-muted-foreground list-decimal list-inside mt-2 space-y-1">
            <li>
              Open{' '}
              <a
                href={supabaseInviteUrl}
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline"
              >
                Supabase → Authentication → Users
              </a>
            </li>
            <li>Click <em>Invite user</em> and enter their email</li>
            <li>They click the magic link from their inbox</li>
            <li>
              First sign-in creates their <code className="font-mono text-xs">users</code> row here
              automatically (defaulting to role <code className="font-mono text-xs">admin</code>)
            </li>
          </ol>
        </div>

        {members.length === 0 && !loadError ? (
          <div className="rounded-lg border border-dashed border-border p-12 text-center">
            <p className="text-sm text-muted-foreground">
              No team members yet. Sign in once to create your row.
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground font-mono">
                <tr>
                  <th className="text-left px-4 py-2.5 font-normal">Member</th>
                  <th className="text-left px-4 py-2.5 font-normal">Role</th>
                  <th className="text-left px-4 py-2.5 font-normal">Status</th>
                  <th className="text-left px-4 py-2.5 font-normal">Last login</th>
                  <th className="text-left px-4 py-2.5 font-normal">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {members.map((m) => {
                  const isYou = current?.id === m.id;
                  return (
                    <tr key={m.id} className={isYou ? 'bg-primary/5' : 'hover:bg-muted/30'}>
                      <td className="px-4 py-3">
                        <div className="font-medium">
                          {m.fullName ?? m.email.split('@')[0]}
                          {isYou && (
                            <span className="ml-2 text-[10px] font-mono uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                              you
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">{m.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-muted text-foreground/80 font-mono">
                          {m.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {m.isActive ? (
                          <span className="text-xs text-emerald-700 font-mono">active</span>
                        ) : (
                          <span className="text-xs text-muted-foreground font-mono">disabled</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground font-mono text-xs whitespace-nowrap">
                        {m.lastLoginAt
                          ? new Date(m.lastLoginAt).toLocaleDateString('en-AE', {
                              day: 'numeric',
                              month: 'short',
                            })
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground font-mono text-xs whitespace-nowrap">
                        {new Date(m.createdAt).toLocaleDateString('en-AE', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          To disable a member or change their role, edit their row in the{' '}
          <code className="font-mono">users</code> table via{' '}
          <code className="font-mono">pnpm db:studio</code> or Supabase SQL Editor. Inline editing
          is coming.
        </p>
      </div>
    </>
  );
}
