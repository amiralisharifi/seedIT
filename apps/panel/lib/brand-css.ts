/**
 * Applies the brand config to the page by generating a CSS string that sets
 * the CSS variables consumed by Tailwind (see app/globals.css). Injected as
 * an inline <style> in the root layout.
 *
 * This is the bridge that makes config/brand.ts changes visible without
 * recompiling anything. Edit brand.ts, restart dev server, see new colors.
 */

import type { BrandConfig } from '@seed-panel/config';

export function buildBrandCss(brand: BrandConfig): string {
  return `:root {
    --color-primary: ${brand.colors.primary};
    --color-primary-foreground: ${brand.colors.primaryForeground};
    --color-accent: ${brand.colors.accent};
    --color-accent-foreground: ${brand.colors.accentForeground};
    --color-sidebar: ${brand.colors.sidebar};
    --color-sidebar-foreground: ${brand.colors.sidebarForeground};
    --color-sidebar-border: ${brand.colors.sidebarBorder};
    --font-sans: '${brand.fonts.sans}', system-ui, sans-serif;
    --font-display: '${brand.fonts.display}', serif;
    --font-arabic: '${brand.fonts.arabic}', system-ui, sans-serif;
    --font-mono: '${brand.fonts.mono}', monospace;
  }`;
}

/**
 * Builds a Google Fonts URL for the four brand fonts.
 * Loaded in <head> via the root layout.
 */
export function buildFontsUrl(brand: BrandConfig): string {
  // Convert font name to URL family slug (replace spaces with +)
  const fams = [
    `${brand.fonts.sans.replace(/ /g, '+')}:wght@400;500;600;700`,
    `${brand.fonts.display.replace(/ /g, '+')}:wght@400;500;600;700`,
    `${brand.fonts.arabic.replace(/ /g, '+')}:wght@400;500;700`,
    `${brand.fonts.mono.replace(/ /g, '+')}:wght@400;500`,
  ];
  return `https://fonts.googleapis.com/css2?${fams.map((f) => `family=${f}`).join('&')}&display=swap`;
}
