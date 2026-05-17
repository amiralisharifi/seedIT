'use server';

import { revalidatePath } from 'next/cache';
import { queries } from '@seed-panel/db';
import type { NewBusiness } from '@seed-panel/db';
import { apify } from '@seed-panel/integrations';

export type ScrapeResult =
  | { error: string }
  | { ok: true; jobId: string; resultsCount: number; newLeadsCount: number };

const APIFY_ACTOR_ID = 'compass/crawler-google-places';

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

function pickEnum<T extends readonly string[]>(
  raw: FormDataEntryValue | null,
  allowed: T,
  fallback: T[number],
): T[number] {
  const s = (raw as string) || '';
  return (allowed as readonly string[]).includes(s) ? (s as T[number]) : fallback;
}

/** Apify Google Maps row → our `businesses` insert shape. */
type ApifyPlace = {
  placeId?: string;
  title?: string;
  address?: string;
  street?: string;
  city?: string;
  countryCode?: string;
  neighborhood?: string;
  location?: { lat?: number; lng?: number };
  phone?: string;
  phoneUnformatted?: string;
  website?: string;
  url?: string; // google maps url
  categoryName?: string;
  categories?: string[];
  totalScore?: number; // 0–5 rating
  reviewsCount?: number;
};

function inferCategory(apifyCategory: string | undefined, fallback: Category): Category {
  if (!apifyCategory) return fallback;
  const c = apifyCategory.toLowerCase();
  if (c.includes('barber')) return 'salon_mens_barber';
  if (c.includes('spa') || c.includes('hammam') || c.includes('massage')) return 'salon_hammam_spa';
  if (c.includes('nail') || c.includes('brow') || c.includes('lash') || c.includes('eyebrow'))
    return 'salon_brow_lash';
  if (c.includes('beauty') || c.includes('hair') || c.includes('salon'))
    return 'salon_ladies';
  if (c.includes('restaurant') || c.includes('cafe')) return 'restaurant';
  if (c.includes('dent')) return 'clinic_dental';
  if (c.includes('derma') || c.includes('skin')) return 'clinic_dermatology';
  if (c.includes('clinic') || c.includes('medical')) return 'clinic_general';
  if (c.includes('real estate') || c.includes('property')) return 'real_estate_broker';
  if (c.includes('garage') || c.includes('auto')) return 'auto_garage';
  if (c.includes('tailor')) return 'tailor';
  if (c.includes('clean')) return 'cleaning_services';
  if (c.includes('law')) return 'law_firm';
  return fallback;
}

function placeToBusiness(
  p: ApifyPlace,
  defaults: { category: Category; emirate: Emirate; areaZone: string | undefined },
): NewBusiness | null {
  if (!p.placeId || !p.title) return null;
  return {
    placeId: p.placeId,
    name: p.title,
    category: inferCategory(p.categoryName, defaults.category),
    subCategoryNotes: p.categoryName ?? null,
    emirate: defaults.emirate,
    areaZone: defaults.areaZone ?? p.neighborhood ?? p.city ?? null,
    address: p.address ?? null,
    lat: p.location?.lat ?? null,
    lng: p.location?.lng ?? null,
    googleMapsUrl: p.url ?? null,
    phone: p.phone ?? p.phoneUnformatted ?? null,
    websiteUrl: p.website ?? null,
    hasWebsite: !!p.website,
    googleRating: p.totalScore ?? null,
    googleReviewCount: p.reviewsCount ?? null,
    source: 'apify_google_maps',
    status: 'new',
  };
}

export async function runScrape(
  _prev: ScrapeResult | null,
  fd: FormData,
): Promise<ScrapeResult> {
  if (!process.env.APIFY_TOKEN) {
    return { error: 'APIFY_TOKEN is not set on the server. Add it in Vercel env vars + redeploy.' };
  }

  const queriesRaw = ((fd.get('queries') as string) || '').trim();
  const searchQueries = queriesRaw
    .split(/\r?\n/)
    .map((q) => q.trim())
    .filter((q) => q.length > 0);

  if (searchQueries.length === 0) return { error: 'Add at least one search query.' };
  if (searchQueries.length > 5) return { error: 'Max 5 queries per run (keeps it under timeout).' };

  const maxResultsRaw = Number((fd.get('maxResults') as string) || '50');
  const maxResults = Math.max(1, Math.min(100, Math.floor(maxResultsRaw)));

  const category = pickEnum(fd.get('category'), CATEGORIES, 'salon_ladies') as Category;
  const emirate = pickEnum(fd.get('emirate'), EMIRATES, 'dubai') as Emirate;
  const areaZone = (((fd.get('areaZone') as string) || '').trim() || undefined) as string | undefined;

  // 1. Create job row
  const job = await queries.createScrapeJob({
    queries: searchQueries,
    targetCategory: category,
    targetEmirate: emirate,
    maxResults: maxResults * searchQueries.length,
    apifyActorId: APIFY_ACTOR_ID,
  });

  await queries.updateScrapeJob(job.id, { status: 'running', startedAt: new Date() });

  // 2. Trigger Apify and wait synchronously (up to 280s on Vercel Pro 300s window)
  let dataset: ApifyPlace[] = [];
  let run: Awaited<ReturnType<typeof apify.startApifyRun>> | null = null;
  try {
    run = await apify.startApifyRun({
      actorId: APIFY_ACTOR_ID,
      input: {
        searchStringsArray: searchQueries,
        maxCrawledPlacesPerSearch: maxResults,
        language: 'en',
        countryCode: 'ae',
        skipClosedPlaces: true,
      },
      waitSeconds: 280,
      // No memoryMbytes — let the actor use its default (4096 MB for compass).
      // Passing a value lower than the actor's minimum causes the run to stay
      // queued in READY forever.
    });

    await queries.updateScrapeJob(job.id, {
      apifyRunId: run.id,
      apifyDatasetId: run.defaultDatasetId,
    });

    if (run.status !== 'SUCCEEDED') {
      const consoleUrl = `https://console.apify.com/actors/runs/${run.id}`;
      const hint =
        `Apify hadn't finished within our 280s wait (current status: ${run.status}). ` +
        `The run may still be going — once it succeeds, click "Re-check & import" on this ` +
        `job row to pull the results in. Run: ${consoleUrl}`;
      await queries.updateScrapeJob(job.id, {
        status: 'awaiting_apify',
        errorMessage: hint,
        finishedAt: new Date(),
      });
      revalidatePath('/scrape');
      return { error: hint };
    }

    dataset = (await apify.getApifyDataset<ApifyPlace>(run.defaultDatasetId, {
      limit: 1000,
    })) as ApifyPlace[];
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await queries.updateScrapeJob(job.id, {
      status: 'failed',
      errorMessage: msg,
      finishedAt: new Date(),
    });
    revalidatePath('/scrape');
    return { error: `Apify call failed: ${msg}` };
  }

  // 3. Upsert each row
  let newLeadsCount = 0;
  for (const place of dataset) {
    const data = placeToBusiness(place, { category, emirate, areaZone });
    if (!data) continue;
    try {
      const existing = await queries.getLeadByPlaceId(data.placeId!);
      await queries.upsertLeadByPlaceId(data);
      if (!existing) newLeadsCount++;
    } catch (e) {
      console.error('upsert failed for placeId', data.placeId, e);
    }
  }

  await queries.updateScrapeJob(job.id, {
    status: 'succeeded',
    resultsCount: dataset.length,
    newLeadsCount,
    finishedAt: new Date(),
  });

  revalidatePath('/scrape');
  revalidatePath('/leads');
  revalidatePath('/dashboard');

  return { ok: true, jobId: job.id, resultsCount: dataset.length, newLeadsCount };
}

/**
 * Re-poll Apify for an existing job and import its dataset if the run has
 * finished since our synchronous wait timed out. Idempotent — safe to call
 * repeatedly. Used by the "Re-check & import" button on a stuck job row.
 */
export async function recheckScrape(jobId: string): Promise<ScrapeResult> {
  if (!process.env.APIFY_TOKEN) {
    return { error: 'APIFY_TOKEN is not set on the server.' };
  }

  const job = await queries.getScrapeJobById(jobId);
  if (!job) return { error: 'Scrape job not found.' };
  if (!job.apifyRunId) return { error: 'This job has no Apify run id to re-check.' };

  let run;
  try {
    run = await apify.getApifyRun(job.apifyRunId);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { error: `Could not fetch Apify run: ${msg}` };
  }

  if (run.status !== 'SUCCEEDED') {
    const consoleUrl = `https://console.apify.com/actors/runs/${run.id}`;
    await queries.updateScrapeJob(jobId, {
      status: run.status === 'RUNNING' ? 'running' : 'awaiting_apify',
      errorMessage: `Run is still ${run.status}. Try again in a minute. Run: ${consoleUrl}`,
    });
    revalidatePath('/scrape');
    return { error: `Run is still ${run.status} — try again in a minute.` };
  }

  // Run is SUCCEEDED — pull dataset and import
  // The job row should already have the original category/emirate context.
  let dataset: ApifyPlace[];
  try {
    dataset = (await apify.getApifyDataset<ApifyPlace>(run.defaultDatasetId, {
      limit: 1000,
    })) as ApifyPlace[];
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { error: `Could not fetch Apify dataset: ${msg}` };
  }

  const category = job.targetCategory ?? 'salon_ladies';
  const emirate = job.targetEmirate ?? 'dubai';

  let newLeadsCount = 0;
  for (const place of dataset) {
    const data = placeToBusiness(place, {
      category: category as Category,
      emirate: emirate as Emirate,
      areaZone: undefined,
    });
    if (!data) continue;
    try {
      const existing = await queries.getLeadByPlaceId(data.placeId!);
      await queries.upsertLeadByPlaceId(data);
      if (!existing) newLeadsCount++;
    } catch (e) {
      console.error('upsert failed for placeId', data.placeId, e);
    }
  }

  await queries.updateScrapeJob(jobId, {
    status: 'succeeded',
    resultsCount: dataset.length,
    newLeadsCount,
    apifyDatasetId: run.defaultDatasetId,
    finishedAt: new Date(),
    errorMessage: null as unknown as string, // clear it
  });

  revalidatePath('/scrape');
  revalidatePath('/leads');
  revalidatePath('/dashboard');

  return { ok: true, jobId, resultsCount: dataset.length, newLeadsCount };
}
