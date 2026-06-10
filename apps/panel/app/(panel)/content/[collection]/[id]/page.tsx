import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { CollectionForm } from '@/components/cms/collection-form';
import { collections } from '@/config';
import { queries } from '@seed-panel/db';
import { updateRecord } from '../actions';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ collection: string; id: string }>;
}) {
  const { collection: slug } = await params;
  const col = collections.find((c) => c.slug === slug);
  return { title: col ? `Edit ${col.nameSingular}` : 'Edit' };
}

export default async function EditRecordPage({
  params,
}: {
  params: Promise<{ collection: string; id: string }>;
}) {
  const { collection: slug, id } = await params;
  const collection = collections.find((c) => c.slug === slug);
  if (!collection) notFound();

  let record: Record<string, unknown> | null = null;
  try {
    record = (await queries.getCmsRecordById(collection.table, id)) as Record<string, unknown> | null;
  } catch {
    notFound();
  }
  if (!record) notFound();

  const action = updateRecord.bind(null, slug, id);
  const columns = queries.getCmsColumnNames(collection.table);

  // Use the title field value as the page title
  const titleVal =
    (record[collection.titleField] as string | undefined) ??
    ((record.content as Record<string, Record<string, unknown>> | undefined)?.en?.[
      collection.titleField
    ] as string | undefined) ??
    id;

  return (
    <>
      <PageHeader
        title={`Edit: ${titleVal}`}
        description={`${collection.nameSingular} · ${id.slice(0, 8)}…`}
      />
      <div className="p-8 max-w-2xl">
        <CollectionForm collection={collection} record={record} action={action} columns={columns} />
      </div>
    </>
  );
}
