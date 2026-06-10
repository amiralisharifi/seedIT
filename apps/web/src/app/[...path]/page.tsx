import { queries } from '@seed-panel/db';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SITE_URL } from '@/lib/site';
import { getSeoDefaults } from '@/lib/seo';
import { BlockRenderer } from '@/components/blocks/BlockRenderer';

// Public renderer for schema-driven `pages`. Catch-all, so any unmatched path
// (e.g. /news, /company/about) is looked up by path and rendered from its
// `sections` blocks. Static routes (/, /blog, /d, /new, /api) take precedence;
// anything with no published page falls through to notFound().
export const revalidate = 3600;

type Props = { params: Promise<{ path: string[] }> };

function toPath(segments: string[]): string {
  return '/' + segments.map((s) => decodeURIComponent(s)).join('/');
}

function getEn(content: unknown): Record<string, string> {
  const c = content as { en?: Record<string, string> } | null | undefined;
  return c?.en ?? {};
}

function canonicalFor(path: string): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { path } = await params;
  try {
    const page = await queries.getPageByPath(toPath(path));
    if (!page) return {};
    const en = getEn(page.content);
    const defaults = await getSeoDefaults();
    const title = page.seoTitle || en.title || defaults.siteName;
    const description = page.seoDescription || defaults.defaultDescription;
    const url = canonicalFor(page.path);
    const image = defaults.defaultOgImage;
    return {
      title,
      description,
      alternates: { canonical: url },
      openGraph: {
        type: 'website',
        url,
        title,
        description,
        siteName: defaults.siteName,
        ...(image ? { images: [{ url: image }] } : {}),
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        ...(image ? { images: [image] } : {}),
      },
    };
  } catch {
    return {};
  }
}

export default async function DynamicPage({ params }: Props) {
  const { path } = await params;

  let page: Awaited<ReturnType<typeof queries.getPageByPath>>;
  try {
    page = await queries.getPageByPath(toPath(path));
  } catch {
    notFound();
  }
  if (!page) notFound();

  return (
    <>
      <nav className="nav scrolled" id="nav">
        <div className="container nav-inner">
          <a href="/" className="logo" aria-label="SEED IT — home">
            <span className="logo-text">
              <span className="name">SEED IT</span>
              <span className="tag">We make IT on time</span>
            </span>
          </a>
          <div className="nav-links">
            <a href="/#services">Services</a>
            <a href="/#approach">Approach</a>
            <a href="/blog">Blog</a>
            <a href="/#contact" className="nav-cta">
              Book a call <span className="arrow">→</span>
            </a>
          </div>
        </div>
      </nav>

      <main style={{ paddingTop: '80px', minHeight: '60vh' }}>
        <BlockRenderer sections={page.sections} />
      </main>
    </>
  );
}
