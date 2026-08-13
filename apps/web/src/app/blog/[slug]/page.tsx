import { queries } from '@seed-panel/db';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { SITE_URL } from '@/lib/site';
import { getSeoDefaults } from '@/lib/seo';
import SiteNav from '@/components/site/SiteNav';
import SiteFooter from '@/components/site/SiteFooter';
import '../../germination.css';

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
    <div className="germination">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteNav active="blog" />

      <main id="gmain" className="page">
        <div className="wrap">
          <article className="art">
            <header className="art-hd">
              <a href="/blog" className="crumb">← All posts</a>
              <h1>{title}</h1>
              {excerpt && <p className="art-lead">{excerpt}</p>}
              <div className="art-meta">
                {date && <time>{date}</time>}
                {post.tags.length > 0 && (
                  <div className="chips">
                    {post.tags.map((tag) => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </header>

            {post.coverImageUrl && (
              <figure className="art-cover">
                <Image
                  src={post.coverImageUrl}
                  alt={post.coverImageAlt ?? title}
                  width={720}
                  height={405}
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </figure>
            )}

            {body ? (
              <div className="prose" dangerouslySetInnerHTML={{ __html: body }} />
            ) : (
              <p className="posts-empty">Content coming soon.</p>
            )}

            <div className="art-end">
              <a href="/blog" className="crumb">← All posts</a>
              <a href="/#contact" className="cta">
                <span>Work with us</span><span className="arw" aria-hidden="true">↗</span>
              </a>
            </div>
          </article>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
