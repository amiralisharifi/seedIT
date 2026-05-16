import { NextRequest, NextResponse } from 'next/server';
import { queries } from '@seed-panel/db';

export async function POST(req: NextRequest) {
  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { name, email, phone, company, service, message } = body;
  if (!name || !email) {
    return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
  }

  try {
    await queries.createInquiry({ name, email, phone, company, service, message });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  // Try to send notification email via Resend if key is configured
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    const notifyEmail = process.env.NOTIFY_EMAIL || 'hello@seedit.ae';
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'SEED IT Website <noreply@seedit.ae>',
          to: [notifyEmail],
          subject: `New inquiry from ${name}`,
          html: `
            <h2>New contact form submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
            ${company ? `<p><strong>Company:</strong> ${company}</p>` : ''}
            ${service ? `<p><strong>Service:</strong> ${service}</p>` : ''}
            ${message ? `<p><strong>Message:</strong><br>${message.replace(/\n/g, '<br>')}</p>` : ''}
          `,
        }),
      });
    } catch {
      // Email failure is non-fatal — inquiry is already saved to DB
    }
  }

  return NextResponse.json({ ok: true });
}
