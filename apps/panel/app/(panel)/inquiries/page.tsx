import { PageHeader } from '@/components/layout/page-header';
import { queries } from '@seed-panel/db';

export const metadata = { title: 'Inquiries' };

export const revalidate = 0;

export default async function InquiriesPage() {
  let rows: Awaited<ReturnType<typeof queries.listInquiries>> = [];
  let loadError: string | null = null;

  try {
    rows = await queries.listInquiries(100);
  } catch (e) {
    loadError = e instanceof Error ? e.message : String(e);
  }

  return (
    <>
      <PageHeader
        title="Inquiries"
        description="Contact form submissions from the public website."
      />
      <div className="p-8">
        {loadError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {loadError}
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-12 text-center max-w-xl mx-auto">
            <h3 className="font-semibold text-lg">No inquiries yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Submissions from the contact form on seedit.ae will appear here.
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground font-mono">
                <tr>
                  <th className="text-left px-4 py-2.5 font-normal">Name</th>
                  <th className="text-left px-4 py-2.5 font-normal">Email</th>
                  <th className="text-left px-4 py-2.5 font-normal">Phone</th>
                  <th className="text-left px-4 py-2.5 font-normal">Service</th>
                  <th className="text-left px-4 py-2.5 font-normal">Message</th>
                  <th className="text-left px-4 py-2.5 font-normal">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((row) => (
                  <tr key={row.id} className={row.isRead ? 'hover:bg-muted/20' : 'hover:bg-muted/30 font-medium'}>
                    <td className="px-4 py-3 whitespace-nowrap">{row.name}</td>
                    <td className="px-4 py-3">
                      <a href={`mailto:${row.email}`} className="text-primary hover:underline">
                        {row.email}
                      </a>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                      {row.phone ? (
                        <a href={`tel:${row.phone}`}>{row.phone}</a>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{row.service ?? '—'}</td>
                    <td className="px-4 py-3 max-w-xs truncate text-muted-foreground">{row.message ?? '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground font-mono text-xs">
                      {new Date(row.createdAt).toLocaleDateString('en-AE', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                      })}
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
