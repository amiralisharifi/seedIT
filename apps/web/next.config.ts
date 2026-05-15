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
};

export default config;
