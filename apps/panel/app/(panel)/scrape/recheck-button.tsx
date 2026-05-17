'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { recheckScrape } from './actions';

export function RecheckButton({ jobId }: { jobId: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();

  async function onClick() {
    const result = await recheckScrape(jobId);
    if (result && 'error' in result) {
      alert(result.error);
    } else if (result && 'ok' in result) {
      alert(`✓ Imported ${result.resultsCount} places — ${result.newLeadsCount} new leads.`);
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={() => start(onClick)}
      disabled={pending}
      className="text-xs text-primary hover:underline disabled:opacity-50"
    >
      {pending ? 'Re-checking…' : 'Re-check & import →'}
    </button>
  );
}
