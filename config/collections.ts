/**
 * COLLECTIONS CONFIG
 * ==================
 * Defines the schema-driven CMS collections for this deployment.
 *
 * A "collection" is a class of content (blog posts, services, case studies,
 * etc.) that the panel manages via auto-generated list views, detail views,
 * and forms. The CRM-specific resources (leads, demos, outreach) live in
 * separate, hand-built UIs because their flows are too bespoke for generic
 * CRUD — but they share infrastructure (auth, layout, db) with collections
 * defined here.
 *
 * When you fork seed-panel for a client:
 *   - Keep the collections that fit (most clients want `blog_posts`, `pages`)
 *   - Remove ones they don't need
 *   - Add new ones specific to their content (e.g. `properties` for a realtor)
 *
 * Each collection generates routes at /content/<slug>:
 *   - GET  /content/<slug>          → list view
 *   - GET  /content/<slug>/new      → create form
 *   - GET  /content/<slug>/[id]     → detail / edit form
 *   - POST /api/content/<slug>      → CRUD endpoints (handled internally)
 */

import { defineCollection, fields } from '@seed-panel/core';

export const collections = [
  /* ----------------------------------------------------------------
     BLOG POSTS — for SEO-driven content marketing on the public site
  ---------------------------------------------------------------- */
  defineCollection({
    slug: 'blog_posts',
    name: 'Blog Posts',
    nameSingular: 'Blog Post',
    icon: 'newspaper',
    description: 'Articles published on the public website',
    // The DB table this collection writes to. Must exist in the schema.
    table: 'blog_posts',
    // Field shown in the list view as the row title
    titleField: 'title',
    // Fields shown as columns in the list view
    listFields: ['title', 'status', 'publishedAt', 'author'],
    // Bilingual: each text field gets en + ar variants
    localized: true,
    locales: ['en', 'ar'],
    fields: {
      title: fields.text({ required: true, max: 200 }),
      slug: fields.slug({ source: 'title', required: true, unique: true }),
      excerpt: fields.textarea({ max: 300, helpText: 'Shown in lists and on social previews' }),
      coverImage: fields.image({ aspectRatio: '16:9' }),
      body: fields.richText({ required: true }),
      author: fields.reference({ to: 'users', required: true }),
      tags: fields.tags(),
      status: fields.select({
        options: ['draft', 'scheduled', 'published', 'archived'],
        default: 'draft',
      }),
      publishedAt: fields.datetime(),
      seoTitle: fields.text({ max: 60, helpText: '60 chars max for search results' }),
      seoDescription: fields.textarea({ max: 160, helpText: '160 chars max' }),
      seoNoindex: fields.boolean({ default: false }),
    },
  }),

  /* ----------------------------------------------------------------
     PAGES — flexible marketing pages (about, services, etc.)
  ---------------------------------------------------------------- */
  defineCollection({
    slug: 'pages',
    name: 'Pages',
    nameSingular: 'Page',
    icon: 'file',
    table: 'pages',
    titleField: 'title',
    listFields: ['title', 'path', 'status'],
    localized: true,
    locales: ['en', 'ar'],
    fields: {
      title: fields.text({ required: true }),
      path: fields.text({
        required: true,
        unique: true,
        helpText: 'URL path on the public site, e.g. /about',
      }),
      sections: fields.blocks({
        blocks: ['hero', 'features', 'cta', 'testimonials', 'faq', 'richText'],
        helpText: 'Compose the page from reusable blocks',
      }),
      status: fields.select({
        options: ['draft', 'published'],
        default: 'draft',
      }),
      seoTitle: fields.text({ max: 60 }),
      seoDescription: fields.textarea({ max: 160 }),
    },
  }),

  /* ----------------------------------------------------------------
     CASE STUDIES — proof for outbound, used in demos and ads
  ---------------------------------------------------------------- */
  defineCollection({
    slug: 'case_studies',
    name: 'Case Studies',
    nameSingular: 'Case Study',
    icon: 'award',
    table: 'case_studies',
    titleField: 'clientName',
    listFields: ['clientName', 'industry', 'status', 'publishedAt'],
    localized: true,
    locales: ['en', 'ar'],
    fields: {
      clientName: fields.text({ required: true }),
      industry: fields.text(),
      challenge: fields.textarea({ required: true }),
      solution: fields.richText({ required: true }),
      results: fields.repeater({
        fields: {
          metric: fields.text({ required: true }),
          value: fields.text({ required: true, helpText: 'e.g. "+340%"' }),
        },
        max: 6,
      }),
      heroImage: fields.image(),
      gallery: fields.imageGallery({ max: 12 }),
      status: fields.select({
        options: ['draft', 'published'],
        default: 'draft',
      }),
      publishedAt: fields.datetime(),
    },
  }),

  /* ----------------------------------------------------------------
     SERVICES — what we offer (for the public site's services page)
  ---------------------------------------------------------------- */
  defineCollection({
    slug: 'services',
    name: 'Services',
    nameSingular: 'Service',
    icon: 'briefcase',
    table: 'services',
    titleField: 'name',
    listFields: ['name', 'category', 'priceFrom', 'order'],
    localized: true,
    locales: ['en', 'ar'],
    sortable: true,
    fields: {
      name: fields.text({ required: true }),
      slug: fields.slug({ source: 'name', required: true, unique: true }),
      category: fields.select({
        options: ['web', 'automation', 'design', 'other'],
      }),
      summary: fields.textarea({ required: true, max: 200 }),
      description: fields.richText(),
      priceFrom: fields.number({ helpText: 'Minimum price in AED' }),
      icon: fields.icon(),
      order: fields.number({ default: 0, helpText: 'Lower = first' }),
      featured: fields.boolean({ default: false }),
    },
  }),

  /* ----------------------------------------------------------------
     TEAM MEMBERS — for the about page
  ---------------------------------------------------------------- */
  defineCollection({
    slug: 'team_members',
    name: 'Team Members',
    nameSingular: 'Team Member',
    icon: 'users',
    table: 'team_members',
    titleField: 'name',
    listFields: ['name', 'role', 'order'],
    sortable: true,
    fields: {
      name: fields.text({ required: true }),
      role: fields.text({ required: true }),
      bio: fields.textarea(),
      photo: fields.image({ aspectRatio: '1:1' }),
      linkedin: fields.url(),
      order: fields.number({ default: 0 }),
    },
  }),
];

// Type-safe collection names — used elsewhere to reference collections
export type CollectionSlug = (typeof collections)[number]['slug'];
