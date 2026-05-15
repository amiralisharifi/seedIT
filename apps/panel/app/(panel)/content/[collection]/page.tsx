import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { collections } from '@/config';
import { queries } from '@seed-panel/db';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ collection: string }>;
}) {
  const { collection: slug } = await params;
  const collection = collections.find((c) => c.slug === slug);
  return { title: collection?.name ?? 'Collection' };
}

/**
 * Schema-driven collection list page.
 *
 * Lives at /content/<collection> for each collection in config/collections.ts.
 * Reads the collection definition, fetches rows from its DB table, renders
 * them as a table using the collection's `listFields`.
 *
 * This is the proof point that "schema-driven CMS" works. Adding a new
 * collection in config/collections.ts adds a working list page here,
 * no extra code.
 */
export default async function CollectionListPage({
  params,
}: {
  params: Promise<{ collection: string }>;
}) {
  const { collection: slug } = await params;
  const collection = collections.find((c) => c.slug === slug);
  if (!collection) notFound();

  let rows: unknown[] = [];
  let loadError: string | null = null;
  try {
    rows = await queries.listCmsRecords(collection.table, { limit: 50 });
  } catch (e) {
    loadError = e instanceof Error ? e.message : 'Unable to load records';
  }

  return (
    <>
      <PageHeader
        title={collection.name}
        description={'description' in collection ? (collection.description as string | undefined) : undefined}
        actions={
          <button className="h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
            New {collection.nameSingular}
          </button>
        }
      />

      <div className="p-8">
        {loadError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <strong>Couldn&apos;t load:</strong> {loadError}
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-12 text-center max-w-xl mx-auto">
            <h3 className="font-display font-semibold text-lg">No {collection.name.toLowerCase()} yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Create your first {collection.nameSingular.toLowerCase()} to see it here.
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground font-mono">
                <tr>
                  {collection.listFields.map((field) => (
                    <th key={field} className="text-left px-4 py-2.5 font-normal">
                      {field}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(rows as Record<string, unknown>[]).map((row, i) => (
                  <tr key={(row.id as string) ?? i} className="hover:bg-muted/30">
                    {collection.listFields.map((field) => (
                      <td key={field} className="px-4 py-3">
                        {renderCell(row[field])}
                      </td>
                    ))}
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

function renderCell(value: unknown): React.ReactNode {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground">—</span>;
  }
  if (typeof value === 'boolean') return value ? '✓' : '—';
  if (value instanceof Date) return value.toLocaleDateString();
  if (typeof value === 'object') return <span className="text-xs font-mono">{'{…}'}</span>;
  return String(value);
}
