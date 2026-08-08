/**
 * INTEGRATIONS CONFIG
 * ===================
 * Declares which external services this deployment uses. Each integration is
 * optional — a deployment that doesn't send WhatsApp can disable AiSensy
 * entirely and the UI won't show those features.
 *
 * Keys (API tokens) live in environment variables, never here.
 * This file just says "is this integration enabled, and how should it behave?".
 *
 * When you fork seed-panel for a client:
 *   - Disable integrations they don't need
 *   - Adjust per-integration settings (e.g. their WhatsApp template names)
 */

import type { IntegrationsConfig } from '@seed-panel/config';

export const integrations: IntegrationsConfig = {
  /* ---------- Supabase (always required) ---------- */
  supabase: {
    enabled: true,
    // Storage bucket for media uploads (logos, blog images, demo galleries)
    storageBucket: 'media',
    // Public URL pattern — Supabase storage objects are served from this base
    publicUrlBase: process.env.NEXT_PUBLIC_SUPABASE_URL
      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public`
      : '',
  },

  /* ---------- Resend (email) ---------- */
  resend: {
    enabled: true,
    fromAddress: 'hello@seedit.ae',
    replyTo: 'hello@seedit.ae',
    // The "from" name shown in inboxes
    fromName: 'SEED IT',
    // Domain Resend should send through (must be verified in Resend dashboard)
    domain: 'seedit.ae',
  },

  /* ---------- AiSensy (WhatsApp Business) ---------- */
  aisensy: {
    enabled: true,
    // Your AiSensy-registered phone number (the one Meta verified)
    phoneNumber: '+971500000000',
    // Display name shown in WhatsApp
    displayName: 'SEED IT',
    // Webhook URL — AiSensy POSTs incoming messages here
    // (set this in AiSensy dashboard to: <NEXT_PUBLIC_APP_URL>/api/webhooks/aisensy)
    webhookSecret: process.env.AISENSY_WEBHOOK_SECRET ?? '',
  },

  /* ---------- Apify (scraping) ---------- */
  apify: {
    enabled: true,
    actors: {
      googleMaps: 'compass/crawler-google-places',
      instagram: 'apify/instagram-scraper',
      websiteContent: 'apify/website-content-crawler',
    },
    // Default options applied to every scrape — can be overridden per-job
    defaults: {
      maxConcurrency: 1,
      timeoutSeconds: 1800,
      memoryMbytes: 1024,
    },
  },

  /* ---------- n8n (workflow orchestration on ayvan.me) ---------- */
  n8n: {
    enabled: true,
    baseUrl: process.env.N8N_WEBHOOK_BASE ?? 'https://ayvan.me/webhook',
    // Webhook paths n8n exposes for each workflow
    workflows: {
      scrape: '/scrape',
      scoreLead: '/score-lead',
      generateDemo: '/generate-demo',
      sendWhatsApp: '/send-whatsapp',
      sendEmail: '/send-email',
      dailyDigest: '/daily-digest',
    },
  },

  /* ---------- Vercel deploy hooks ---------- */
  // When content is published in the panel, hit these URLs to trigger
  // a rebuild of the public site that consumes the content.
  vercel: {
    enabled: true,
    deployHooks: {
      // Add your Vercel deploy hook URL here. Get it from:
      // Vercel project → Settings → Git → Deploy Hooks
      marketingSite: process.env.VERCEL_DEPLOY_HOOK_MARKETING ?? '',
    },
  },

  /* ---------- Plausible Analytics (self-hosted) ---------- */
  plausible: {
    enabled: true,
    domain: 'admin.seedit.ae',
    apiHost: 'https://analytics.ayvan.me',
  },

  /* ---------- Future: Stripe, Calendly, Slack, etc. ---------- */
  // Disabled by default — flip to enabled when you wire them up.
  stripe: { enabled: false },
  slack: { enabled: false },
};
