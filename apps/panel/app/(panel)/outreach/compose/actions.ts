'use server';

import { revalidatePath } from 'next/cache';
import { queries } from '@seed-panel/db';

export type SentResult = { error: string } | { ok: true; outreachId: string };

export async function markOutreachSent(
  _prev: SentResult | null,
  fd: FormData,
): Promise<SentResult> {
  const businessId = (fd.get('businessId') as string) || '';
  const renderedBody = (fd.get('renderedBody') as string) || '';
  if (!businessId || !renderedBody.trim()) {
    return { error: 'Missing lead or empty message — nothing to log.' };
  }

  const templateId = ((fd.get('templateId') as string) || '').trim() || null;
  const demoId = ((fd.get('demoId') as string) || '').trim() || null;
  const channelRaw = (fd.get('channel') as string) || 'whatsapp';
  const channel = (
    ['whatsapp', 'email', 'instagram_dm', 'phone_call', 'in_person'] as const
  ).includes(channelRaw as 'whatsapp')
    ? (channelRaw as 'whatsapp' | 'email' | 'instagram_dm' | 'phone_call' | 'in_person')
    : 'whatsapp';
  const locale = ((fd.get('locale') as string) || 'en').trim() || 'en';

  try {
    const row = await queries.recordOutreachAttempt({
      businessId,
      demoId,
      templateId,
      channel,
      renderedBody: renderedBody.trim(),
      locale,
    });

    revalidatePath('/outreach');
    revalidatePath('/leads');
    revalidatePath('/dashboard');
    return { ok: true, outreachId: row.id };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { error: `Could not log outreach: ${msg}` };
  }
}
