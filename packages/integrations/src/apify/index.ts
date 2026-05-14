/**
 * Apify wrapper.
 *
 * The admin doesn't usually call this directly — n8n does, via its native
 * Apify nodes. But this exists for ad-hoc operations (e.g. "run a one-off
 * scrape from this admin button" without going through n8n).
 *
 * Docs: https://docs.apify.com/api/v2
 */

const apiKey = process.env.APIFY_TOKEN;
const API_BASE = 'https://api.apify.com/v2';

export interface RunActorParams {
  actorId: string; // e.g. 'compass/crawler-google-places'
  input: Record<string, unknown>;
  /** Wait for the run to finish (blocking). Max 300 seconds. */
  waitSeconds?: number;
  /** Memory in MB — defaults to 1024 */
  memoryMbytes?: number;
}

export interface ApifyRun {
  id: string;
  status: 'READY' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'ABORTED' | 'TIMING-OUT' | 'TIMED-OUT';
  defaultDatasetId: string;
  startedAt: string;
  finishedAt?: string;
  stats?: {
    inputBodyLen: number;
    durationMillis: number;
  };
  usage?: {
    ACTOR_COMPUTE_UNITS?: number;
  };
}

export async function startApifyRun(params: RunActorParams): Promise<ApifyRun> {
  if (!apiKey) throw new Error('APIFY_TOKEN is not set');

  const url = new URL(`${API_BASE}/acts/${params.actorId}/runs`);
  if (params.waitSeconds) url.searchParams.set('waitForFinish', String(params.waitSeconds));
  if (params.memoryMbytes) url.searchParams.set('memory', String(params.memoryMbytes));

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(params.input),
  });

  if (!res.ok) {
    throw new Error(`Apify run failed: ${res.status} ${await res.text()}`);
  }
  const json = await res.json();
  return json.data;
}

export async function getApifyRun(runId: string): Promise<ApifyRun> {
  if (!apiKey) throw new Error('APIFY_TOKEN is not set');

  const res = await fetch(`${API_BASE}/actor-runs/${runId}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) throw new Error(`Apify get run failed: ${res.status}`);
  const json = await res.json();
  return json.data;
}

export async function getApifyDataset<T = unknown>(
  datasetId: string,
  opts: { limit?: number; offset?: number } = {},
): Promise<T[]> {
  if (!apiKey) throw new Error('APIFY_TOKEN is not set');

  const url = new URL(`${API_BASE}/datasets/${datasetId}/items`);
  url.searchParams.set('format', 'json');
  url.searchParams.set('clean', 'true');
  if (opts.limit) url.searchParams.set('limit', String(opts.limit));
  if (opts.offset) url.searchParams.set('offset', String(opts.offset));

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) throw new Error(`Apify dataset fetch failed: ${res.status}`);
  return res.json();
}
