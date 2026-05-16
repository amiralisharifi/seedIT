'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { queries } from '@seed-panel/db';

export type DemoResult = { error: string } | { id: string };

type ServiceItem = { name: string; price?: string; duration?: string };

function parseServices(raw: string | null): ServiceItem[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as ServiceItem[];
    return Array.isArray(parsed)
      ? parsed.filter((s) => s && typeof s.name === 'string' && s.name.trim().length > 0)
      : [];
  } catch {
    return [];
  }
}

function buildContent(fd: FormData) {
  const servicesItems = parseServices(fd.get('services') as string | null);
  return {
    en: {
      hero: {
        headline: (fd.get('hero_headline') as string) || undefined,
        sub: (fd.get('hero_sub') as string) || undefined,
        ctaPrimary: (fd.get('hero_ctaPrimary') as string) || undefined,
        ctaSecondary: (fd.get('hero_ctaSecondary') as string) || undefined,
      },
      services: {
        title: (fd.get('services_title') as string) || undefined,
        items: servicesItems,
      },
      about: {
        title: (fd.get('about_title') as string) || undefined,
        body: (fd.get('about_body') as string) || undefined,
      },
      contact: {
        title: (fd.get('contact_title') as string) || undefined,
        hoursLabel: (fd.get('contact_hoursLabel') as string) || undefined,
      },
      booking: {
        whatsappMessage: (fd.get('booking_whatsappMessage') as string) || undefined,
      },
    },
    ar: {},
  };
}

export async function createDemoAction(
  _prev: DemoResult | null,
  fd: FormData,
): Promise<DemoResult> {
  const businessId = (fd.get('businessId') as string) || '';
  if (!businessId) return { error: 'Pick a business first.' };

  const businessName = (fd.get('businessName') as string) || 'demo';
  const slugInput = ((fd.get('slug') as string) || '').trim();

  try {
    const templateId = await queries.getOrCreateDefaultTemplateId();
    const slug = slugInput || (await queries.generateUniqueDemoSlug(businessName));
    const content = buildContent(fd);
    const status = (fd.get('status') as
      | 'draft'
      | 'approved'
      | 'sent'
      | 'viewed'
      | 'multi_viewed'
      | 'replied'
      | 'archived'
      | null) ?? 'draft';
    const internalNotes = (fd.get('internalNotes') as string) || undefined;

    const created = await queries.createDemo({
      businessId,
      templateId,
      slug,
      content,
      status,
      internalNotes,
    });

    revalidatePath('/demos');
    redirect(`/demos/${created.id}`);
  } catch (e) {
    // redirect() throws — let Next.js handle it
    if (e && typeof e === 'object' && 'digest' in e && typeof (e as { digest: string }).digest === 'string' && (e as { digest: string }).digest.startsWith('NEXT_REDIRECT')) {
      throw e;
    }
    const msg = e instanceof Error ? e.message : String(e);
    return { error: `Could not create demo: ${msg}` };
  }
}

export async function updateDemoAction(
  id: string,
  _prev: DemoResult | null,
  fd: FormData,
): Promise<DemoResult> {
  try {
    const slug = ((fd.get('slug') as string) || '').trim();
    const content = buildContent(fd);
    const status = (fd.get('status') as
      | 'draft'
      | 'approved'
      | 'sent'
      | 'viewed'
      | 'multi_viewed'
      | 'replied'
      | 'archived'
      | null) ?? undefined;
    const internalNotes = (fd.get('internalNotes') as string) || undefined;

    await queries.updateDemo(id, {
      slug: slug || undefined,
      content,
      status: status ?? undefined,
      internalNotes,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { error: `Database error: ${msg}` };
  }

  revalidatePath('/demos');
  revalidatePath(`/demos/${id}`);
  return { id };
}
