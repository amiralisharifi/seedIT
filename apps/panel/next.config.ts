import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname, '..', '..'),
  },
  // Transpile workspace packages — Next.js doesn't do this automatically
  transpilePackages: [
    '@seed-panel/config',
    '@seed-panel/core',
    '@seed-panel/db',
    '@seed-panel/integrations',
    '@seed-panel/ui',
  ],
  // Strict mode catches bugs in React + Supabase auth flows
  reactStrictMode: true,
  // We use Supabase Storage URLs and Instagram CDN images for demos
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'instagram.*.fbcdn.net' },
      { protocol: 'https', hostname: 'scontent-*.cdninstagram.com' },
    ],
  },
  experimental: {
    // Server Actions for forms
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
};

export default nextConfig;
