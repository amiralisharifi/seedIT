import { PageHeader } from '@/components/layout/page-header';
import { queries } from '@seed-panel/db';
import { getCurrentUser } from '@/lib/supabase/server';
import { brand } from '@/config';

export const metadata = { title: 'Dashboard' };

/**
 * Dashboard — the home screen after login.
 *
 * Right now it shows the basic "what happened today" metrics. We'll iterate
 * on this as we use the panel ourselves and learn what we actually care
 * about at a glance.
 */
const ZERO_METRICS = { newLeads: 0, demosGenerated: 0, outreachSent: 0, replies: 0 };

export default async function DashboardPage() {
  const user = await getCurrentUser();

  let today = ZERO_METRICS;
  let week = ZERO_METRICS;
  let dbError: string | null = null;

  try {
    [today, week] = await Promise.all([queries.getDailyMetrics(1), queries.getDailyMetrics(7)]);
  } catch (e) {
    dbError = e instanceof Error ? e.message : 'Database unavailable';
  }

  const firstName = user?.fullName?.split(' ')[0] ?? user?.email.split('@')[0];

  return (
    <>
      <PageHeader
        title={`Welcome back${firstName ? ', ' + firstName : ''}.`}
        description={`Here's what's happening at ${brand.name} today.`}
      />

      <div className="p-8 space-y-8">
        {dbError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <strong>Database unreachable:</strong> {dbError}. Check that <code>DATABASE_URL</code> is set in Vercel environment variables.
          </div>
        )}
        {/* Today's metrics */}
        <section>
          <div className="mb-3 text-xs uppercase tracking-wider text-muted-foreground font-mono">
            Last 24 hours
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Metric label="New leads" value={today.newLeads} />
            <Metric label="Demos generated" value={today.demosGenerated} />
            <Metric label="Outreach sent" value={today.outreachSent} />
            <Metric label="Replies" value={today.replies} highlight />
          </div>
        </section>

        {/* Last 7 days */}
        <section>
          <div className="mb-3 text-xs uppercase tracking-wider text-muted-foreground font-mono">
            Last 7 days
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Metric label="New leads" value={week.newLeads} />
            <Metric label="Demos generated" value={week.demosGenerated} />
            <Metric label="Outreach sent" value={week.outreachSent} />
            <Metric label="Replies" value={week.replies} highlight />
          </div>
        </section>

        {/* Empty state hint until we have a real activity feed */}
        <section className="rounded-lg border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Activity feed will appear here once outreach starts flowing through the panel.
          </p>
        </section>
      </div>
    </>
  );
}

function Metric({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <div className="text-xs text-muted-foreground font-mono uppercase tracking-wide">{label}</div>
      <div
        className={
          'mt-1 text-3xl font-display font-semibold ' +
          (highlight ? 'text-primary' : 'text-foreground')
        }
      >
        {value}
      </div>
    </div>
  );
}
