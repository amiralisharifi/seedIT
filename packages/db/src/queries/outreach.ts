import { and, desc, eq, isNull, sql } from 'drizzle-orm';
import { db } from '../client';
import {
  businesses,
  demos,
  messageTemplates,
  messages,
  outreach,
  type Business,
} from '../schema';

/* ─────────── Message templates ─────────── */

export async function listMessageTemplates(opts: { channel?: 'whatsapp' | 'email' | 'instagram_dm' | 'phone_call' | 'in_person'; activeOnly?: boolean } = {}) {
  const conditions = [];
  if (opts.channel) conditions.push(eq(messageTemplates.channel, opts.channel));
  if (opts.activeOnly !== false) conditions.push(eq(messageTemplates.isActive, true));
  return db
    .select()
    .from(messageTemplates)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(messageTemplates.name);
}

export async function getMessageTemplateById(id: string) {
  const [row] = await db
    .select()
    .from(messageTemplates)
    .where(eq(messageTemplates.id, id))
    .limit(1);
  return row ?? null;
}

/* ─────────── Leads for the composer ─────────── */

export async function listLeadsForCompose(limit = 500) {
  const leads = await db
    .select({
      id: businesses.id,
      name: businesses.name,
      areaZone: businesses.areaZone,
      phone: businesses.phone,
      whatsappNumber: businesses.whatsappNumber,
      languagePref: businesses.languagePref,
    })
    .from(businesses)
    .where(isNull(businesses.deletedAt))
    .orderBy(businesses.name)
    .limit(limit);

  if (leads.length === 0) return [];

  // One query for all demos, ordered newest first; first occurrence per
  // business is the latest non-archived one.
  const allDemos = await db
    .select({ id: demos.id, slug: demos.slug, businessId: demos.businessId })
    .from(demos)
    .where(isNull(demos.archivedAt))
    .orderBy(desc(demos.createdAt));

  const demoMap = new Map<string, { id: string; slug: string }>();
  for (const d of allDemos) {
    if (!demoMap.has(d.businessId)) {
      demoMap.set(d.businessId, { id: d.id, slug: d.slug });
    }
  }

  return leads.map((l) => ({ ...l, demo: demoMap.get(l.id) ?? null }));
}

export async function getLeadWithLatestDemo(businessId: string) {
  const [business] = await db
    .select()
    .from(businesses)
    .where(and(eq(businesses.id, businessId), isNull(businesses.deletedAt)))
    .limit(1);
  if (!business) return null;

  const [demo] = await db
    .select({ id: demos.id, slug: demos.slug, status: demos.status })
    .from(demos)
    .where(and(eq(demos.businessId, businessId), isNull(demos.archivedAt)))
    .orderBy(desc(demos.createdAt))
    .limit(1);

  return { business, demo: demo ?? null };
}

/* ─────────── Record an outreach attempt ─────────── */

export async function recordOutreachAttempt(input: {
  businessId: string;
  demoId?: string | null;
  templateId?: string | null;
  channel: 'whatsapp' | 'email' | 'instagram_dm' | 'phone_call' | 'in_person';
  renderedBody: string;
  renderedSubject?: string;
  locale: string;
}) {
  const [row] = await db
    .insert(outreach)
    .values({
      businessId: input.businessId,
      demoId: input.demoId ?? null,
      messageTemplateId: input.templateId ?? null,
      channel: input.channel,
      status: 'sent',
      renderedBody: input.renderedBody,
      renderedSubject: input.renderedSubject ?? null,
      localeUsed: input.locale,
      sentAt: new Date(),
    })
    .returning({ id: outreach.id });

  // Mirror into the conversation timeline so the inbox view works later
  await db.insert(messages).values({
    businessId: input.businessId,
    outreachId: row!.id,
    direction: 'outbound',
    channel: input.channel,
    body: input.renderedBody,
    locale: input.locale,
  });

  // Bump lastContactedAt on the business
  await db
    .update(businesses)
    .set({ lastContactedAt: new Date() })
    .where(eq(businesses.id, input.businessId));

  // Move status forward if still in the pre-contact phase
  await db
    .update(businesses)
    .set({ status: 'contacted' })
    .where(
      and(
        eq(businesses.id, input.businessId),
        sql`${businesses.status} IN ('new','enriched','qualified','demo_ready')`,
      ),
    );

  // Increment template send counter
  if (input.templateId) {
    await db
      .update(messageTemplates)
      .set({ timesSent: sql`${messageTemplates.timesSent} + 1` })
      .where(eq(messageTemplates.id, input.templateId));
  }

  return row!;
}

/* ─────────── Recent outreach list (for /outreach page) ─────────── */

export async function listOutreach(limit = 100) {
  return db
    .select({
      id: outreach.id,
      channel: outreach.channel,
      status: outreach.status,
      renderedBody: outreach.renderedBody,
      localeUsed: outreach.localeUsed,
      sentAt: outreach.sentAt,
      repliedAt: outreach.repliedAt,
      createdAt: outreach.createdAt,
      businessId: outreach.businessId,
      businessName: businesses.name,
      businessAreaZone: businesses.areaZone,
      businessPhone: businesses.phone,
      businessWhatsapp: businesses.whatsappNumber,
      demoSlug: demos.slug,
    })
    .from(outreach)
    .innerJoin(businesses, eq(outreach.businessId, businesses.id))
    .leftJoin(demos, eq(outreach.demoId, demos.id))
    .orderBy(desc(outreach.createdAt))
    .limit(limit);
}

/* ─────────── Shared merge helper (used by composer + action) ─────────── */

export function renderTemplate(body: string, vars: Record<string, string>): string {
  return body.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => vars[key] ?? '');
}

export type LeadForCompose = Pick<
  Business,
  'id' | 'name' | 'areaZone' | 'phone' | 'whatsappNumber' | 'languagePref'
>;
