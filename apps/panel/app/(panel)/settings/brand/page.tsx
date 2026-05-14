import { PageHeader } from '@/components/layout/page-header';
import { brand } from '@/config';

export const metadata = { title: 'Brand' };

/**
 * Brand settings — for now, a read-only view of config/brand.ts.
 *
 * Future versions will make this editable through the UI and persist to the
 * database (so a clone deployed once doesn't require redeploys to change
 * branding). For v0.1, editing is "edit the file and redeploy" — appropriate
 * for the single SEED IT deployment.
 */
export default function BrandSettingsPage() {
  return (
    <>
      <PageHeader
        title="Brand"
        description="The visual identity of this deployment. Edit config/brand.ts to change."
      />

      <div className="p-8 space-y-8 max-w-3xl">
        <Section title="Identity">
          <Field label="Name" value={brand.name} />
          <Field label="Short name" value={brand.shortName} />
          <Field label="Tagline" value={brand.tagline} />
          {brand.taglineAr && <Field label="Tagline (Arabic)" value={brand.taglineAr} />}
        </Section>

        <Section title="Colors">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <ColorSwatch label="Primary" hsl={brand.colors.primary} />
            <ColorSwatch label="Accent" hsl={brand.colors.accent} />
            <ColorSwatch label="Sidebar" hsl={brand.colors.sidebar} />
            <ColorSwatch label="Sidebar border" hsl={brand.colors.sidebarBorder} />
          </div>
        </Section>

        <Section title="Typography">
          <Field label="Sans (body)" value={brand.fonts.sans} mono />
          <Field label="Display (headings)" value={brand.fonts.display} mono />
          <Field label="Arabic" value={brand.fonts.arabic} mono />
          <Field label="Mono (code)" value={brand.fonts.mono} mono />
        </Section>

        <Section title="Business">
          <Field label="Legal name" value={brand.business.legalName} />
          <Field label="Address" value={brand.business.address} />
          <Field label="Support email" value={brand.business.supportEmail} mono />
          <Field label="Phone" value={brand.business.phone} mono />
          <Field label="WhatsApp" value={brand.business.whatsapp} mono />
        </Section>
      </div>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-mono mb-3">
        {title}
      </h2>
      <div className="rounded-lg border border-border bg-background p-4 space-y-3">{children}</div>
    </section>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline gap-4">
      <div className="w-40 text-xs text-muted-foreground">{label}</div>
      <div className={mono ? 'font-mono text-sm' : 'text-sm'}>{value}</div>
    </div>
  );
}

function ColorSwatch({ label, hsl }: { label: string; hsl: string }) {
  return (
    <div className="rounded-md border border-border overflow-hidden">
      <div className="h-16" style={{ backgroundColor: `hsl(${hsl})` }} />
      <div className="px-2 py-1.5 text-xs">
        <div className="font-medium">{label}</div>
        <div className="font-mono text-[10px] text-muted-foreground">{hsl}</div>
      </div>
    </div>
  );
}
