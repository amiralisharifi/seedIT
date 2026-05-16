'use server';

import { revalidatePath } from 'next/cache';
import { queries } from '@seed-panel/db';

export type IntegrationsResult = { error: string } | { ok: true };

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
  return { ok: true };
}
