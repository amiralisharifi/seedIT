import { asc, eq, sql } from 'drizzle-orm';
import { db } from '../client';
import { users } from '../schema';

/**
 * Resolve a user id from an email. Case-insensitive because callers outside the
 * app (n8n, scripts) type addresses by hand. Returns null when there's no match.
 */
export async function findUserIdByEmail(email: string): Promise<string | null> {
  const [row] = await db
    .select({ id: users.id })
    .from(users)
    .where(sql`lower(${users.email}) = lower(${email})`)
    .limit(1);
  return row?.id ?? null;
}

/** Whether a user id exists. Used to validate references before an insert. */
export async function userIdExists(id: string): Promise<boolean> {
  const [row] = await db.select({ id: users.id }).from(users).where(eq(users.id, id)).limit(1);
  return Boolean(row);
}

export async function listUsers() {
  return db
    .select({
      id: users.id,
      email: users.email,
      fullName: users.fullName,
      avatarUrl: users.avatarUrl,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
      lastLoginAt: users.lastLoginAt,
    })
    .from(users)
    .orderBy(asc(users.createdAt));
}

export async function setUserActive(id: string, isActive: boolean) {
  await db.update(users).set({ isActive }).where(eq(users.id, id));
}

export async function setUserRole(id: string, role: string) {
  await db.update(users).set({ role }).where(eq(users.id, id));
}
