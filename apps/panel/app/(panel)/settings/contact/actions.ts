'use server';

import { revalidatePath } from 'next/cache';
import { queries } from '@seed-panel/db';

export type ContactResult = { error: string } | { ok: true };

export async function saveContactSettings(
  _prev: ContactResult | null,
  fd: FormData,
): Promise<ContactResult> {
  const contact = {
    phone: (fd.get('phone') as string) || '',
    whatsapp: (fd.get('whatsapp') as string) || '',
    supportEmail: (fd.get('supportEmail') as string) || '',
    salesEmail: (fd.get('salesEmail') as string) || '',
    address: (fd.get('address') as string) || '',
    legalName: (fd.get('legalName') as string) || '',
    tradeLicense: (fd.get('tradeLicense') as string) || '',
    vatTrn: (fd.get('vatTrn') as string) || '',
  };

  const social = {
    instagram: (fd.get('instagram') as string) || '',
    linkedin: (fd.get('linkedin') as string) || '',
    x: (fd.get('x') as string) || '',
  };

  try {
    await queries.saveSettings('contact', contact);
    await queries.saveSettings('social', social);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { error: `Database error: ${msg}` };
  }

  revalidatePath('/settings/contact');
  return { ok: true };
}
