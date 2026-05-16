import { queries } from '@seed-panel/db';
import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_URL } from '@/lib/site';
import { getSeoDefaults } from '@/lib/seo';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const defaults = await getSeoDefaults();
  const title = `Blog · ${defaults.siteName}`;
  const description = `Insights on web development, automation and design from the ${defaults.siteName} studio in Dubai.`;
  const url = `${SITE_URL}/blog`;
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
      ...(defaults.defaultOgImage ? { images: [{ url: defaults.defaultOgImage }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(defaults.defaultOgImage ? { images: [defaults.defaultOgImage] } : {}),
      ...(defaults.twitterHandle
        ? { site: defaults.twitterHandle, creator: defaults.twitterHandle }
        : {}),
    },
  };
}

function getEn(content: Record<string, Record<string, unknown>>) {
  return (content?.en ?? {}) as Record<string, string>;
}

export default async function BlogPage() {
  let posts: Awaited<ReturnType<typeof queries.listPublishedPosts>> = [];
  let dbError: string | null = null;

  try {
    posts = await queries.listPublishedPosts(50);
  } catch (e) {
    dbError = e instanceof Error ? e.message : String(e);
  }

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
            <a href="/blog" className="active">Blog</a>
            <a href="/#contact" className="nav-cta">
              Book a call <span className="arrow">→</span>
            </a>
          </div>
        </div>
      </nav>

      <main style={{ paddingTop: '80px', minHeight: '100vh' }}>
        <div className="container" style={{ paddingTop: '4rem', paddingBottom: '6rem' }}>
          <div style={{ marginBottom: '3rem' }}>
            <div className="section-label">From the studio</div>
            <h1 className="section-title" style={{ maxWidth: '600px' }}>
              Writing on web, automation &amp; <em className="grad">design</em>.
            </h1>
          </div>

          {dbError ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontFamily: 'monospace' }}>
              DB error: {dbError}
            </p>
          ) : posts.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
              No posts yet — check back soon.
            </p>
          ) : (
            <div style={{ display: 'grid', gap: '2px' }}>
              {posts.map((post) => {
                const en = getEn(post.content);
                const title = en.title ?? post.slug;
                const excerpt = en.excerpt ?? '';
                const date = post.publishedAt
                  ? new Date(post.publishedAt).toLocaleDateString('en-AE', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : '';

                return (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    style={{ textDecoration: 'none', display: 'block' }}
                  >
                    <article
                      style={{
                        padding: '2rem 0',
                        borderBottom: '1px solid var(--border)',
                        display: 'grid',
                        gridTemplateColumns: '1fr auto',
                        gap: '1rem',
                        alignItems: 'start',
                        cursor: 'pointer',
                      }}
                    >
                      <div>
                        <h2
                          style={{
                            fontSize: '1.25rem',
                            fontFamily: 'var(--font-display)',
                            fontWeight: 600,
                            color: 'var(--text)',
                            marginBottom: '0.5rem',
                          }}
                        >
                          {title}
                        </h2>
                        {excerpt && (
                          <p
                            style={{
                              color: 'var(--text-muted)',
                              fontSize: '0.95rem',
                              lineHeight: 1.6,
                              maxWidth: '680px',
                            }}
                          >
                            {excerpt}
                          </p>
                        )}
                        {post.tags.length > 0 && (
                          <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {post.tags.map((tag) => (
                              <span key={tag} className="tag">{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <time
                        style={{
                          color: 'var(--text-muted)',
                          fontSize: '0.8rem',
                          fontFamily: 'var(--font-mono)',
                          whiteSpace: 'nowrap',
                          paddingTop: '0.25rem',
                        }}
                      >
                        {date}
                      </time>
                    </article>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <div className="footer-bottom">
            <div className="footer-meta">© 2026 SEED IT · Dubai, UAE</div>
            <a href="/" className="footer-back">← Back to home</a>
          </div>
        </div>
      </footer>
    </>
  );
}
