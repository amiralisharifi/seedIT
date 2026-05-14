import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SEED IT · Web Development, Automation & Design Studio · Dubai, UAE',
  description:
    'SEED IT — an independent IT studio in Dubai building high-performance websites, business automations and design systems for ambitious companies across the UAE. We make IT on time.',
  openGraph: {
    title: 'SEED IT — We make IT on time',
    description: 'Web development, automation & design for businesses in the UAE.',
  },
};

export const viewport: Viewport = {
  themeColor: '#08090c',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&family=Onest:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
