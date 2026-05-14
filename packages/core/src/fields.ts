/**
 * Field types for the schema-driven CMS.
 *
 * Each field defines:
 *   - what it stores (text, number, image, reference, etc.)
 *   - validation rules
 *   - how it renders in forms (which input component to use)
 *   - how it renders in lists (which cell component)
 *
 * The admin form generator reads these and produces the right input for each.
 *
 * Inspiration: Payload's field types are the gold standard here. We implement
 * the subset that's actually useful for our scope.
 */

/* ============================================================================
   COMMON OPTIONS
============================================================================ */

interface BaseFieldOptions {
  required?: boolean;
  helpText?: string;
  // Override the auto-generated label in forms
  label?: string;
  // Hide from list views
  hidden?: boolean;
  // Read-only (shown but not editable)
  readOnly?: boolean;
}

/* ============================================================================
   FIELD DEFINITIONS
   Each is a discriminated union via the `type` property.
============================================================================ */

export type FieldDef =
  | TextField
  | TextareaField
  | RichTextField
  | NumberField
  | BooleanField
  | SelectField
  | DateField
  | DatetimeField
  | SlugField
  | UrlField
  | EmailField
  | ImageField
  | ImageGalleryField
  | FileField
  | IconField
  | TagsField
  | ReferenceField
  | RepeaterField
  | BlocksField;

/* ---------- Text ---------- */

export interface TextField extends BaseFieldOptions {
  type: 'text';
  min?: number;
  max?: number;
  pattern?: RegExp;
  unique?: boolean;
  placeholder?: string;
  default?: string;
}

export interface TextareaField extends BaseFieldOptions {
  type: 'textarea';
  min?: number;
  max?: number;
  rows?: number;
  default?: string;
}

export interface RichTextField extends BaseFieldOptions {
  type: 'richText';
  // Which formatting features to enable
  features?: ('bold' | 'italic' | 'h2' | 'h3' | 'link' | 'list' | 'image' | 'code')[];
}

/* ---------- Numbers / booleans ---------- */

export interface NumberField extends BaseFieldOptions {
  type: 'number';
  min?: number;
  max?: number;
  step?: number;
  default?: number;
}

export interface BooleanField extends BaseFieldOptions {
  type: 'boolean';
  default?: boolean;
}

/* ---------- Select ---------- */

export interface SelectField<T extends string = string> extends BaseFieldOptions {
  type: 'select';
  options: readonly T[] | { value: T; label: string }[];
  default?: T;
  multiple?: boolean;
}

/* ---------- Dates ---------- */

export interface DateField extends BaseFieldOptions {
  type: 'date';
  default?: 'now' | string;
}

export interface DatetimeField extends BaseFieldOptions {
  type: 'datetime';
  default?: 'now' | string;
}

/* ---------- Specialized strings ---------- */

export interface SlugField extends BaseFieldOptions {
  type: 'slug';
  // Auto-derive from another field's value
  source?: string;
  unique?: boolean;
  default?: string;
}

export interface UrlField extends BaseFieldOptions {
  type: 'url';
  default?: string;
}

export interface EmailField extends BaseFieldOptions {
  type: 'email';
  default?: string;
}

/* ---------- Media ---------- */

export interface ImageField extends BaseFieldOptions {
  type: 'image';
  // For preview + cropping. "16:9", "1:1", "4:3", or "free".
  aspectRatio?: '16:9' | '1:1' | '4:3' | '3:2' | 'free';
  maxSizeMb?: number;
}

export interface ImageGalleryField extends BaseFieldOptions {
  type: 'imageGallery';
  max?: number;
  maxSizeMb?: number;
}

export interface FileField extends BaseFieldOptions {
  type: 'file';
  accept?: string[]; // MIME types
  maxSizeMb?: number;
}

export interface IconField extends BaseFieldOptions {
  type: 'icon';
  // Restrict to a specific icon set (defaults to lucide)
  set?: 'lucide';
}

/* ---------- Tags ---------- */

export interface TagsField extends BaseFieldOptions {
  type: 'tags';
  // Pre-defined options the user can pick from in addition to free input
  suggestions?: string[];
  max?: number;
}

/* ---------- Relationships ---------- */

export interface ReferenceField extends BaseFieldOptions {
  type: 'reference';
  // Which collection or DB table this references
  to: string;
  // Display field on the referenced record
  displayField?: string;
  multiple?: boolean;
}

/* ---------- Composite ---------- */

export interface RepeaterField extends BaseFieldOptions {
  type: 'repeater';
  fields: Record<string, FieldDef>;
  min?: number;
  max?: number;
}

/**
 * "Blocks" — the killer feature borrowed from Payload/Sanity.
 * The editor picks from a palette of block types and stacks them in any order.
 * Each block has its own field schema.
 *
 * The `blocks` option here just lists the block names this field accepts;
 * the actual block definitions live next to the front-end components that
 * render them (so they're co-located with their UI).
 */
export interface BlocksField extends BaseFieldOptions {
  type: 'blocks';
  blocks: string[];
  min?: number;
  max?: number;
}

/* ============================================================================
   CONSTRUCTORS
   Sugar so users write `fields.text({ required: true })` instead of
   `{ type: 'text', required: true }`.
============================================================================ */

export const fields = {
  text: (opts: Omit<TextField, 'type'> = {}): TextField => ({ type: 'text', ...opts }),
  textarea: (opts: Omit<TextareaField, 'type'> = {}): TextareaField => ({
    type: 'textarea',
    ...opts,
  }),
  richText: (opts: Omit<RichTextField, 'type'> = {}): RichTextField => ({
    type: 'richText',
    ...opts,
  }),
  number: (opts: Omit<NumberField, 'type'> = {}): NumberField => ({ type: 'number', ...opts }),
  boolean: (opts: Omit<BooleanField, 'type'> = {}): BooleanField => ({ type: 'boolean', ...opts }),
  select: <T extends string>(opts: Omit<SelectField<T>, 'type'>): SelectField<T> => ({
    type: 'select',
    ...opts,
  }),
  date: (opts: Omit<DateField, 'type'> = {}): DateField => ({ type: 'date', ...opts }),
  datetime: (opts: Omit<DatetimeField, 'type'> = {}): DatetimeField => ({
    type: 'datetime',
    ...opts,
  }),
  slug: (opts: Omit<SlugField, 'type'> = {}): SlugField => ({ type: 'slug', ...opts }),
  url: (opts: Omit<UrlField, 'type'> = {}): UrlField => ({ type: 'url', ...opts }),
  email: (opts: Omit<EmailField, 'type'> = {}): EmailField => ({ type: 'email', ...opts }),
  image: (opts: Omit<ImageField, 'type'> = {}): ImageField => ({ type: 'image', ...opts }),
  imageGallery: (opts: Omit<ImageGalleryField, 'type'> = {}): ImageGalleryField => ({
    type: 'imageGallery',
    ...opts,
  }),
  file: (opts: Omit<FileField, 'type'> = {}): FileField => ({ type: 'file', ...opts }),
  icon: (opts: Omit<IconField, 'type'> = {}): IconField => ({ type: 'icon', ...opts }),
  tags: (opts: Omit<TagsField, 'type'> = {}): TagsField => ({ type: 'tags', ...opts }),
  reference: (opts: Omit<ReferenceField, 'type'>): ReferenceField => ({
    type: 'reference',
    ...opts,
  }),
  repeater: (opts: Omit<RepeaterField, 'type'>): RepeaterField => ({ type: 'repeater', ...opts }),
  blocks: (opts: Omit<BlocksField, 'type'>): BlocksField => ({ type: 'blocks', ...opts }),
};
