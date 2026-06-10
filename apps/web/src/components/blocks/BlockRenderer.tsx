import { Fragment, type ReactNode } from 'react';
import { Hero } from './Hero';
import { RichText } from './RichText';
import { Cta } from './Cta';
import type { Section, HeroData, RichTextData, CtaData } from './types';

// type → renderer. Each entry narrows the loosely-typed block `data` to its
// block's shape (all fields optional, so the cast is safe). Add a block here +
// a matching type in types.ts to support a new block. Unknown types are skipped
// so stale/forward-compatible content never throws.
const REGISTRY: Record<string, (data: Record<string, unknown>) => ReactNode> = {
  hero: (d) => <Hero data={d as HeroData} />,
  richText: (d) => <RichText data={d as RichTextData} />,
  cta: (d) => <Cta data={d as CtaData} />,
};

export function BlockRenderer({ sections }: { sections: unknown }) {
  const list = Array.isArray(sections) ? sections : [];
  return (
    <>
      {list.map((raw, i) => {
        if (!raw || typeof raw !== 'object') return null;
        const block = raw as Section;
        const render = REGISTRY[block.type];
        if (!render) return null;
        return <Fragment key={block.id ?? i}>{render(block.data ?? {})}</Fragment>;
      })}
    </>
  );
}
