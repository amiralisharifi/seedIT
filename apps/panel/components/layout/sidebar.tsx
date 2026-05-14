'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as LucideIcons from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';
import { cn } from '@seed-panel/ui';
import type { PanelUser } from '@seed-panel/core';
import { brand } from '@/config';
import { getNavSections } from './nav-config';

type IconCmp = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;

function Icon({ name, className }: { name: string; className?: string }) {
  // Convert "layout-dashboard" → "LayoutDashboard"
  const componentName = name
    .split('-')
    .map((s) => s[0]?.toUpperCase() + s.slice(1))
    .join('');
  const Cmp = (LucideIcons as unknown as Record<string, IconCmp>)[componentName];
  if (!Cmp) return null;
  return <Cmp className={className} size={16} aria-hidden />;
}

export function Sidebar({ user }: { user: PanelUser }) {
  const pathname = usePathname();
  const sections = getNavSections();

  return (
    <aside className="sidebar-surface w-60 shrink-0 flex flex-col h-screen sticky top-0 border-r border-sidebar-border">
      {/* Brand header */}
      <div className="h-14 px-4 flex items-center border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image
            src={brand.logo.dark}
            alt={brand.name}
            width={brand.logo.width}
            height={brand.logo.height}
            priority
          />
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-6">
        {sections.map((section) => (
          <div key={section.title}>
            <div className="px-3 mb-2 text-[10px] uppercase tracking-wider text-sidebar-foreground/40 font-mono">
              {section.title}
            </div>
            <ul className="space-y-0.5">
              {section.items
                .filter((item) => !item.adminOnly || user.role === 'admin')
                .map((item) => {
                  const active =
                    pathname === item.href ||
                    (item.href !== '/dashboard' && pathname.startsWith(item.href));
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          'flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm transition-colors',
                          active
                            ? 'bg-sidebar-foreground/10 text-sidebar-foreground'
                            : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-foreground/5',
                        )}
                      >
                        <Icon name={item.icon} className="shrink-0" />
                        <span className="truncate">{item.label}</span>
                        {item.badge && (
                          <span className="ml-auto text-[10px] font-mono bg-sidebar-foreground/10 px-1.5 rounded">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-sidebar-foreground/5">
          <div className="w-7 h-7 rounded-full bg-sidebar-foreground/10 flex items-center justify-center text-xs font-medium">
            {user.email[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-sidebar-foreground truncate">
              {user.fullName ?? user.email}
            </div>
            <div className="text-[10px] text-sidebar-foreground/50 truncate">{user.role}</div>
          </div>
          <form action="/api/auth/sign-out" method="POST">
            <button
              type="submit"
              className="text-sidebar-foreground/40 hover:text-sidebar-foreground"
              title="Sign out"
            >
              <Icon name="log-out" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
