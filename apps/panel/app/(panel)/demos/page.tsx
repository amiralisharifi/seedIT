import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { queries } from '@seed-panel/db';

export const metadata = { title: 'Demos' };
export const revalidate = 0;

export default async function DemosPage() {
  let rows: Awaited<ReturnType<typeof queries.listDemos>> = [];
  let loadError: string | null = null;
  try {
    rows = await queries.listDemos(200);
  } catch (e) {
    loadError = e instanceof Error ? e.message : String(e);
  }

  return (
    <>
      <PageHeader
        title="Demos"
        description="Salon demo previews — public URL: seedit.ae/d/<slug>"
        actions={
          <Link
            href="/demos/new"
            className="h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 flex items-center"
          >
            + New demo
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
            <h3 className="font-semibold text-lg">No demos yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Pick a business, fill in the salon&apos;s services, and ship a personalized preview in
              under five minutes.
            </p>
            <Link
              href="/demos/new"
              className="mt-6 inline-flex h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 items-center"
            >
              Create your first demo
            </Link>
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground font-mono">
                <tr>
                  <th className="text-left px-4 py-2.5 font-normal">Business</th>
                  <th className="text-left px-4 py-2.5 font-normal">Area</th>
                  <th className="text-left px-4 py-2.5 font-normal">Slug</th>
                  <th className="text-left px-4 py-2.5 font-normal">Status</th>
                  <th className="text-right px-4 py-2.5 font-normal">Views</th>
                  <th className="text-left px-4 py-2.5 font-normal">Last viewed</th>
                  <th className="text-left px-4 py-2.5 font-normal">Created</th>
                  <th className="text-left px-4 py-2.5 font-normal"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <Link href={`/demos/${row.id}`} className="font-medium hover:underline">
                        {row.businessName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{row.businessAreaZone ?? '—'}</td>
                    <td className="px-4 py-3">
                      <a
                        href={`https://seedit.ae/d/${row.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline font-mono text-xs"
                      >
                        /d/{row.slug}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-muted text-foreground/80 font-mono">
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs">{row.viewCount}</td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs whitespace-nowrap">
                      {row.lastViewedAt
                        ? new Date(row.lastViewedAt).toLocaleDateString('en-AE', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs whitespace-nowrap">
                      {new Date(row.createdAt).toLocaleDateString('en-AE', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/demos/${row.id}`}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Edit →
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
