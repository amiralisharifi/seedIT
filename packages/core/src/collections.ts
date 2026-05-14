import type { FieldDef } from './fields';

/**
 * Definition of a CMS collection.
 *
 * Drives:
 *   - Auto-generated list page at /content/<slug>
 *   - Auto-generated detail/edit page at /content/<slug>/[id]
 *   - Auto-generated form using fields[]
 *   - REST endpoints under /api/content/<slug>
 */
export interface CollectionDefinition {
  /** snake_case identifier — used in URLs and table names */
  slug: string;
  /** Plural display name — "Blog Posts" */
  name: string;
  /** Singular display name — "Blog Post" */
  nameSingular: string;
  /** Lucide icon name */
  icon?: string;
  /** One-line description shown under the collection title */
  description?: string;
  /** DB table this collection reads/writes */
  table: string;
  /** Field shown as the row title in lists */
  titleField: string;
  /** Fields shown as columns in the list view */
  listFields: string[];
  /** Whether content is bilingual */
  localized?: boolean;
  /** Which locales this collection supports (subset of locales config) */
  locales?: string[];
  /** Whether records can be manually reordered (drag-and-drop) */
  sortable?: boolean;
  /** Map of fieldName → field definition */
  fields: Record<string, FieldDef>;
}

/**
 * Identity function that gives you autocomplete on the collection shape.
 * Equivalent to `defineConfig` patterns in other frameworks.
 */
export function defineCollection<T extends CollectionDefinition>(def: T): T {
  return def;
}
