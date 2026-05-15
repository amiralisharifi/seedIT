import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-revalidate-secret');
  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { path } = (await request.json()) as { path?: string };

  revalidatePath(path ?? '/blog');
  revalidatePath('/blog/[slug]', 'page');

  return NextResponse.json({ revalidated: true, path: path ?? '/blog' });
}
