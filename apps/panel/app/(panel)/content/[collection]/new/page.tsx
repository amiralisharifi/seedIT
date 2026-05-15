import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { CollectionForm } from '@/components/cms/collection-form';
import { collections } from '@/config';
import { createRecord } from '../actions';

export async function generateMetadata({ params }: { params: Promise<{ collection: string }> }) {
  const { collection: slug } = await params;
  const col = collections.find((c) => c.slug === slug);
  return { title: col ? `New ${col.nameSingular}` : 'New' };
}

export default async function NewRecordPage({
  params,
}: {
  params: Promise<{ collection: string }>;
}) {
  const { collection: slug } = await params;
  const collection = collections.find((c) => c.slug === slug);
  if (!collection) notFound();

  const action = createRecord.bind(null, slug);

  return (
    <>
      <PageHeader
        title={`New ${collection.nameSingular}`}
        description={`Create a new ${collection.nameSingular.toLowerCase()} in ${collection.name}.`}
      />
      <div className="p-8 max-w-2xl">
        <CollectionForm collection={collection} record={null} action={action} />
      </div>
    </>
  );
}
