/**
 * Schemas for the four sacred config files.
 *
 * These run at app startup. If a clone's config is invalid (missing required
 * field, bad color format, unknown locale), the app fails loudly with a clear
 * error instead of rendering a half-broken UI.
 */

import { z } from 'zod';

/* ============================================================================
   BRAND
============================================================================ */

// HSL components without commas — "264 70% 51%" — works with Tailwind opacity
const hslPattern = /^\d{1,3}\s+\d{1,3}%\s+\d{1,3}%$/;
const hslColor = z.string().regex(hslPattern, 'Must be "H S% L%" (e.g., "264 70% 51%")');

export const brandSchema = z.object({
  name: z.string().min(1).max(60),
  shortName: z.string().min(1).max(20),
  tagline: z.string().max(140),
  taglineAr: z.string().max(140).optional(),

  logo: z.object({
    light: z.string().startsWith('/'),
    dark: z.string().startsWith('/'),
    mark: z.string().startsWith('/'),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
  }),
  favicon: z.string().startsWith('/'),

  colors: z.object({
    primary: hslColor,
    primaryForeground: hslColor,
    accent: hslColor,
    accentForeground: hslColor,
    sidebar: hslColor,
    sidebarForeground: hslColor,
    sidebarBorder: hslColor,
  }),

  fonts: z.object({
    sans: z.string(),
    display: z.string(),
    arabic: z.string(),
    mono: z.string(),
  }),

  business: z.object({
    legalName: z.string(),
    address: z.string(),
    city: z.string(),
    country: z.string(),
    supportEmail: z.string().email(),
    salesEmail: z.string().email(),
    phone: z.string(),
    whatsapp: z.string(),
    hours: z.string(),
    tradeLicense: z.string(),
    vatTrn: z.string(),
  }),

  social: z.object({
    instagram: z.string(),
    linkedin: z.string(),
    x: z.string(),
  }),

  defaultLocale: z.string().length(2),
  timezone: z.string(),
  currency: z.string().length(3),
  poweredBy: z.string().nullable(),
});

export type BrandConfig = z.infer<typeof brandSchema>;

/* ============================================================================
   COLLECTIONS — see @seed-panel/core for the field types this references
============================================================================ */

// We import the FieldDef type from core in the apps; the schema package
// keeps a structural definition so we don't create a circular dep.
export const collectionSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-z][a-z0-9_]*$/, 'snake_case identifier'),
  name: z.string().min(1),
  nameSingular: z.string().min(1),
  icon: z.string().optional(),
  description: z.string().optional(),
  table: z.string().min(1),
  titleField: z.string().min(1),
  listFields: z.array(z.string()).min(1),
  localized: z.boolean().default(false),
  locales: z.array(z.string()).optional(),
  sortable: z.boolean().default(false),
  // Field definitions — we accept any object here, validated in @seed-panel/core
  fields: z.record(z.unknown()),
});

export type CollectionDef = z.infer<typeof collectionSchema>;

/* ============================================================================
   INTEGRATIONS
============================================================================ */

const integrationBase = z.object({ enabled: z.boolean() });

export const integrationsSchema = z.object({
  supabase: integrationBase.extend({
    storageBucket: z.string(),
    publicUrlBase: z.string(),
  }),
  resend: integrationBase.extend({
    fromAddress: z.string().email().optional(),
    replyTo: z.string().email().optional(),
    fromName: z.string().optional(),
    domain: z.string().optional(),
  }),
  aisensy: integrationBase.extend({
    phoneNumber: z.string().optional(),
    displayName: z.string().optional(),
    webhookSecret: z.string().optional(),
  }),
  apify: integrationBase.extend({
    actors: z
      .object({
        googleMaps: z.string(),
        instagram: z.string(),
        websiteContent: z.string(),
      })
      .partial()
      .optional(),
    defaults: z
      .object({
        maxConcurrency: z.number().int().positive(),
        timeoutSeconds: z.number().int().positive(),
        memoryMbytes: z.number().int().positive(),
      })
      .partial()
      .optional(),
  }),
  n8n: integrationBase.extend({
    baseUrl: z.string().url().optional(),
    workflows: z.record(z.string()).optional(),
  }),
  vercel: integrationBase.extend({
    deployHooks: z.record(z.string()).optional(),
  }),
  plausible: integrationBase.extend({
    domain: z.string().optional(),
    apiHost: z.string().optional(),
  }),
  stripe: integrationBase.optional(),
  slack: integrationBase.optional(),
});

export type IntegrationsConfig = z.infer<typeof integrationsSchema>;

/* ============================================================================
   LOCALES
============================================================================ */

export const localeSchema = z.object({
  code: z.string().length(2),
  name: z.string(),
  nativeName: z.string(),
  direction: z.enum(['ltr', 'rtl']),
  dateFormat: z.string(),
  numberFormat: z.object({
    locale: z.string(),
    currency: z.string().length(3),
  }),
});

export const localesSchema = z.object({
  defaultLocale: z.string().length(2),
  available: z.array(localeSchema).min(1),
  showSwitcher: z.boolean().default(true),
});

export type LocaleDef = z.infer<typeof localeSchema>;
export type LocalesConfig = z.infer<typeof localesSchema>;

/* ============================================================================
   VALIDATION ENTRYPOINT
============================================================================ */

/**
 * Call this at app startup to verify all configs are valid.
 * Throws a readable error if any config is malformed.
 */
export function validateConfigs(input: {
  brand: unknown;
  collections: unknown;
  integrations: unknown;
  locales: unknown;
}): {
  brand: BrandConfig;
  collections: CollectionDef[];
  integrations: IntegrationsConfig;
  locales: LocalesConfig;
} {
  return {
    brand: brandSchema.parse(input.brand),
    collections: z.array(collectionSchema).parse(input.collections),
    integrations: integrationsSchema.parse(input.integrations),
    locales: localesSchema.parse(input.locales),
  };
}
