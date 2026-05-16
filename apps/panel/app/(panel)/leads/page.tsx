import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { queries } from '@seed-panel/db';

export const metadata = { title: 'Leads' };
export const revalidate = 0;

/**
 * Leads — the heart of the CRM side. This stub renders a basic table so we
 * can verify the database wiring end-to-end. The real version (filters,
 * search, bulk actions, detail drawer) is built next.
 */
export default async function LeadsPage() {
  const leads = await queries.findLeads({ limit: 50, orderBy: 'score_desc' });

  return (
    <>
      <PageHeader
        title="Leads"
        description="Businesses scraped via Apify or added manually — ready for outreach."
        actions={
          <Link
            href="/leads/new"
            className="h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 flex items-center"
          >
            + New lead
          </Link>
        }
      />

      <div className="p-8">
        {leads.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground font-mono">
                <tr>
                  <th className="text-left px-4 py-2.5 font-normal">Business</th>
                  <th className="text-left px-4 py-2.5 font-normal">Area</th>
                  <th className="text-left px-4 py-2.5 font-normal">Category</th>
                  <th className="text-left px-4 py-2.5 font-normal">Score</th>
                  <th className="text-left px-4 py-2.5 font-normal">Status</th>
                  <th className="text-right px-4 py-2.5 font-normal"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{lead.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{lead.areaZone ?? '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{lead.category}</td>
                    <td className="px-4 py-3">
                      {lead.leadScore !== null ? (
                        <span className="font-mono text-xs">{lead.leadScore}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-muted text-foreground/80 font-mono">
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <Link
                        href={`/outreach/compose?leadId=${lead.id}`}
                        className="text-xs text-primary hover:underline"
                      >
                        Compose →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-border p-12 text-center max-w-xl mx-auto">
      <h3 className="font-display font-semibold text-lg">No leads yet</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Add a business manually to get started — Apify scrape jobs will populate this
        automatically once the n8n pipeline is wired up.
      </p>
      <Link
        href="/leads/new"
        className="mt-6 inline-flex h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 items-center"
      >
        Add a lead manually
      </Link>
    </div>
  );
}
