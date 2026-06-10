/**
 * BLOCK SCHEMAS
 * =============
 * Field definitions for the page-builder blocks. The admin block editor reads
 * these to render a form per block; the public renderer
 * (apps/web/src/components/blocks/) reads the saved data by the same field
 * names. Keep the two in sync — add a block here AND a renderer there, and list
 * the block name in a collection's `blocks` field (config/collections.ts).
 *
 * A page's `sections` jsonb stores an array of { id, type, data }, where `data`
 * matches the block's fields below.
 */

import { fields, type FieldDef } from '@seed-panel/core';

export type BlockSchema = {
  label: string;
  fields: Record<string, FieldDef>;
};

export const blockSchemas: Record<string, BlockSchema> = {
  hero: {
    label: 'Hero',
    fields: {
      eyebrow: fields.text({ helpText: 'Small label above the heading' }),
      heading: fields.text({ required: true }),
      subheading: fields.textarea(),
      ctaLabel: fields.text({ label: 'CTA label' }),
      ctaHref: fields.text({ label: 'CTA link', helpText: 'e.g. /#contact or https://…' }),
    },
  },
  richText: {
    label: 'Rich text',
    fields: {
      body: fields.richText({ required: true }),
    },
  },
  cta: {
    label: 'Call to action',
    fields: {
      heading: fields.text({ required: true }),
      buttonLabel: fields.text(),
      buttonHref: fields.text({ helpText: 'e.g. /contact or mailto:…' }),
    },
  },
  features: {
    label: 'Features',
    fields: {
      heading: fields.text({ helpText: 'Optional section heading' }),
      items: fields.repeater({
        max: 6,
        fields: {
          icon: fields.text({ helpText: 'Emoji or short symbol' }),
          title: fields.text({ required: true }),
          text: fields.textarea(),
        },
      }),
    },
  },
  testimonials: {
    label: 'Testimonials',
    fields: {
      heading: fields.text({ helpText: 'Optional section heading' }),
      items: fields.repeater({
        max: 6,
        fields: {
          quote: fields.textarea({ required: true }),
          author: fields.text({ required: true }),
          role: fields.text({ helpText: 'e.g. "Owner, Glow Salon"' }),
        },
      }),
    },
  },
  faq: {
    label: 'FAQ',
    fields: {
      heading: fields.text({ helpText: 'Optional section heading' }),
      items: fields.repeater({
        max: 12,
        fields: {
          question: fields.text({ required: true }),
          answer: fields.textarea({ required: true }),
        },
      }),
    },
  },
};

export type BlockType = keyof typeof blockSchemas;
