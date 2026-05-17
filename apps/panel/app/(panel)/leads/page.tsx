import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { queries } from '@seed-panel/db';
import type { Business } from '@seed-panel/db';

export const metadata = { title: 'Leads' };
export const revalidate = 0;

const CATEGORIES: Array<{ value: Business['category']; label: string }> = [
  { value: 'salon_ladies', label: "Salon — ladies'" },
  { value: 'salon_mens_barber', label: "Salon — men's barber" },
  { value: 'salon_premium', label: 'Salon — premium' },
  { value: 'salon_hammam_spa', label: 'Salon / Hammam / Spa' },
  { value: 'salon_brow_lash', label: 'Brow / lash / nail' },
  { value: 'salon_mobile', label: 'Mobile salon' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'clinic_dental', label: 'Clinic — dental' },
  { value: 'clinic_general', label: 'Clinic — general' },
  { value: 'other', label: 'Other' },
];

const STATUSES: Array<{ value: Business['status']; label: string }> = [
  { value: 'new', label: 'New' },
  { value: 'enriched', label: 'Enriched' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'demo_ready', label: 'Demo ready' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'replied', label: 'Replied' },
  { value: 'in_conversation', label: 'In conversation' },
  { value: 'meeting_booked', label: 'Meeting booked' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
];

const EMIRATES: Array<{ value: Business['emirate']; label: string }> = [
  { value: 'dubai', label: 'Dubai' },
  { value: 'abu_dhabi', label: 'Abu Dhabi' },
  { value: 'sharjah', label: 'Sharjah' },
  { value: 'ajman', label: 'Ajman' },
];

type SP = {
  category?: string;
  areaZone?: string;
  emirate?: string;
  status?: string;
  hasWebsite?: string;
  q?: string;
};

function buildFilter(sp: SP) {
  return {
    category: (sp.category || undefined) as Business['category'] | undefined,
    areaZone: sp.areaZone || undefined,
    emirate: (sp.emirate || undefined) as Business['emirate'] | undefined,
    status: (sp.status || undefined) as Business['status'] | undefined,
    hasWebsite:
      sp.hasWebsite === 'true'
        ? true
        : sp.hasWebsite === 'false'
          ? false
          : undefined,
    search: sp.q || undefined,
  };
}

function toQueryString(sp: SP, extra: Partial<SP> = {}): string {
  const merged = { ...sp, ...extra };
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) {
    if (v && v.length > 0) usp.set(k, v);
  }
  return usp.toString();
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const filter = buildFilter(sp);
  const filtersActive = Object.values(filter).some((v) => v !== undefined);

  let leads: Awaited<ReturnType<typeof queries.findLeads>> = [];
  let loadError: string | null = null;
  try {
    leads = await queries.findLeads({ ...filter, limit: 500, orderBy: 'created_desc' });
  } catch (e) {
    loadError = e instanceof Error ? e.message : String(e);
  }

  const exportQs = toQueryString(sp);
  const exportHref = `/api/leads/export${exportQs ? `?${exportQs}` : ''}`;

  return (
    <>
      <PageHeader
        title="Leads"
        description="Businesses scraped via Apify or added manually — ready for outreach."
        actions={
          <div className="flex items-center gap-2">
            <a
              href={exportHref}
              className="h-9 px-3 rounded-md border border-border text-sm font-medium hover:bg-muted flex items-center gap-1.5"
            >
              <span>↓</span> Export XLSX
            </a>
            <Link
              href="/leads/new"
              className="h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 flex items-center"
            >
              + New lead
            </Link>
          </div>
        }
      />

      <div className="p-8 space-y-5">
        {/* Filter bar — server-side GET form (no JS needed) */}
        <form method="get" className="rounded-lg border border-border p-4 bg-muted/20">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            <div className="md:col-span-2">
              <label htmlFor="q" className="block text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1">Search</label>
              <input
                id="q"
                name="q"
                type="text"
                defaultValue={sp.q ?? ''}
                placeholder="name or area"
                className="w-full h-9 px-3 rounded-md border border-border bg-background text-sm"
              />
            </div>
            <div>
              <label htmlFor="category" className="block text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1">Category</label>
              <select id="category" name="category" defaultValue={sp.category ?? ''} className="w-full h-9 px-2 rounded-md border border-border bg-background text-sm">
                <option value="">All</option>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="emirate" className="block text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1">Emirate</label>
              <select id="emirate" name="emirate" defaultValue={sp.emirate ?? ''} className="w-full h-9 px-2 rounded-md border border-border bg-background text-sm">
                <option value="">All</option>
                {EMIRATES.map((e) => (
                  <option key={e.value} value={e.value}>{e.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="areaZone" className="block text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1">Area</label>
              <input id="areaZone" name="areaZone" type="text" defaultValue={sp.areaZone ?? ''} placeholder="e.g. Karama" className="w-full h-9 px-3 rounded-md border border-border bg-background text-sm" />
            </div>
            <div>
              <label htmlFor="status" className="block text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1">Status</label>
              <select id="status" name="status" defaultValue={sp.status ?? ''} className="w-full h-9 px-2 rounded-md border border-border bg-background text-sm">
                <option value="">All</option>
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <label className="text-xs font-mono text-muted-foreground flex items-center gap-2">
              Website:
              <select name="hasWebsite" defaultValue={sp.hasWebsite ?? ''} className="h-8 px-2 rounded border border-border bg-background text-xs">
                <option value="">Any</option>
                <option value="false">No website (best buying signal)</option>
                <option value="true">Has a website</option>
              </select>
            </label>
            <div className="flex-1" />
            {filtersActive && (
              <Link href="/leads" className="text-xs text-muted-foreground hover:text-foreground">
                Clear filters
              </Link>
            )}
            <button
              type="submit"
              className="h-8 px-3 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90"
            >
              Apply filters
            </button>
          </div>
        </form>

        {loadError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {loadError}
          </div>
        ) : leads.length === 0 ? (
          filtersActive ? (
            <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No leads match these filters.{' '}
              <Link href="/leads" className="underline">Clear filters</Link>
            </div>
          ) : (
            <EmptyState />
          )
        ) : (
          <>
            <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
              <span>
                {leads.length} lead{leads.length === 1 ? '' : 's'}
                {filtersActive && ' matching filters'}
              </span>
            </div>

            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground font-mono">
                  <tr>
                    <th className="text-left px-4 py-2.5 font-normal">Business</th>
                    <th className="text-left px-4 py-2.5 font-normal">Area</th>
                    <th className="text-left px-4 py-2.5 font-normal">Category</th>
                    <th className="text-left px-4 py-2.5 font-normal">Phone</th>
                    <th className="text-left px-4 py-2.5 font-normal">Web</th>
                    <th className="text-left px-4 py-2.5 font-normal">Rating</th>
                    <th className="text-left px-4 py-2.5 font-normal">Status</th>
                    <th className="text-right px-4 py-2.5 font-normal"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {leads.map((lead) => (
                    <tr key={lead.id} className={!lead.hasWebsite ? 'bg-amber-50/40 hover:bg-amber-50/70' : 'hover:bg-muted/30'}>
                      <td className="px-4 py-3">
                        <div className="font-medium">{lead.name}</div>
                        {lead.address && (
                          <div className="text-xs text-muted-foreground line-clamp-1 max-w-xs">
                            {lead.address}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{lead.areaZone ?? '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{lead.category.replace('_', ' ')}</td>
                      <td className="px-4 py-3 font-mono text-xs">
                        {lead.phone ? (
                          <a href={`tel:${lead.phone.replace(/\s/g, '')}`} className="hover:underline">
                            {lead.phone}
                          </a>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {lead.hasWebsite ? (
                          <a href={lead.websiteUrl ?? '#'} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                            yes
                          </a>
                        ) : (
                          <span className="text-amber-700 font-medium">no</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {lead.googleRating != null ? (
                          <>
                            {lead.googleRating.toFixed(1)}
                            <span className="text-muted-foreground/60"> ({lead.googleReviewCount ?? 0})</span>
                          </>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-muted text-foreground/80 font-mono">
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <Link
                          href={`/outreach/compose?leadId=${lead.id}`}
                          className="text-xs text-primary hover:underline"
                        >
                          Compose →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-muted-foreground">
              Amber-highlighted rows have no website — your strongest buying signal. The XLSX
              export carries the same highlighting and includes Maps / WhatsApp / email
              hyperlinks for cold-approach.
            </p>
          </>
        )}
      </div>
    </>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-border p-12 text-center max-w-xl mx-auto">
      <h3 className="font-display font-semibold text-lg">No leads yet</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Run a Google Maps scrape or add a business manually.
      </p>
      <div className="mt-6 flex items-center justify-center gap-3">
        <Link
          href="/scrape"
          className="inline-flex h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 items-center"
        >
          Run a scrape
        </Link>
        <Link
          href="/leads/new"
          className="inline-flex h-9 px-4 rounded-md border border-border text-sm font-medium hover:bg-muted items-center"
        >
          Add manually
        </Link>
      </div>
    </div>
  );
}
