/**
 * Cache flush endpoint called by the admin panel after a write that needs to
 * appear on the public site immediately. Supports either a path (next-page
 * level) or a tag (unstable_cache tag).
 *
 * POST /api/revalidate
 *   headers: x-revalidate-secret: <REVALIDATE_SECRET>
 *   body: { path?: string; tag?: string }
 */

import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-revalidate-secret');
  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { path, tag } = (await request.json()) as { path?: string; tag?: string };

  if (tag) {
    revalidateTag(tag);
  }

  if (path) {
    revalidatePath(path);
    // Blog post detail pages share a route segment — flush the dynamic group too
    if (path.startsWith('/blog/')) revalidatePath('/blog/[slug]', 'page');
  } else if (!tag) {
    // Backwards-compatible default behaviour for existing blog callers
    revalidatePath('/blog');
    revalidatePath('/blog/[slug]', 'page');
  }

  return NextResponse.json({ revalidated: true, path: path ?? null, tag: tag ?? null });
}
