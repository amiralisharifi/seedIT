/**
 * AiSensy webhook receiver.
 *
 * AiSensy POSTs events here for inbound messages, delivery receipts, etc.
 * Configure the URL in AiSensy dashboard → Webhooks:
 *   https://admin.seedit.ae/api/webhooks/aisensy?secret=<AISENSY_WEBHOOK_SECRET>
 *
 * The payload shape varies by event; we accept loosely and extract what we
 * can. Inbound text/audio/image messages create rows in `messages` + flip
 * the most recent outreach to `replied`. Unknown events are logged + ignored.
 */

import { NextResponse } from 'next/server';
import { queries } from '@seed-panel/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function pickFirst<T>(...xs: (T | undefined | null)[]): T | undefined {
  for (const x of xs) {
    if (x !== undefined && x !== null) return x;
  }
  return undefined;
}

type Payload = Record<string, unknown>;

function authOk(req: Request, url: URL): boolean {
  const expected = process.env.AISENSY_WEBHOOK_SECRET;
  if (!expected) {
    // No secret set → reject so we don't accept arbitrary inbound traffic
    return false;
  }
  const fromHeader =
    req.headers.get('x-aisensy-secret') ??
    req.headers.get('x-webhook-secret') ??
    null;
  const fromQuery = url.searchParams.get('secret');
  return fromHeader === expected || fromQuery === expected;
}

function extractInbound(body: Payload): {
  from?: string;
  text?: string;
  providerMessageId?: string;
  occurredAt?: Date;
} | null {
  // AiSensy payloads commonly nest under "data" or "message" or are flat.
  const root = (body.data as Payload) ?? (body.message as Payload) ?? body;
  const eventType = pickFirst(body.event, body.type, root.event, root.type) as
    | string
    | undefined;

  // Only handle inbound text-ish events; skip delivery receipts here
  if (eventType && !/inbound|message|received|reply/i.test(eventType)) {
    return null;
  }

  const from = pickFirst(
    root.from as string,
    root.phone as string,
    root.sender as string,
    (root.user as Payload | undefined)?.phone as string,
    (root.contact as Payload | undefined)?.wa_id as string,
  );

  // Body can live in many places depending on AiSensy + Meta type
  const text = pickFirst(
    (root.text as Payload | undefined)?.body as string,
    root.message as string,
    root.body as string,
    root.content as string,
    (root.payload as Payload | undefined)?.text as string,
  );

  const providerMessageId = pickFirst(
    root.messageId as string,
    root.id as string,
    (root.message as Payload | undefined)?.id as string,
  );

  const tsRaw = pickFirst(
    root.timestamp as string | number,
    root.time as string | number,
    root.createdAt as string,
  );
  let occurredAt: Date | undefined;
  if (typeof tsRaw === 'number') {
    occurredAt = new Date(tsRaw > 1e12 ? tsRaw : tsRaw * 1000);
  } else if (typeof tsRaw === 'string') {
    const parsed = new Date(tsRaw);
    if (!Number.isNaN(parsed.getTime())) occurredAt = parsed;
  }

  if (!from || !text) return null;
  return { from, text, providerMessageId, occurredAt };
}

export async function POST(req: Request) {
  const url = new URL(req.url);

  if (!authOk(req, url)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let body: Payload;
  try {
    body = (await req.json()) as Payload;
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const inbound = extractInbound(body);
  if (!inbound) {
    // Accept but ignore — likely a delivery receipt or status event
    return NextResponse.json({ ok: true, handled: false });
  }

  let business;
  try {
    business = await queries.findBusinessByPhone(inbound.from!);
  } catch (e) {
    console.error('aisensy webhook: lookup failed', e);
    return NextResponse.json({ error: 'lookup failed' }, { status: 500 });
  }

  if (!business) {
    // Reply from an unknown number — log and accept so AiSensy doesn't retry
    console.warn('aisensy webhook: no business matches phone', inbound.from);
    return NextResponse.json({ ok: true, handled: false, reason: 'unknown_phone' });
  }

  try {
    await queries.recordInboundMessage({
      businessId: business.id,
      channel: 'whatsapp',
      body: inbound.text!,
      providerMessageId: inbound.providerMessageId,
      occurredAt: inbound.occurredAt,
    });
  } catch (e) {
    console.error('aisensy webhook: insert failed', e);
    return NextResponse.json({ error: 'insert failed' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, businessId: business.id });
}

// Some platforms verify reachability with GET. Respond 200 so config UI is happy.
export async function GET() {
  return NextResponse.json({ ok: true, hint: 'POST inbound events here' });
}
