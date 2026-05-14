import type { Metadata, Viewport } from 'next';
import { brand, locales } from '@/config';
import { buildBrandCss, buildFontsUrl } from '@/lib/brand-css';
import './globals.css';

/* ----------------------------------------------------------------
   Metadata — sourced from brand config, never hardcoded
---------------------------------------------------------------- */

export const metadata: Metadata = {
  title: {
    default: `${brand.name} — Admin`,
    template: `%s · ${brand.name}`,
  },
  description: `${brand.name} admin panel — manage leads, demos, content, and outreach.`,
  // Admin panels should never be indexed
  robots: { index: false, follow: false },
  icons: {
    icon: brand.favicon,
    apple: brand.logo.mark,
  },
};

export const viewport: Viewport = {
  themeColor: '#08090c',
  width: 'device-width',
  initialScale: 1,
};

/* ----------------------------------------------------------------
   Layout
---------------------------------------------------------------- */

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Default to the brand's default locale + LTR. Locale switching happens
  // inside the panel via cookies; the panel layout reads it and updates `dir`.
  const defaultLocaleObj = locales.available.find((l) => l.code === locales.defaultLocale);
  const dir = defaultLocaleObj?.direction ?? 'ltr';

  return (
    <html lang={locales.defaultLocale} dir={dir}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href={buildFontsUrl(brand)} rel="stylesheet" />
        {/* Inject brand colors as CSS variables */}
        <style dangerouslySetInnerHTML={{ __html: buildBrandCss(brand) }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
