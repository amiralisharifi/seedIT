import { brand } from '@/config';
import Image from 'next/image';

/**
 * Layout for the public auth pages (login, signup, password reset).
 * Just a centered card on a clean background. No sidebar, no nav.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-sm">
        {/* Brand mark */}
        <div className="flex justify-center mb-8">
          <Image
            src={brand.logo.light}
            alt={brand.name}
            width={brand.logo.width}
            height={brand.logo.height}
            priority
          />
        </div>
        {children}
        {/* Optional "powered by" line */}
        {brand.poweredBy && (
          <p className="mt-8 text-center text-xs text-muted-foreground">{brand.poweredBy}</p>
        )}
      </div>
    </main>
  );
}
