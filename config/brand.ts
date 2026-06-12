/**
 * BRAND CONFIG
 * ============
 * This is the file that makes seed-panel "yours". When forking for a new
 * deployment, this is one of three or four files you actually edit.
 *
 * Everything visual — logo, colors, business name, support email — reads from
 * here. No brand string should be hardcoded anywhere else in the codebase.
 *
 * The shape is validated by `@seed-panel/config` at startup; if you remove a
 * required field or use an invalid color, the app will fail to boot rather
 * than render a half-broken UI.
 */

import type { BrandConfig } from '@seed-panel/config';

export const brand: BrandConfig = {
  /* ---------- Identity ---------- */
  name: 'SEED IT',
  shortName: 'SEED',                       // for tight spaces (mobile nav, favicon text)
  tagline: 'We make IT on time',
  taglineAr: 'نصنع التقنية في وقتها',

  /* ---------- Logo ---------- */
  // Paths are relative to apps/panel/public/
  logo: {
    light: '/brand/logo.svg',              // logo for light backgrounds
    dark: '/brand/logo-dark.svg',          // logo for dark backgrounds
    mark: '/brand/mark.svg',               // square icon for favicon, app icon
    width: 110,                            // intrinsic width for layout
    height: 32,
  },
  favicon: '/brand/favicon.svg',

  /* ---------- Colors ---------- */
  // Tailwind reads these in apps/panel/app/globals.css via CSS variables.
  // Use HSL components (no commas) so Tailwind's color/opacity modifiers work.
  // Example: "120 30% 50%" → hsl(120 30% 50% / <alpha>)
  colors: {
    // Primary brand color — used for primary buttons, links, focused inputs
    primary: '264 70% 51%',                // SEED IT purple (#6c2bd9)
    primaryForeground: '0 0% 100%',

    // Secondary / accent — used for highlights, decorations
    accent: '187 76% 48%',                 // SEED IT cyan (#1ec4d6)
    accentForeground: '222 47% 11%',

    // Sidebar / chrome
    sidebar: '224 17% 11%',                // dark
    sidebarForeground: '210 20% 90%',
    sidebarBorder: '222 13% 18%',
  },

  /* ---------- Typography ---------- */
  // Google Fonts names. Loaded automatically in the root layout.
  fonts: {
    sans: 'Inter',                         // body text
    display: 'Bricolage Grotesque',        // headings
    arabic: 'Tajawal',                     // Arabic text
    mono: 'JetBrains Mono',                // code, IDs, technical labels
  },

  /* ---------- Business info ---------- */
  business: {
    legalName: 'SEED IT FZ-LLC',
    address: 'Business Bay, Dubai, UAE',
    city: 'Dubai',
    country: 'United Arab Emirates',
    supportEmail: 'hello@seedit.ae',
    salesEmail: 'sales@seedit.ae',
    phone: '+971 50 000 0000',
    whatsapp: '+971 50 000 0000',          // can differ from phone
    hours: 'Sun–Thu · 9:00–18:00 GST',     // default — override in Settings → Contact
    tradeLicense: '',                       // fill when you have one
    vatTrn: '',
  },

  /* ---------- Social ---------- */
  social: {
    instagram: 'seedit.ae',
    linkedin: 'company/seedit-ae',
    x: '',
  },

  /* ---------- Default locale / behavior ---------- */
  defaultLocale: 'en',                      // panel UI language
  timezone: 'Asia/Dubai',
  currency: 'AED',

  /* ---------- Optional decoration ---------- */
  // A meta line shown at the bottom of public emails ("Powered by SEED IT").
  // Set to null to hide.
  poweredBy: null,
};
