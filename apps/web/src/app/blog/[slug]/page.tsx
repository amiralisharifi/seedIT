import { queries } from '@seed-panel/db';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { SITE_URL } from '@/lib/site';
import { getSeoDefaults } from '@/lib/seo';

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

function getEn(content: Record<string, Record<string, unknown>>) {
  return (content?.en ?? {}) as Record<string, string>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await queries.getPostBySlug(slug);
    if (!post) return {};
    const en = getEn(post.content);
    const defaults = await getSeoDefaults();
    const title = post.seoTitle ?? en.title ?? slug;
    const description = post.seoDescription ?? en.excerpt ?? defaults.defaultDescription;
    const url = `${SITE_URL}/blog/${slug}`;
    const image = post.coverImageUrl || defaults.defaultOgImage;
    return {
      title,
      description,
      robots: post.seoNoindex ? 'noindex' : undefined,
      alternates: { canonical: url },
      openGraph: {
        type: 'article',
        url,
        title,
        description,
        siteName: defaults.siteName,
        ...(image ? { images: [{ url: image }] } : {}),
        ...(post.publishedAt ? { publishedTime: post.publishedAt.toISOString() } : {}),
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        ...(image ? { images: [image] } : {}),
        ...(defaults.twitterHandle
          ? { site: defaults.twitterHandle, creator: defaults.twitterHandle }
          : {}),
      },
    };
  } catch {
    return {};
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  let post: Awaited<ReturnType<typeof queries.getPostBySlug>>;
  try {
    post = await queries.getPostBySlug(slug);
  } catch {
    notFound();
  }

  if (!post) notFound();

  // Fire-and-forget view count increment
  queries.incrementPostViewCount(post.id).catch(() => {});

  const en = getEn(post.content);
  const title = en.title ?? post.slug;
  const body = en.body ?? '';
  const excerpt = en.excerpt ?? '';
  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-AE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  const defaults = await getSeoDefaults();
  const canonicalUrl = `${SITE_URL}/blog/${slug}`;
  const articleImage = post.coverImageUrl || defaults.defaultOgImage || undefined;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: excerpt || post.seoDescription || defaults.defaultDescription,
    ...(articleImage ? { image: [articleImage] } : {}),
    datePublished: post.publishedAt
      ? new Date(post.publishedAt).toISOString()
      : new Date(post.createdAt).toISOString(),
    dateModified: new Date(post.updatedAt).toISOString(),
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
    publisher: {
      '@type': 'Organization',
      name: defaults.siteName,
      ...(defaults.defaultOgImage
        ? { logo: { '@type': 'ImageObject', url: defaults.defaultOgImage } }
        : {}),
    },
    author: { '@type': 'Organization', name: defaults.siteName },
    ...(post.tags.length > 0 ? { keywords: post.tags.join(', ') } : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
            <a href="/blog" className="active">Blog</a>
            <a href="/#contact" className="nav-cta">
              Book a call <span className="arrow">→</span>
            </a>
          </div>
        </div>
      </nav>

      <main style={{ paddingTop: '80px' }}>
        <article style={{ maxWidth: '720px', margin: '0 auto', padding: '4rem 1.5rem 6rem' }}>
          {/* Header */}
          <header style={{ marginBottom: '2.5rem' }}>
            <a
              href="/blog"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: 'var(--text-muted)',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-mono)',
                textDecoration: 'none',
                marginBottom: '1.5rem',
              }}
            >
              ← All posts
            </a>
            {post.tags.length > 0 && (
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                {post.tags.map((tag) => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
            )}
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
                fontWeight: 700,
                lineHeight: 1.15,
                marginBottom: '1rem',
              }}
            >
              {title}
            </h1>
            {excerpt && (
              <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1rem' }}>
                {excerpt}
              </p>
            )}
            <time
              style={{
                fontSize: '0.8rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)',
              }}
            >
              {date}
            </time>
          </header>

          {/* Cover image */}
          {post.coverImageUrl && (
            <div style={{ marginBottom: '2.5rem', borderRadius: '12px', overflow: 'hidden' }}>
              <Image
                src={post.coverImageUrl}
                alt={post.coverImageAlt ?? title}
                width={720}
                height={405}
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </div>
          )}

          {/* Body */}
          {body ? (
            <div
              className="prose"
              dangerouslySetInnerHTML={{ __html: body }}
              style={{
                color: 'var(--text)',
                lineHeight: 1.8,
                fontSize: '1.05rem',
              }}
            />
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>Content coming soon.</p>
          )}

          {/* Footer */}
          <div
            style={{
              marginTop: '4rem',
              paddingTop: '2rem',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <a
              href="/blog"
              style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textDecoration: 'none' }}
            >
              ← All posts
            </a>
            <a href="/#contact" className="btn-primary" style={{ fontSize: '0.9rem' }}>
              Work with us →
            </a>
          </div>
        </article>
      </main>
    </>
  );
}
