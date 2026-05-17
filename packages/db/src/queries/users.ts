import { asc, eq } from 'drizzle-orm';
import { db } from '../client';
import { users } from '../schema';

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
