'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { runScrape, type ScrapeResult } from './actions';

const input =
  'w-full h-10 px-3 rounded-md border border-border bg-background text-sm ' +
  'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary';
const textarea =
  'w-full px-3 py-2 rounded-md border border-border bg-background text-sm font-mono ' +
  'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-y';
const lbl = 'block text-xs font-medium text-muted-foreground mb-1';

const CATEGORIES = [
  { value: 'salon_ladies', label: "Salon — ladies'" },
  { value: 'salon_mens_barber', label: "Salon — men's barber" },
  { value: 'salon_premium', label: 'Salon — premium' },
  { value: 'salon_hammam_spa', label: 'Salon / Hammam / Spa' },
  { value: 'salon_brow_lash', label: 'Brow / lash / nail studio' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'clinic_dental', label: 'Clinic — dental' },
  { value: 'clinic_general', label: 'Clinic — general' },
  { value: 'other', label: 'Other' },
];

const EMIRATES = [
  { value: 'dubai', label: 'Dubai' },
  { value: 'abu_dhabi', label: 'Abu Dhabi' },
  { value: 'sharjah', label: 'Sharjah' },
  { value: 'ajman', label: 'Ajman' },
];

export function ScrapeForm() {
  const [state, action, pending] = useActionState(runScrape, null);
  const [queries, setQueries] = useState('');
  const [maxResults, setMaxResults] = useState(50);

  const queryCount = queries.split(/\r?\n/).filter((q) => q.trim().length > 0).length;
  const totalResults = queryCount * maxResults;
  // Apify charges roughly $0.001 per Google Maps place via compass actor on $49 plan
  const estCost = (totalResults * 0.001).toFixed(2);

  const errorMsg = state && 'error' in state ? state.error : null;
  const okState = state && 'ok' in state ? state : null;

  return (
    <form action={action} className="space-y-6">
      {errorMsg && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <strong>Error:</strong> {errorMsg}
        </div>
      )}
      {okState && (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          ✓ Scraped {okState.resultsCount} places — {okState.newLeadsCount} new leads.{' '}
          <Link href="/leads" className="underline font-medium">View leads →</Link>
        </div>
      )}

      <div>
        <label className={lbl} htmlFor="queries">
          Search queries{' '}
          <span className="text-muted-foreground/70 normal-case">
            (one per line, max 5; use Google Maps phrasing)
          </span>
        </label>
        <textarea
          id="queries"
          name="queries"
          rows={5}
          value={queries}
          onChange={(e) => setQueries(e.target.value)}
          placeholder={'ladies salon Karama Dubai\nbarber shop Deira Dubai\nnail studio Bur Dubai'}
          className={textarea}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={lbl} htmlFor="maxResults">
            Max results per query (1–100)
          </label>
          <input
            id="maxResults"
            name="maxResults"
            type="number"
            value={maxResults}
            onChange={(e) => setMaxResults(Number(e.target.value))}
            min={1}
            max={100}
            className={input}
          />
        </div>
        <div>
          <label className={lbl} htmlFor="emirate">Emirate</label>
          <select id="emirate" name="emirate" defaultValue="dubai" className={input}>
            {EMIRATES.map((e) => (
              <option key={e.value} value={e.value}>{e.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={lbl} htmlFor="category">
            Default category{' '}
            <span className="text-muted-foreground/70 normal-case">
              (auto-inferred per result; this is the fallback)
            </span>
          </label>
          <select id="category" name="category" defaultValue="salon_ladies" className={input}>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={lbl} htmlFor="areaZone">
            Area override{' '}
            <span className="text-muted-foreground/70 normal-case">(optional)</span>
          </label>
          <input
            id="areaZone"
            name="areaZone"
            type="text"
            placeholder="e.g. Karama"
            className={input}
          />
        </div>
      </div>

      <div className="rounded-md border border-border bg-muted/30 px-4 py-3 text-sm">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Queries
            </div>
            <div className="text-lg font-semibold mt-0.5">{queryCount}</div>
          </div>
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Up to results
            </div>
            <div className="text-lg font-semibold mt-0.5">{totalResults}</div>
          </div>
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Est. Apify cost
            </div>
            <div className="text-lg font-semibold mt-0.5">~${estCost}</div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Runs synchronously — keep this tab open. Typical 50-result scrape: 30-90 seconds.
        </p>
      </div>

      <div>
        <button
          type="submit"
          disabled={pending || queryCount === 0}
          className="h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"
        >
          {pending ? 'Scraping… (don’t close this tab)' : 'Run scrape'}
        </button>
      </div>
    </form>
  );
}
