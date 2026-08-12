import path from 'node:path';
import type { NextConfig } from 'next';

const config: NextConfig = {
  turbopack: {
    root: path.join(__dirname, '..', '..'),
  },
  transpilePackages: ['@seed-panel/db'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
  async redirects() {
    return [
      // The Germination variant was promoted to the home page; keep links
      // shared during the staging period working.
      { source: '/germination', destination: '/', permanent: true },
    ];
  },
};

export default config;
