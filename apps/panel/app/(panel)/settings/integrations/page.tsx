import { PageHeader } from '@/components/layout/page-header';
import { queries } from '@seed-panel/db';
import { IntegrationsForm } from './integrations-form';
import { saveIntegrationsSettings } from './actions';

export const metadata = { title: 'Integrations' };

export default async function IntegrationsPage() {
  let analytics: Record<string, unknown> = {};
  let seoDefaults: Record<string, unknown> = {};

  try {
    analytics = await queries.getSettings('analytics');
    seoDefaults = await queries.getSettings('seo_defaults');
  } catch {
    // DB unreachable — start with empty defaults
  }

  return (
    <>
      <PageHeader
        title="Integrations"
        description="Analytics, webmaster verification, and SEO defaults injected into the public site."
      />
      <div className="p-8 max-w-2xl">
        <IntegrationsForm
          initial={analytics}
          seoDefaults={seoDefaults}
          action={saveIntegrationsSettings}
        />
      </div>
    </>
  );
}
