import { and, asc, count, desc, eq, gte, isNotNull, isNull, lte, sql } from 'drizzle-orm';
import { db } from '../client';
import { businesses, demos, outreach, type Business, type NewBusiness } from '../schema';

export type LeadFilter = {
  category?: Business['category'];
  areaZone?: string;
  emirate?: Business['emirate'];
  status?: Business['status'];
  hasWebsite?: boolean;
  minLeadScore?: number;
  maxLeadScore?: number;
  languagePref?: Business['languagePref'];
  search?: string;
  limit?: number;
  offset?: number;
  orderBy?: 'score_desc' | 'created_desc' | 'name_asc' | 'next_follow_up';
};

export async function findLeads(filter: LeadFilter = {}) {
  const conditions = [isNull(businesses.deletedAt)];

  if (filter.category) conditions.push(eq(businesses.category, filter.category));
  if (filter.areaZone) conditions.push(eq(businesses.areaZone, filter.areaZone));
  if (filter.emirate) conditions.push(eq(businesses.emirate, filter.emirate));
  if (filter.status) conditions.push(eq(businesses.status, filter.status));
  if (filter.languagePref) conditions.push(eq(businesses.languagePref, filter.languagePref));
  if (filter.hasWebsite !== undefined) conditions.push(eq(businesses.hasWebsite, filter.hasWebsite));
  if (filter.minLeadScore !== undefined) {
    conditions.push(gte(businesses.leadScore, filter.minLeadScore));
  }
  if (filter.maxLeadScore !== undefined) {
    conditions.push(lte(businesses.leadScore, filter.maxLeadScore));
  }
  if (filter.search) {
    conditions.push(
      sql`(${businesses.name} ILIKE ${'%' + filter.search + '%'} OR ${businesses.areaZone} ILIKE ${'%' + filter.search + '%'})`,
    );
  }

  const orderByClause = (() => {
    switch (filter.orderBy ?? 'score_desc') {
      case 'score_desc':
        return [desc(businesses.leadScore), desc(businesses.createdAt)];
      case 'created_desc':
        return [desc(businesses.createdAt)];
      case 'name_asc':
        return [asc(businesses.name)];
      case 'next_follow_up':
        return [asc(businesses.nextFollowUpAt)];
    }
  })();

  return db
    .select()
    .from(businesses)
    .where(and(...conditions))
    .orderBy(...orderByClause)
    .limit(filter.limit ?? 50)
    .offset(filter.offset ?? 0);
}

export async function findHotLeads(limit = 20) {
  return db
    .select()
    .from(businesses)
    .where(
      and(
        isNull(businesses.deletedAt),
        sql`${businesses.status} IN ('qualified', 'demo_ready')`,
        isNull(businesses.lastContactedAt),
        gte(businesses.leadScore, 70),
      ),
    )
    .orderBy(desc(businesses.leadScore))
    .limit(limit);
}

export async function getLeadById(id: string) {
  return db.query.businesses.findFirst({
    where: and(eq(businesses.id, id), isNull(businesses.deletedAt)),
    with: {
      demos: { with: { template: true }, orderBy: (d, { desc }) => [desc(d.createdAt)] },
      outreachAttempts: { orderBy: (o, { desc }) => [desc(o.createdAt)], limit: 50 },
      messages: { orderBy: (m, { desc }) => [desc(m.occurredAt)], limit: 100 },
    },
  });
}

export async function getLeadByPlaceId(placeId: string) {
  return db.query.businesses.findFirst({ where: eq(businesses.placeId, placeId) });
}

export async function upsertLeadByPlaceId(data: NewBusiness): Promise<Business> {
  if (!data.placeId) throw new Error('upsertLeadByPlaceId requires a placeId');

  const existing = await getLeadByPlaceId(data.placeId);
  if (existing) {
    const updates: Partial<NewBusiness> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== null && value !== undefined && key !== 'id' && key !== 'createdAt') {
        // @ts-expect-error — dynamic key
        updates[key] = value;
      }
    }
    const [updated] = await db
      .update(businesses)
      .set(updates)
      .where(eq(businesses.id, existing.id))
      .returning();
    return updated!;
  }

  const [inserted] = await db.insert(businesses).values(data).returning();
  return inserted!;
}

export async function updateLeadStatus(id: string, status: Business['status']) {
  const [updated] = await db
    .update(businesses)
    .set({ status })
    .where(eq(businesses.id, id))
    .returning();
  return updated;
}

export async function getDailyMetrics(daysBack = 1) {
  const since = new Date();
  since.setDate(since.getDate() - daysBack);

  const [newLeads] = await db
    .select({ count: count() })
    .from(businesses)
    .where(and(gte(businesses.createdAt, since), isNull(businesses.deletedAt)));

  const [demosGenerated] = await db
    .select({ count: count() })
    .from(demos)
    .where(gte(demos.createdAt, since));

  const [outreachSent] = await db
    .select({ count: count() })
    .from(outreach)
    .where(and(gte(outreach.sentAt, since), isNotNull(outreach.sentAt)));

  const [replies] = await db
    .select({ count: count() })
    .from(outreach)
    .where(and(gte(outreach.repliedAt, since), isNotNull(outreach.repliedAt)));

  return {
    newLeads: newLeads?.count ?? 0,
    demosGenerated: demosGenerated?.count ?? 0,
    outreachSent: outreachSent?.count ?? 0,
    replies: replies?.count ?? 0,
  };
}
