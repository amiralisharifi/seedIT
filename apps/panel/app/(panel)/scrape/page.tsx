import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { queries } from '@seed-panel/db';
import { ScrapeForm } from './scrape-form';
import { RecheckButton } from './recheck-button';

export const metadata = { title: 'Scrape' };
export const revalidate = 0;
// Server actions need the full Pro 300s window
export const maxDuration = 300;

const STATUS_BADGE: Record<string, string> = {
  queued: 'bg-muted text-foreground/80',
  running: 'bg-blue-100 text-blue-800',
  succeeded: 'bg-emerald-100 text-emerald-800',
  failed: 'bg-red-100 text-red-800',
  timed_out: 'bg-amber-100 text-amber-800',
  queue_stuck: 'bg-amber-100 text-amber-800',
  awaiting_apify: 'bg-amber-100 text-amber-800',
};

/** Find an Apify run URL inside an error message and render it as a link. */
function linkifyRunUrl(text: string): React.ReactNode {
  const match = text.match(/(https:\/\/console\.apify\.com\/[^\s]+)/);
  const url = match?.[1];
  if (!url) return text;
  const [before, after] = text.split(url);
  return (
    <>
      {before}
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="underline text-primary"
      >
        Open in Apify ↗
      </a>
      {after}
    </>
  );
}

export default async function ScrapePage() {
  const apifyConfigured = !!process.env.APIFY_TOKEN;
  let jobs: Awaited<ReturnType<typeof queries.listScrapeJobs>> = [];
  try {
    jobs = await queries.listScrapeJobs(20);
  } catch {
    // table missing or DB down — silent
  }

  return (
    <>
      <PageHeader
        title="Scrape"
        description="Pull leads from Google Maps via Apify — straight into the leads table."
      />

      <div className="p-8 max-w-3xl space-y-8">
        {!apifyConfigured && (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <strong>APIFY_TOKEN is not set.</strong> Add it in Vercel → Settings → Environment
            Variables and redeploy before running a scrape.
          </div>
        )}

        <ScrapeForm />

        {jobs.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Recent jobs
              </span>
              <div className="flex-1 border-t border-border" />
            </div>
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground font-mono">
                  <tr>
                    <th className="text-left px-4 py-2.5 font-normal">Queries</th>
                    <th className="text-left px-4 py-2.5 font-normal">Status</th>
                    <th className="text-right px-4 py-2.5 font-normal">Results</th>
                    <th className="text-right px-4 py-2.5 font-normal">New leads</th>
                    <th className="text-left px-4 py-2.5 font-normal">When</th>
                    <th className="text-right px-4 py-2.5 font-normal"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {jobs.map((j) => (
                    <tr key={j.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 text-muted-foreground max-w-sm">
                        <div className="line-clamp-2 text-xs font-mono">
                          {(j.queries as unknown as string[]).join(' · ')}
                        </div>
                        {j.errorMessage && (
                          <div className="text-xs text-red-600 mt-1">
                            {linkifyRunUrl(j.errorMessage)}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-xs font-mono ${STATUS_BADGE[j.status] ?? 'bg-muted text-foreground/80'}`}
                        >
                          {j.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-xs">{j.resultsCount}</td>
                      <td className="px-4 py-3 text-right font-mono text-xs">
                        {j.newLeadsCount > 0 ? (
                          <Link href="/leads" className="text-emerald-700 hover:underline">
                            +{j.newLeadsCount}
                          </Link>
                        ) : (
                          j.newLeadsCount
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground font-mono text-xs whitespace-nowrap">
                        {new Date(j.createdAt).toLocaleString('en-AE', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {j.apifyRunId &&
                          j.status !== 'succeeded' &&
                          j.status !== 'queued' && <RecheckButton jobId={j.id} />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
