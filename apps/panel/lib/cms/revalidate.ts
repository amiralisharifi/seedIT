/**
 * Public-site cache flushing after a CMS write.
 *
 * Lives here rather than in the form action because a `'use server'` module can
 * only export async server actions — a shared helper exported from one would be
 * turned into a callable RPC endpoint. Both the admin form action and the n8n
 * content API import this.
 */

function getPublicRevalidateUrl(): string | null {
  const publicSiteUrl = process.env.PUBLIC_SITE_URL;
  if (!publicSiteUrl) return null;

  try {
    return new URL('/api/revalidate', publicSiteUrl).toString();
  } catch {
    console.warn('PUBLIC_SITE_URL is not a valid URL; skipping public site revalidation.');
    return null;
  }
}

/**
 * Flush the public site's cache for a collection write. No-op unless the
 * collection actually has public pages and the revalidate env is configured —
 * a missing secret is a deployment choice, not an error, so this never throws.
 */
export async function revalidatePublicContent(
  collectionSlug: string,
  slug?: unknown,
): Promise<void> {
  if (collectionSlug !== 'blog_posts') return;

  const revalidateUrl = getPublicRevalidateUrl();
  const secret = process.env.REVALIDATE_SECRET;
  if (!revalidateUrl || !secret) return;

  const paths = ['/blog'];
  if (typeof slug === 'string' && slug.length > 0) {
    paths.push(`/blog/${slug}`);
  }

  await Promise.allSettled(
    paths.map(async (path) => {
      const response = await fetch(revalidateUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-revalidate-secret': secret,
        },
        body: JSON.stringify({ path }),
        signal: AbortSignal.timeout(5_000),
      });

      if (!response.ok) {
        console.warn(`Public site revalidation failed for ${path}: ${response.status}`);
      }
    }),
  );
}
