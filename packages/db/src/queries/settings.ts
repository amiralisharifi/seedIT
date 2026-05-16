import { eq } from 'drizzle-orm';
import { db } from '../client';
import { siteSettings } from '../schema';

export async function getSettings(key: string): Promise<Record<string, unknown>> {
  const [row] = await db.select().from(siteSettings).where(eq(siteSettings.key, key)).limit(1);
  return (row?.value as Record<string, unknown>) ?? {};
}

export async function saveSettings(key: string, value: Record<string, unknown>): Promise<void> {
  await db
    .insert(siteSettings)
    .values({ key, value, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: siteSettings.key,
      set: { value, updatedAt: new Date() },
    });
}
