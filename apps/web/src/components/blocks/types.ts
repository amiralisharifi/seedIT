// Block data shapes for the page renderer. Minimal for v1 (English-only).
// When the admin block editor lands (Phase 3), each shape gets a matching field
// schema in config/blocks.ts so the editor and the renderer stay in sync.

export type Section = { id?: string; type: string; data?: Record<string, unknown> };

export type HeroData = {
  eyebrow?: string;
  heading?: string;
  subheading?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export type RichTextData = { body?: string };

export type CtaData = {
  heading?: string;
  buttonLabel?: string;
  buttonHref?: string;
};

export type FeatureItem = { icon?: string; title?: string; text?: string };
export type FeaturesData = { heading?: string; items?: FeatureItem[] };

export type TestimonialItem = { quote?: string; author?: string; role?: string };
export type TestimonialsData = { heading?: string; items?: TestimonialItem[] };

export type FaqItem = { question?: string; answer?: string };
export type FaqData = { heading?: string; items?: FaqItem[] };
