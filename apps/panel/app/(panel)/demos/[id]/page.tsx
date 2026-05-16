import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { queries } from '@seed-panel/db';
import { DemoForm } from '../demo-form';
import { updateDemoAction } from '../actions';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  try {
    const data = await queries.getDemoById(id);
    return { title: data ? `Edit demo · ${data.business.name}` : 'Edit demo' };
  } catch {
    return { title: 'Edit demo' };
  }
}

export default async function EditDemoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let data: Awaited<ReturnType<typeof queries.getDemoById>> = null;
  try {
    data = await queries.getDemoById(id);
  } catch {
    notFound();
  }
  if (!data) notFound();

  // Pass an empty businesses list — the form locks the business field in edit mode
  const businesses = [
    {
      id: data.business.id,
      name: data.business.name,
      areaZone: data.business.areaZone,
      category: data.business.category,
    },
  ];

  const action = updateDemoAction.bind(null, id);

  return (
    <>
      <PageHeader
        title={`Edit: ${data.business.name}`}
        description={`/d/${data.demo.slug} · ${data.demo.viewCount} views`}
      />
      <div className="p-8 max-w-3xl">
        <DemoForm
          mode="edit"
          businesses={businesses}
          initial={{
            businessId: data.business.id,
            slug: data.demo.slug,
            status: data.demo.status,
            internalNotes: data.demo.internalNotes ?? undefined,
            content: data.demo.content as Record<string, unknown>,
          }}
          action={action}
        />
      </div>
    </>
  );
}
