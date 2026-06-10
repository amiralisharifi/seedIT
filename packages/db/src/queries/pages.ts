import { and, eq, inArray, isNull } from 'drizzle-orm';
import { db } from '../client';
import { pages } from '../schema';

// Look up a published page by its public path. Tolerates the path being stored
// with or without a leading slash (the editor's helpText says "/about", but be
// forgiving), so `/news` and `news` both resolve.
export async function getPageByPath(rawPath: string) {
  const trimmed = rawPath.replace(/^\/+/, '').replace(/\/+$/, '');
  const candidates = [`/${trimmed}`, trimmed];

  const [page] = await db
    .select()
    .from(pages)
    .where(
      and(
        inArray(pages.path, candidates),
        eq(pages.status, 'published'),
        isNull(pages.deletedAt),
      ),
    )
    .limit(1);

  return page ?? null;
}
