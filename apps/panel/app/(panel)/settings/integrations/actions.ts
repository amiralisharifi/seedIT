'use server';

import { revalidatePath } from 'next/cache';
import { queries } from '@seed-panel/db';

export type IntegrationsResult = { error: string } | { ok: true };

/** Tell the public site to drop a tagged unstable_cache entry right now. */
async function flushWebTag(tag: string): Promise<void> {
  const publicSiteUrl = process.env.PUBLIC_SITE_URL;
  const secret = process.env.REVALIDATE_SECRET;
  if (!publicSiteUrl || !secret) return; // silently no-op when not configured

  try {
    const url = new URL('/api/revalidate', publicSiteUrl).toString();
    await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-revalidate-secret': secret,
      },
      body: JSON.stringify({ tag }),
      signal: AbortSignal.timeout(5_000),
    });
  } catch {
    // Non-fatal — settings still save, just won't appear until the 60s TTL.
  }
}

export async function saveIntegrationsSettings(
  _prev: IntegrationsResult | null,
  fd: FormData,
): Promise<IntegrationsResult> {
  const analytics = {
    ga4Enabled: fd.get('ga4Enabled') === 'on',
    ga4MeasurementId: (fd.get('ga4MeasurementId') as string) || '',
    gtmEnabled: fd.get('gtmEnabled') === 'on',
    gtmContainerId: (fd.get('gtmContainerId') as string) || '',
    gscEnabled: fd.get('gscEnabled') === 'on',
    gscVerificationToken: (fd.get('gscVerificationToken') as string) || '',
    bwtEnabled: fd.get('bwtEnabled') === 'on',
    bwtVerificationToken: (fd.get('bwtVerificationToken') as string) || '',
    yandexVerification: (fd.get('yandexVerification') as string) || '',
    pinterestVerification: (fd.get('pinterestVerification') as string) || '',
    facebookDomainVerification: (fd.get('facebookDomainVerification') as string) || '',
    ahrefsVerification: (fd.get('ahrefsVerification') as string) || '',
  };

  const seoDefaults = {
    siteName: (fd.get('siteName') as string) || '',
    defaultDescription: (fd.get('defaultDescription') as string) || '',
    defaultOgImage: (fd.get('defaultOgImage') as string) || '',
    twitterHandle: (fd.get('twitterHandle') as string) || '',
  };

  try {
    await queries.saveSettings('analytics', analytics);
    await queries.saveSettings('seo_defaults', seoDefaults);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { error: `Database error: ${msg}` };
  }

  revalidatePath('/settings/integrations');

  // Public site holds these in unstable_cache — tell it to drop them now
  // so the new GTM / GA4 / SEO defaults show up on the next page request
  // instead of waiting for the 60s soft TTL.
  await Promise.all([flushWebTag('settings-analytics'), flushWebTag('settings-seo')]);

  return { ok: true };
}
