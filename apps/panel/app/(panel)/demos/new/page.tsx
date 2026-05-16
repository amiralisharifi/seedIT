import { PageHeader } from '@/components/layout/page-header';
import { queries } from '@seed-panel/db';
import { DemoForm } from '../demo-form';
import { createDemoAction } from '../actions';

export const metadata = { title: 'New Demo' };

export default async function NewDemoPage() {
  const businesses = await queries.listBusinessesForPicker();

  return (
    <>
      <PageHeader
        title="New demo"
        description="Generate a salon preview at seedit.ae/d/<slug>"
      />
      <div className="p-8 max-w-3xl">
        <DemoForm
          mode="create"
          businesses={businesses}
          initial={{}}
          action={createDemoAction}
        />
      </div>
    </>
  );
}
