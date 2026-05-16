'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { queries } from '@seed-panel/db';

export type LeadResult = { error: string } | { id: string };

const CATEGORIES = [
  'salon_ladies', 'salon_mens_barber', 'salon_premium', 'salon_hammam_spa',
  'salon_brow_lash', 'salon_mobile', 'restaurant', 'clinic_dental',
  'clinic_dermatology', 'clinic_general', 'real_estate_broker', 'auto_garage',
  'tailor', 'cleaning_services', 'law_firm', 'consultancy', 'other',
] as const;
type Category = (typeof CATEGORIES)[number];

const EMIRATES = [
  'dubai', 'abu_dhabi', 'sharjah', 'ajman', 'fujairah',
  'ras_al_khaimah', 'umm_al_quwain',
] as const;
type Emirate = (typeof EMIRATES)[number];

const LANG_PREFS = ['ar', 'en', 'bilingual', 'unknown'] as const;
type LangPref = (typeof LANG_PREFS)[number];

function pickEnum<T extends readonly string[]>(
  raw: FormDataEntryValue | null,
  allowed: T,
  fallback: T[number],
): T[number] {
  const s = (raw as string) || '';
  return (allowed as readonly string[]).includes(s) ? (s as T[number]) : fallback;
}

function strOrNull(fd: FormData, key: string): string | undefined {
  const v = ((fd.get(key) as string) || '').trim();
  return v.length > 0 ? v : undefined;
}

function tryExtractLatLng(url: string | undefined): { lat?: number; lng?: number } {
  if (!url) return {};
  const m = url.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (!m) return {};
  const lat = Number(m[1]);
  const lng = Number(m[2]);
  if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
  return {};
}

export async function createLeadAction(
  _prev: LeadResult | null,
  fd: FormData,
): Promise<LeadResult> {
  const name = ((fd.get('name') as string) || '').trim();
  if (!name) return { error: 'Business name is required.' };

  const phone = strOrNull(fd, 'phone');
  const whatsappNumber = strOrNull(fd, 'whatsappNumber');
  if (!phone && !whatsappNumber) {
    return { error: 'Add at least a phone or WhatsApp number — outreach needs one to work.' };
  }

  const googleMapsUrl = strOrNull(fd, 'googleMapsUrl');
  const { lat, lng } = tryExtractLatLng(googleMapsUrl);

  const category = pickEnum(fd.get('category'), CATEGORIES, 'salon_ladies') as Category;
  const emirate = pickEnum(fd.get('emirate'), EMIRATES, 'dubai') as Emirate;
  const languagePref = pickEnum(fd.get('languagePref'), LANG_PREFS, 'unknown') as LangPref;

  try {
    const created = await queries.createLead({
      name,
      category,
      emirate,
      areaZone: strOrNull(fd, 'areaZone'),
      address: strOrNull(fd, 'address'),
      lat,
      lng,
      googleMapsUrl,
      phone,
      whatsappNumber,
      email: strOrNull(fd, 'email'),
      websiteUrl: strOrNull(fd, 'websiteUrl'),
      hasWebsite: !!strOrNull(fd, 'websiteUrl'),
      instagramHandle: strOrNull(fd, 'instagramHandle'),
      languagePref,
      source: 'manual',
      status: 'new',
    });

    revalidatePath('/leads');
    redirect(`/leads?created=${created.id}`);
  } catch (e) {
    // Let Next.js redirect throw through
    if (
      e && typeof e === 'object' && 'digest' in e &&
      typeof (e as { digest: string }).digest === 'string' &&
      (e as { digest: string }).digest.startsWith('NEXT_REDIRECT')
    ) {
      throw e;
    }
    const msg = e instanceof Error ? e.message : String(e);
    return { error: `Could not save lead: ${msg}` };
  }
}
