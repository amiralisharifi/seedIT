import type { Metadata, Viewport } from 'next';
import { unstable_cache } from 'next/cache';
import { queries } from '@seed-panel/db';
import { SITE_URL } from '@/lib/site';
import { getSeoDefaults } from '@/lib/seo';
import './globals.css';

export async function generateMetadata(): Promise<Metadata> {
  const defaults = await getSeoDefaults();
  const title = `${defaults.siteName} · Web Development, Automation & Design Studio · Dubai, UAE`;
  const shortTitle = `${defaults.siteName} — We make IT on time`;
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: `%s · ${defaults.siteName}`,
    },
    description: defaults.defaultDescription,
    openGraph: {
      type: 'website',
      url: SITE_URL,
      siteName: defaults.siteName,
      title: shortTitle,
      description: defaults.defaultDescription,
      ...(defaults.defaultOgImage ? { images: [{ url: defaults.defaultOgImage }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: shortTitle,
      description: defaults.defaultDescription,
      ...(defaults.defaultOgImage ? { images: [defaults.defaultOgImage] } : {}),
      ...(defaults.twitterHandle
        ? { site: defaults.twitterHandle, creator: defaults.twitterHandle }
        : {}),
    },
  };
}

export const viewport: Viewport = {
  themeColor: '#08090c',
};

const getAnalytics = unstable_cache(
  async () => {
    try {
      return await queries.getSettings('analytics');
    } catch {
      return {} as Record<string, unknown>;
    }
  },
  ['analytics-settings'],
  { revalidate: 3600 },
);

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const analytics = await getAnalytics();

  const ga4Id = (analytics.ga4MeasurementId as string) || '';
  const ga4On = !!analytics.ga4Enabled && ga4Id.startsWith('G-');

  const gtmId = (analytics.gtmContainerId as string) || '';
  const gtmOn = !!analytics.gtmEnabled && gtmId.startsWith('GTM-');

  const gscToken = (analytics.gscEnabled ? analytics.gscVerificationToken as string : '') || '';
  const bwtToken = (analytics.bwtEnabled ? analytics.bwtVerificationToken as string : '') || '';
  const yandex = (analytics.yandexVerification as string) || '';
  const pinterest = (analytics.pinterestVerification as string) || '';
  const facebook = (analytics.facebookDomainVerification as string) || '';
  const ahrefs = (analytics.ahrefsVerification as string) || '';

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/*
          Non-blocking Google Fonts load: stylesheet starts with media="print"
          so the browser doesn't block render on it, then a tiny inline script
          flips it to media="all" after parse. Saves ~230ms of render-block
          on every page. <noscript> is a fallback for users without JS.
        */}
        <link
          rel="preload"
          as="style"
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&family=Onest:wght@300;400;500;600&display=swap"
        />
        <link
          rel="stylesheet"
          media="print"
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&family=Onest:wght@300;400;500;600&display=swap"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `for (const l of document.querySelectorAll('link[rel="stylesheet"][media="print"]')) l.media = 'all';`,
          }}
        />
        <noscript>
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&family=Onest:wght@300;400;500;600&display=swap"
          />
        </noscript>

        {/* Webmaster verification tags */}
        {gscToken && <meta name="google-site-verification" content={gscToken} />}
        {bwtToken && <meta name="msvalidate.01" content={bwtToken} />}
        {yandex && <meta name="yandex-verification" content={yandex} />}
        {pinterest && <meta name="p:domain_verify" content={pinterest} />}
        {facebook && <meta name="facebook-domain-verification" content={facebook} />}
        {ahrefs && <meta name="ahrefs-site-verification" content={ahrefs} />}

        {/* Google Tag Manager — head snippet */}
        {gtmOn && (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`,
            }}
          />
        )}

        {/* Google Analytics 4 */}
        {ga4On && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga4Id}');`,
              }}
            />
          </>
        )}
      </head>
      <body>
        {/* Google Tag Manager — body noscript fallback */}
        {gtmOn && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}
        {children}
      </body>
    </html>
  );
}
