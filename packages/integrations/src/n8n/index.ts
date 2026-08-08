/**
 * n8n integration.
 *
 * The admin doesn't poll n8n or know what's running — it just POSTs to
 * webhook URLs and n8n does the work. n8n calls back to /api/n8n/* routes
 * with updates.
 *
 * Both directions are authenticated by a shared secret in a header.
 */

const baseUrl = process.env.N8N_WEBHOOK_BASE ?? 'https://ayvan.me/webhook';
const sharedSecret = process.env.N8N_SHARED_SECRET;

/** Trigger a workflow by hitting its webhook URL. */
export async function triggerN8nWorkflow<TInput extends object, TResponse = unknown>(
  workflowPath: string, // e.g. '/scrape' or '/send-whatsapp'
  payload: TInput,
): Promise<TResponse> {
  if (!sharedSecret) {
    throw new Error('N8N_SHARED_SECRET is not set');
  }

  const url = `${baseUrl.replace(/\/$/, '')}${workflowPath.startsWith('/') ? workflowPath : `/${workflowPath}`}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Seed-Panel-Secret': sharedSecret,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`n8n workflow failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

/** Verify an incoming n8n→app request bears the right shared secret. */
export function verifyN8nRequest(headers: Headers): boolean {
  if (!sharedSecret) return false;
  return headers.get('x-seed-panel-secret') === sharedSecret;
}
