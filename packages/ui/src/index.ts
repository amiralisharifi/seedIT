/**
 * @seed-panel/ui
 *
 * Shared component library for all seed-panel surfaces. Right now it's just
 * the `cn` utility — real shadcn-based components get added as we build the
 * panel features that need them. Putting them here (vs. inside apps/panel)
 * means future apps (a public site that wants to reuse the design language,
 * a mobile companion, etc.) can import the same primitives.
 *
 * Convention: components added here should be presentational and brand-neutral.
 * Anything that knows about Lead status colors or salon-specific layouts
 * lives in apps/panel/components.
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
