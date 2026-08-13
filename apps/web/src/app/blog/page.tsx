import { queries } from '@seed-panel/db';
import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_URL } from '@/lib/site';
import { getSeoDefaults } from '@/lib/seo';
import SiteNav from '@/components/site/SiteNav';
import SiteFooter from '@/components/site/SiteFooter';
import '../germination.css';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const defaults = await getSeoDefaults();
  // The root layout's title template appends "· siteName"; the plain segment
  // title avoids a doubled suffix. OG/Twitter take the full string directly.
  const title = `Blog · ${defaults.siteName}`;
  const description = `Insights on web development, automation and design from the ${defaults.siteName} studio in Dubai.`;
  const url = `${SITE_URL}/blog`;
  return {
    title: 'Blog',
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
    <div className="germination">
      <SiteNav active="blog" />

      <main id="gmain" className="page">
        <div className="wrap">
          <header className="page-hd">
            <p className="eyebrow">From the studio</p>
            <h1>Writing on web, automation &amp; <em>design</em>.</h1>
          </header>

          {dbError ? (
            <p className="posts-empty">Couldn&apos;t load posts — {dbError}</p>
          ) : posts.length === 0 ? (
            <p className="posts-empty">No posts yet — check back soon.</p>
          ) : (
            <div>
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
                  <Link key={post.id} href={`/blog/${post.slug}`} className="post-row">
                    <article className="post-in">
                      <div>
                        <h2>{title}</h2>
                        {excerpt && <p className="post-exc">{excerpt}</p>}
                        {post.tags.length > 0 && (
                          <div className="chips">
                            {post.tags.map((tag) => (
                              <span key={tag} className="tag">{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="post-side">
                        {date && <time className="post-date">{date}</time>}
                        <span className="post-go" aria-hidden="true">↗</span>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
