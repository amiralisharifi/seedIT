/**
 * Resend wrapper.
 *
 * One function: sendEmail(). Anything more complex (templates, batches) we
 * add as we need it. Resend's own SDK is fine for direct use too, but
 * wrapping it gives us a place to add logging, error tracking, retry logic
 * later without touching call sites.
 */

import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  /** Plain text body */
  text?: string;
  /** HTML body — use one of text or html */
  html?: string;
  from?: string;
  replyTo?: string;
  /** For mapping replies back to outreach rows */
  tags?: { name: string; value: string }[];
}

export async function sendEmail(params: SendEmailParams) {
  if (!resend) {
    throw new Error('Resend is not configured. Set RESEND_API_KEY.');
  }

  const result = await resend.emails.send({
    from: params.from ?? 'hello@seedit.ae',
    to: params.to,
    subject: params.subject,
    text: params.text ?? '',
    html: params.html,
    replyTo: params.replyTo,
    tags: params.tags,
  });

  return result;
}
