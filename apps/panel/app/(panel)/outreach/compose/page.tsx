import { PageHeader } from '@/components/layout/page-header';
import { queries } from '@seed-panel/db';
import { brand } from '@/config';
import { Composer } from './composer';

export const metadata = { title: 'Compose outreach' };
export const revalidate = 0;

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://seedit.ae').replace(/\/$/, '');

export default async function ComposeOutreachPage({
  searchParams,
}: {
  searchParams: Promise<{ leadId?: string; templateId?: string }>;
}) {
  const params = await searchParams;

  const [leads, templates] = await Promise.all([
    queries.listLeadsForCompose(500),
    queries.listMessageTemplates({ channel: 'whatsapp', activeOnly: true }),
  ]);

  const initialLead = params.leadId
    ? leads.find((l) => l.id === params.leadId) ?? null
    : null;

  // Sender name defaults to legal name from contact settings, else "Amirali"
  let defaultSenderName = 'Amirali';
  try {
    const c = await queries.getSettings('contact');
    const ln = (c.legalName as string) || '';
    if (ln) defaultSenderName = ln.split(/\s+/)[0] ?? defaultSenderName;
  } catch {
    /* ignore */
  }

  return (
    <>
      <PageHeader
        title="Compose"
        description="Pick a lead and a template — preview, copy, open WhatsApp, then log the send."
      />
      <div className="p-8 max-w-6xl">
        <Composer
          leads={leads}
          templates={templates.map((t) => ({
            id: t.id,
            slug: t.slug,
            name: t.name,
            channel: t.channel,
            bodyEn: t.bodyEn,
            bodyAr: t.bodyAr,
            providerTemplateName: t.providerTemplateName,
          }))}
          siteUrl={SITE_URL}
          defaultSenderName={defaultSenderName}
          aisensyConfigured={!!process.env.AISENSY_API_KEY}
          initialLeadId={params.leadId}
          initialTemplateId={params.templateId}
          initialDemo={initialLead?.demo ?? null}
        />
        {brand.business && (
          <p className="mt-8 text-xs text-muted-foreground">
            Public site: <code>{SITE_URL}</code>
          </p>
        )}
      </div>
    </>
  );
}
