/**
 * LOCALES CONFIG
 * ==============
 * Which languages this deployment supports — both for the panel UI itself
 * (the labels you see when logged in) and for content (the things you author).
 *
 * For SEED IT we support English + Arabic.
 * A client in a single-language market would just have one entry here.
 */

import type { LocalesConfig } from '@seed-panel/config';

export const locales: LocalesConfig = {
  // The default panel UI language
  defaultLocale: 'en',

  // All supported locales
  available: [
    {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      direction: 'ltr',
      dateFormat: 'DD MMM YYYY',
      // Used when the panel renders prices, numbers
      numberFormat: { locale: 'en-AE', currency: 'AED' },
    },
    {
      code: 'ar',
      name: 'Arabic',
      nativeName: 'العربية',
      direction: 'rtl',
      dateFormat: 'DD MMM YYYY',
      numberFormat: { locale: 'ar-AE', currency: 'AED' },
    },
  ],

  // Whether to show locale switcher in the panel header
  // Disable if you're a single-user deployment and don't want clutter
  showSwitcher: true,
};
