import { desc, eq } from 'drizzle-orm';
import { db } from '../client';
import { contactInquiries } from '../schema';

export interface NewInquiry {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  service?: string;
  message?: string;
}

export async function createInquiry(data: NewInquiry) {
  const [row] = await db.insert(contactInquiries).values(data).returning();
  return row;
}

export async function listInquiries(limit = 50) {
  return db.select().from(contactInquiries).orderBy(desc(contactInquiries.createdAt)).limit(limit);
}

export async function markInquiryRead(id: string) {
  await db.update(contactInquiries).set({ isRead: true }).where(eq(contactInquiries.id, id));
}
