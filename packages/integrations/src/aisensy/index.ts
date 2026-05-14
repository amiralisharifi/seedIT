/**
 * AiSensy WhatsApp Business API wrapper.
 *
 * AiSensy uses pre-approved Meta templates for outbound. We send by referring
 * to a template name + the variable values. Once a recipient replies, we have
 * a 24-hour "session window" where we can send anything (no template needed).
 *
 * Docs: https://wiki.aisensy.com/article/sgmlchaqyt-api-documentation
 */

const apiKey = process.env.AISENSY_API_KEY;

const API_BASE = 'https://backend.aisensy.com/campaign/t1/api/v2';

export interface SendTemplateParams {
  /** E.164 phone number, no leading + (e.g. "971501234567") */
  to: string;
  /** Approved campaign name in AiSensy */
  campaignName: string;
  /** Recipient's name — required by AiSensy's schema */
  userName: string;
  /** Template variables in the order Meta approved them */
  templateParams: string[];
  /** Optional: media URL (image, video, document) if the template has a header */
  media?: { url: string; filename?: string };
  /** Optional: custom tags AiSensy stores against the message */
  tags?: string[];
  /** Optional: custom attributes (key/value) */
  attributes?: Record<string, string>;
}

export interface AiSensyResponse {
  success: boolean;
  message?: string;
  data?: { messageId?: string };
}

export async function sendWhatsAppTemplate(params: SendTemplateParams): Promise<AiSensyResponse> {
  if (!apiKey) {
    throw new Error('AISENSY_API_KEY is not set');
  }

  const body = {
    apiKey,
    campaignName: params.campaignName,
    destination: params.to,
    userName: params.userName,
    templateParams: params.templateParams,
    source: 'seed-panel',
    ...(params.media && { media: params.media }),
    ...(params.tags && { tags: params.tags }),
    ...(params.attributes && { attributes: params.attributes }),
  };

  const res = await fetch(`${API_BASE}/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  return res.json();
}

/**
 * Within an open 24-hour session, send a free-form message (no template).
 * Useful for follow-ups within an active conversation.
 */
export async function sendWhatsAppSession(to: string, text: string): Promise<AiSensyResponse> {
  if (!apiKey) throw new Error('AISENSY_API_KEY is not set');

  const res = await fetch(`${API_BASE}/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      apiKey,
      destination: to,
      message: text,
      type: 'text',
      source: 'seed-panel',
    }),
  });

  return res.json();
}
