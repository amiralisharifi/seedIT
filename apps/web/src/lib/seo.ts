import { unstable_cache } from 'next/cache';
import { queries } from '@seed-panel/db';

export type SeoDefaults = {
  siteName: string;
  defaultDescription: string;
  defaultOgImage: string;
  twitterHandle: string;
};

const FALLBACK: SeoDefaults = {
  siteName: 'SEED IT',
  defaultDescription:
    'SEED IT — Web development, automation & design from Dubai. We make IT on time.',
  defaultOgImage: '',
  twitterHandle: '',
};

export const getSeoDefaults = unstable_cache(
  async (): Promise<SeoDefaults> => {
    try {
      const raw = await queries.getSettings('seo_defaults');
      return {
        siteName: (raw.siteName as string) || FALLBACK.siteName,
        defaultDescription: (raw.defaultDescription as string) || FALLBACK.defaultDescription,
        defaultOgImage: (raw.defaultOgImage as string) || FALLBACK.defaultOgImage,
        twitterHandle: (raw.twitterHandle as string) || FALLBACK.twitterHandle,
      };
    } catch {
      return FALLBACK;
    }
  },
  ['seo-defaults'],
  { revalidate: 3600 },
);
