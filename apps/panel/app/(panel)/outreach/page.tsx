import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { queries } from '@seed-panel/db';

export const metadata = { title: 'Outreach' };
export const revalidate = 0;

const STATUS_BADGE: Record<string, string> = {
  queued: 'bg-muted text-foreground/80',
  sent: 'bg-blue-100 text-blue-800',
  delivered: 'bg-blue-100 text-blue-800',
  read: 'bg-purple-100 text-purple-800',
  replied: 'bg-emerald-100 text-emerald-800',
  failed: 'bg-red-100 text-red-800',
  bounced: 'bg-red-100 text-red-800',
};

const CHANNEL_ICON: Record<string, string> = {
  whatsapp: '💬',
  email: '✉️',
  instagram_dm: '📷',
  phone_call: '📞',
  in_person: '🤝',
};

export default async function OutreachPage() {
  let rows: Awaited<ReturnType<typeof queries.listOutreach>> = [];
  let loadError: string | null = null;
  try {
    rows = await queries.listOutreach(200);
  } catch (e) {
    loadError = e instanceof Error ? e.message : String(e);
  }

  return (
    <>
      <PageHeader
        title="Outreach"
        description="Every send that's been logged — manual or automated."
        actions={
          <Link
            href="/outreach/compose"
            className="h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 flex items-center"
          >
            + Compose
          </Link>
        }
      />

      <div className="p-8">
        {loadError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {loadError}
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-12 text-center max-w-xl mx-auto">
            <h3 className="font-semibold text-lg">No outreach yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Compose your first WhatsApp message — pick a lead, a template, send via WhatsApp Web,
              then mark as sent here for the dashboard to count it.
            </p>
            <Link
              href="/outreach/compose"
              className="mt-6 inline-flex h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 items-center"
            >
              Compose first outreach
            </Link>
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground font-mono">
                <tr>
                  <th className="text-left px-4 py-2.5 font-normal w-8"></th>
                  <th className="text-left px-4 py-2.5 font-normal">Lead</th>
                  <th className="text-left px-4 py-2.5 font-normal">Status</th>
                  <th className="text-left px-4 py-2.5 font-normal">Message preview</th>
                  <th className="text-left px-4 py-2.5 font-normal">Sent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((row) => (
                  <tr key={row.id} className={row.repliedAt ? 'bg-emerald-50/50' : 'hover:bg-muted/30'}>
                    <td className="px-4 py-3 text-base">{CHANNEL_ICON[row.channel] ?? '•'}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{row.businessName}</div>
                      {row.businessAreaZone && (
                        <div className="text-xs text-muted-foreground">{row.businessAreaZone}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono ${STATUS_BADGE[row.status] ?? 'bg-muted text-foreground/80'}`}
                      >
                        {row.status}
                      </span>
                      {row.repliedAt && (
                        <div className="text-xs text-emerald-700 mt-1 font-mono">
                          replied {new Date(row.repliedAt).toLocaleDateString('en-AE', { day: 'numeric', month: 'short' })}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground max-w-md">
                      <div className="line-clamp-2 text-sm">
                        {row.renderedBody?.slice(0, 200) ?? '—'}
                      </div>
                      {row.demoSlug && (
                        <a
                          href={`https://seedit.ae/d/${row.demoSlug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-primary hover:underline font-mono mt-1 inline-block"
                        >
                          /d/{row.demoSlug} →
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs whitespace-nowrap">
                      {row.sentAt
                        ? new Date(row.sentAt).toLocaleDateString('en-AE', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '—'}
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
