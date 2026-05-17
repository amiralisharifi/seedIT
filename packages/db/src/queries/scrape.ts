import { desc, eq } from 'drizzle-orm';
import { db } from '../client';
import { scrapeJobs, type NewBusiness } from '../schema';

export async function listScrapeJobs(limit = 50) {
  return db
    .select()
    .from(scrapeJobs)
    .orderBy(desc(scrapeJobs.createdAt))
    .limit(limit);
}

export async function getScrapeJobById(id: string) {
  const [row] = await db.select().from(scrapeJobs).where(eq(scrapeJobs.id, id)).limit(1);
  return row ?? null;
}

export async function createScrapeJob(input: {
  queries: string[];
  targetCategory: NewBusiness['category'];
  targetEmirate?: NewBusiness['emirate'];
  maxResults: number;
  apifyActorId: string;
}) {
  const [row] = await db
    .insert(scrapeJobs)
    .values({
      queries: input.queries,
      targetCategory: input.targetCategory,
      targetEmirate: input.targetEmirate ?? 'dubai',
      maxResults: input.maxResults,
      apifyActorId: input.apifyActorId,
      status: 'queued',
    })
    .returning({ id: scrapeJobs.id });
  return row!;
}

export async function updateScrapeJob(
  id: string,
  input: {
    status?: string;
    apifyRunId?: string;
    apifyDatasetId?: string;
    resultsCount?: number;
    newLeadsCount?: number;
    errorMessage?: string | null;
    costUsd?: number;
    startedAt?: Date;
    finishedAt?: Date;
  },
) {
  await db.update(scrapeJobs).set(input).where(eq(scrapeJobs.id, id));
}
