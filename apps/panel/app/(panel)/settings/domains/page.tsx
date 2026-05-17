import { PageHeader } from '@/components/layout/page-header';
import { integrations } from '@/config';

export const metadata = { title: 'Domains' };
export const revalidate = 60;

type Reach =
  | { ok: true; status: number; ms: number }
  | { ok: false; error: string };

async function checkReachable(url: string): Promise<Reach> {
  const started = Date.now();
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      cache: 'no-store',
      // 5s budget per check so the page stays snappy
      signal: AbortSignal.timeout(5000),
      redirect: 'follow',
    });
    return { ok: true, status: res.status, ms: Date.now() - started };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

function statusBadge(r: Reach) {
  if (r.ok && r.status < 400) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-emerald-100 text-emerald-800 font-mono">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        {r.status} · {r.ms}ms
      </span>
    );
  }
  if (r.ok) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-amber-100 text-amber-800 font-mono">
        {r.status}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-red-100 text-red-800 font-mono">
      <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
      unreachable
    </span>
  );
}

function originOf(url: string): string {
  try {
    return new URL(url).origin;
  } catch {
    return url;
  }
}

export default async function DomainsPage() {
  // Sources of truth for what domains exist:
  // - NEXT_PUBLIC_SITE_URL (public marketing site, used by web app)
  // - NEXT_PUBLIC_APP_URL  (admin panel itself, optional)
  // - integrations.resend.domain     (where outbound email sends from)
  // - integrations.plausible.domain  (which domain Plausible tracks)
  const publicSite =
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://seedit.ae';
  const adminPanel =
    process.env.NEXT_PUBLIC_APP_URL ?? 'https://admin.seedit.ae';
  const emailDomain = integrations.resend.enabled
    ? `https://${integrations.resend.domain}`
    : null;
  const plausibleDomain = integrations.plausible.enabled
    ? `https://${integrations.plausible.domain}`
    : null;
  const n8nBaseUrl = integrations.n8n.enabled ? integrations.n8n.baseUrl : null;

  const checks = await Promise.all([
    checkReachable(publicSite),
    checkReachable(adminPanel),
    emailDomain ? checkReachable(emailDomain) : Promise.resolve(null),
    plausibleDomain ? checkReachable(plausibleDomain) : Promise.resolve(null),
    n8nBaseUrl ? checkReachable(originOf(n8nBaseUrl)) : Promise.resolve(null),
  ]);

  const [siteR, adminR, emailR, plausibleR, n8nR] = checks;

  const rows: Array<{
    label: string;
    url: string;
    note: string;
    check: Reach | null;
  }> = [
    {
      label: 'Public site',
      url: publicSite,
      note: 'Marketing site readers land here. SEO + blog posts live here.',
      check: siteR,
    },
    {
      label: 'Admin panel',
      url: adminPanel,
      note: 'This UI. Behind magic-link auth.',
      check: adminR,
    },
    ...(emailDomain
      ? [
          {
            label: 'Email sender',
            url: emailDomain,
            note: 'Resend sends from this domain — DNS must be verified in Resend dashboard.',
            check: emailR,
          },
        ]
      : []),
    ...(plausibleDomain
      ? [
          {
            label: 'Analytics',
            url: plausibleDomain,
            note: 'Plausible host.',
            check: plausibleR,
          },
        ]
      : []),
    ...(n8nBaseUrl
      ? [
          {
            label: 'n8n workflows',
            url: originOf(n8nBaseUrl),
            note: 'Self-hosted n8n that runs scrape / outreach / digest pipelines.',
            check: n8nR,
          },
        ]
      : []),
  ];

  return (
    <>
      <PageHeader
        title="Domains"
        description="Where each piece of the stack lives — and whether it's reachable right now."
      />

      <div className="p-8 max-w-3xl space-y-6">
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground font-mono">
              <tr>
                <th className="text-left px-4 py-2.5 font-normal">What</th>
                <th className="text-left px-4 py-2.5 font-normal">Where</th>
                <th className="text-left px-4 py-2.5 font-normal">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => (
                <tr key={row.url} className="hover:bg-muted/30">
                  <td className="px-4 py-3 align-top">
                    <div className="font-medium">{row.label}</div>
                    <div className="text-xs text-muted-foreground max-w-xs mt-0.5">{row.note}</div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <a
                      href={row.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline font-mono text-xs"
                    >
                      {row.url.replace(/^https?:\/\//, '')}
                    </a>
                  </td>
                  <td className="px-4 py-3 align-top">
                    {row.check ? statusBadge(row.check) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-md border border-border bg-muted/30 px-4 py-3 text-sm space-y-2">
          <p className="font-medium">Where to actually change a domain</p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            <li>
              <strong>Add / change a domain on Vercel:</strong>{' '}
              <a
                href="https://vercel.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline"
              >
                Vercel dashboard
              </a>{' '}
              → project → Settings → Domains
            </li>
            <li>
              <strong>DNS records (A / CNAME):</strong> at your registrar (e.g. Cloudflare,
              Namecheap)
            </li>
            <li>
              <strong>Update SITE_URL after a domain change:</strong> set{' '}
              <code className="font-mono text-xs">NEXT_PUBLIC_SITE_URL</code> in Vercel env vars
              for the public site and{' '}
              <code className="font-mono text-xs">NEXT_PUBLIC_APP_URL</code> for the panel, then
              redeploy
            </li>
            <li>
              <strong>Resend sender domain:</strong> verify in{' '}
              <a
                href="https://resend.com/domains"
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline"
              >
                Resend → Domains
              </a>{' '}
              before changing it in <code className="font-mono text-xs">config/integrations.ts</code>
            </li>
          </ul>
        </div>

        <p className="text-xs text-muted-foreground">
          This page is read-only. Inline DNS / domain management would need Vercel + registrar
          API tokens — not worth wiring up for a single deployment.
        </p>
      </div>
    </>
  );
}
