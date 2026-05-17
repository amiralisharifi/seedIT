'use server';

import { revalidatePath } from 'next/cache';
import { queries } from '@seed-panel/db';
import { aisensy } from '@seed-panel/integrations';

export type SentResult = { error: string } | { ok: true; outreachId: string };

/** Pull `{{varname}}` tokens from the template body in document order, deduped. */
function extractVarOrder(body: string): string[] {
  const seen = new Set<string>();
  const ordered: string[] = [];
  for (const m of body.matchAll(/\{\{\s*(\w+)\s*\}\}/g)) {
    const name = m[1];
    if (name && !seen.has(name)) {
      seen.add(name);
      ordered.push(name);
    }
  }
  return ordered;
}

function digitsOnly(s: string | null | undefined): string {
  return (s ?? '').replace(/\D/g, '');
}

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

/**
 * Send a WhatsApp template via AiSensy and log it. Requires:
 * - AISENSY_API_KEY in env
 * - The message template has a providerTemplateName (the approved Meta template)
 *
 * Positional template params are derived from `{{varname}}` order in the
 * template body — matches the natural Meta convention where {{1}}, {{2}}, …
 * map to vars in document order.
 */
export async function sendViaAiSensy(
  _prev: SentResult | null,
  fd: FormData,
): Promise<SentResult> {
  if (!process.env.AISENSY_API_KEY) {
    return { error: 'AISENSY_API_KEY is not set on the server.' };
  }

  const businessId = (fd.get('businessId') as string) || '';
  const templateId = (fd.get('templateId') as string) || '';
  const localeRaw = ((fd.get('locale') as string) || 'en').trim();
  const locale = localeRaw === 'ar' ? 'ar' : 'en';

  // Merge values picked up from the composer
  const senderName = ((fd.get('senderName') as string) || '').trim() || 'Amirali';

  if (!businessId) return { error: 'Pick a lead first.' };
  if (!templateId) return { error: 'Pick a template first.' };

  try {
    const [template, leadCtx] = await Promise.all([
      queries.getMessageTemplateById(templateId),
      queries.getLeadWithLatestDemo(businessId),
    ]);

    if (!template) return { error: 'Template no longer exists.' };
    if (!template.providerTemplateName) {
      return {
        error:
          'This template has no providerTemplateName set — add the AiSensy/Meta template name in the message_templates row.',
      };
    }
    if (!leadCtx) return { error: 'Lead no longer exists.' };

    const business = leadCtx.business;
    const phone = business.whatsappNumber || business.phone || '';
    const destination = digitsOnly(phone);
    if (!destination) {
      return { error: 'Lead has no phone / WhatsApp number.' };
    }

    const body = (locale === 'ar' ? template.bodyAr : template.bodyEn) ?? '';
    const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://seedit.ae').replace(/\/$/, '');
    const mergeVars: Record<string, string> = {
      name: business.name,
      area: business.areaZone ?? '',
      demoUrl: leadCtx.demo ? `${SITE_URL}/d/${leadCtx.demo.slug}` : '',
      senderName,
    };

    const varOrder = extractVarOrder(body);
    const templateParams = varOrder.map((v) => mergeVars[v] ?? '');
    const renderedBody = body.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) => mergeVars[k] ?? '');

    const resp = await aisensy.sendWhatsAppTemplate({
      to: destination,
      campaignName: template.providerTemplateName,
      userName: business.name,
      templateParams,
      tags: ['seed-panel', `template:${template.slug}`],
    });

    if (!resp.success) {
      return { error: `AiSensy rejected the send: ${resp.message ?? 'unknown error'}` };
    }

    const row = await queries.recordOutreachAttempt({
      businessId,
      demoId: leadCtx.demo?.id ?? null,
      templateId,
      channel: 'whatsapp',
      renderedBody,
      locale,
    });

    revalidatePath('/outreach');
    revalidatePath('/conversations');
    revalidatePath('/leads');
    revalidatePath('/dashboard');
    return { ok: true, outreachId: row.id };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { error: `Send failed: ${msg}` };
  }
}
