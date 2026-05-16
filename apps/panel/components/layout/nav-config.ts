/**
 * Sidebar navigation structure.
 *
 * Three sections:
 *   1. CRM — outbound business operations (leads, demos, outreach)
 *   2. Content — auto-generated from config/collections.ts
 *   3. Settings — brand, integrations, team
 *
 * The collections section is the schema-driven part: each collection in
 * config/collections.ts gets its own nav item without code changes.
 */

import { collections } from '@/config';

export interface NavItem {
  label: string;
  href: string;
  icon: string; // lucide icon name
  badge?: string;
  adminOnly?: boolean;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export function getNavSections(): NavSection[] {
  return [
    {
      title: 'Overview',
      items: [
        { label: 'Dashboard', href: '/dashboard', icon: 'layout-dashboard' },
      ],
    },
    {
      title: 'CRM',
      items: [
        { label: 'Inquiries', href: '/inquiries', icon: 'inbox' },
        { label: 'Leads', href: '/leads', icon: 'users' },
        { label: 'Demos', href: '/demos', icon: 'sparkles' },
        { label: 'Outreach', href: '/outreach', icon: 'send' },
        { label: 'Conversations', href: '/conversations', icon: 'message-circle' },
        { label: 'Scrape', href: '/scrape', icon: 'search' },
      ],
    },
    {
      title: 'Content',
      items: collections.map((c) => ({
        label: c.name,
        href: `/content/${c.slug}`,
        icon: c.icon ?? 'file',
      })),
    },
    {
      title: 'Settings',
      items: [
        { label: 'Brand', href: '/settings/brand', icon: 'palette', adminOnly: true },
        { label: 'Contact & Social', href: '/settings/contact', icon: 'phone', adminOnly: true },
        { label: 'Team', href: '/settings/team', icon: 'user-plus', adminOnly: true },
        { label: 'Integrations', href: '/settings/integrations', icon: 'plug', adminOnly: true },
        { label: 'Domains', href: '/settings/domains', icon: 'globe', adminOnly: true },
      ],
    },
  ];
}
