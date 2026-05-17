import { and, asc, desc, eq, isNull, sql } from 'drizzle-orm';
import { db } from '../client';
import { businesses, messages, outreach } from '../schema';

/**
 * One row per business that has at least one message. Includes a preview of
 * the latest message, totals, and the latest message timestamp for sorting.
 *
 * Implementation: aggregates over messages with a window function in SQL so
 * the page renders one query, not N+1.
 */
export async function listConversations(limit = 200) {
  const rows = await db.execute<{
    business_id: string;
    business_name: string;
    business_area_zone: string | null;
    business_phone: string | null;
    business_whatsapp: string | null;
    business_status: string;
    last_message_body: string | null;
    last_message_direction: 'inbound' | 'outbound';
    last_message_at: string;
    last_message_channel: string;
    inbound_count: number;
    outbound_count: number;
    total_count: number;
  }>(sql`
    with ranked as (
      select
        m.business_id,
        m.body,
        m.direction,
        m.channel,
        m.occurred_at,
        row_number() over (partition by m.business_id order by m.occurred_at desc) as rn,
        count(*) filter (where m.direction = 'inbound')  over (partition by m.business_id) as inbound_count,
        count(*) filter (where m.direction = 'outbound') over (partition by m.business_id) as outbound_count,
        count(*) over (partition by m.business_id) as total_count
      from messages m
    )
    select
      r.business_id,
      b.name      as business_name,
      b.area_zone as business_area_zone,
      b.phone     as business_phone,
      b.whatsapp_number as business_whatsapp,
      b.status    as business_status,
      r.body      as last_message_body,
      r.direction as last_message_direction,
      r.occurred_at as last_message_at,
      r.channel   as last_message_channel,
      r.inbound_count,
      r.outbound_count,
      r.total_count
    from ranked r
    inner join businesses b on b.id = r.business_id
    where r.rn = 1
      and b.deleted_at is null
    order by r.occurred_at desc
    limit ${limit}
  `);

  // node-postgres returns rows in `rows`; drizzle's execute returns the result as-is
  // depending on driver. Support both shapes.
  const list = (rows as unknown as { rows?: unknown[] }).rows ?? (rows as unknown as unknown[]);
  return list as Array<{
    business_id: string;
    business_name: string;
    business_area_zone: string | null;
    business_phone: string | null;
    business_whatsapp: string | null;
    business_status: string;
    last_message_body: string | null;
    last_message_direction: 'inbound' | 'outbound';
    last_message_at: string;
    last_message_channel: string;
    inbound_count: number;
    outbound_count: number;
    total_count: number;
  }>;
}

export async function getConversation(businessId: string) {
  const [business] = await db
    .select()
    .from(businesses)
    .where(and(eq(businesses.id, businessId), isNull(businesses.deletedAt)))
    .limit(1);
  if (!business) return null;

  const timeline = await db
    .select()
    .from(messages)
    .where(eq(messages.businessId, businessId))
    .orderBy(asc(messages.occurredAt));

  return { business, timeline };
}

/**
 * Lookup a business by any of its phone fields. Normalizes digits-only for
 * comparison since stored values include spaces / "+" / formatting noise.
 */
export async function findBusinessByPhone(rawPhone: string) {
  const digits = rawPhone.replace(/\D/g, '');
  if (!digits) return null;
  // Strip leading 00 / + already removed; trailing 10-12 digits is the match
  const last10 = digits.slice(-10);
  const [row] = await db
    .select()
    .from(businesses)
    .where(
      and(
        isNull(businesses.deletedAt),
        sql`(regexp_replace(coalesce(${businesses.phone}, ''), '\\D', '', 'g') like ${'%' + last10})
         OR (regexp_replace(coalesce(${businesses.whatsappNumber}, ''), '\\D', '', 'g') like ${'%' + last10})`,
      ),
    )
    .limit(1);
  return row ?? null;
}

/**
 * Insert an inbound message + mark the most recent outreach as replied.
 * Used by the AiSensy webhook.
 */
export async function recordInboundMessage(input: {
  businessId: string;
  channel: 'whatsapp' | 'email' | 'instagram_dm' | 'phone_call' | 'in_person';
  body: string;
  locale?: string;
  providerMessageId?: string;
  occurredAt?: Date;
}) {
  await db.insert(messages).values({
    businessId: input.businessId,
    direction: 'inbound',
    channel: input.channel,
    body: input.body,
    locale: input.locale,
    providerMessageId: input.providerMessageId,
    occurredAt: input.occurredAt ?? new Date(),
  });

  // Find the most recent outreach attempt without a repliedAt and flip it
  const [latest] = await db
    .select({ id: outreach.id })
    .from(outreach)
    .where(
      and(
        eq(outreach.businessId, input.businessId),
        isNull(outreach.repliedAt),
      ),
    )
    .orderBy(desc(outreach.sentAt))
    .limit(1);

  if (latest) {
    await db
      .update(outreach)
      .set({ repliedAt: new Date(), status: 'replied' })
      .where(eq(outreach.id, latest.id));
  }

  // Move business status to 'replied' if it's still upstream of that
  await db
    .update(businesses)
    .set({ status: 'replied' })
    .where(
      and(
        eq(businesses.id, input.businessId),
        sql`${businesses.status} IN ('new','enriched','qualified','demo_ready','contacted')`,
      ),
    );
}
