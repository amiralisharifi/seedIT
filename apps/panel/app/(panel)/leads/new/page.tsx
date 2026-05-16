import { PageHeader } from '@/components/layout/page-header';
import { LeadForm } from './lead-form';
import { createLeadAction } from './actions';

export const metadata = { title: 'New Lead' };

export default function NewLeadPage() {
  return (
    <>
      <PageHeader
        title="New lead"
        description="Add a business manually — paste from Google Maps or type the details."
      />
      <div className="p-8 max-w-2xl">
        <LeadForm action={createLeadAction} />
      </div>
    </>
  );
}
