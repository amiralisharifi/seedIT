// Canonical production origin. Override via NEXT_PUBLIC_SITE_URL in Vercel
// if you ever serve from a different domain (preview, custom client).
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://seedit.ae').replace(/\/$/, '');
