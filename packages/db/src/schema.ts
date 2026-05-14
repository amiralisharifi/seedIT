/**
 * @seed-panel/db — Database schema.
 *
 * Two halves:
 *   1. CRM tables — businesses, demos, outreach, conversations, scrape_jobs.
 *      These power the outbound system (the SEED IT use case).
 *   2. CMS tables — blog_posts, pages, services, etc. These back the
 *      schema-driven content collections defined in config/collections.ts.
 *
 * Conventions remain:
 *   - UUID primary keys
 *   - timestamptz everywhere
 *   - jsonb for flexible / bilingual content
 *   - soft delete via deletedAt
 *   - all tables get createdAt + updatedAt
 */

import { sql } from 'drizzle-orm';
import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  doublePrecision,
  index,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

/* ============================================================================
   ENUMS
============================================================================ */

export const businessCategoryEnum = pgEnum('business_category', [
  'salon_ladies',
  'salon_mens_barber',
  'salon_premium',
  'salon_hammam_spa',
  'salon_brow_lash',
  'salon_mobile',
  'restaurant',
  'clinic_dental',
  'clinic_dermatology',
  'clinic_general',
  'real_estate_broker',
  'auto_garage',
  'tailor',
  'cleaning_services',
  'law_firm',
  'consultancy',
  'other',
]);

export const emirateEnum = pgEnum('emirate', [
  'dubai',
  'abu_dhabi',
  'sharjah',
  'ajman',
  'fujairah',
  'ras_al_khaimah',
  'umm_al_quwain',
]);

export const languagePrefEnum = pgEnum('language_pref', ['ar', 'en', 'bilingual', 'unknown']);

export const leadSourceEnum = pgEnum('lead_source', [
  'apify_google_maps',
  'apify_instagram',
  'manual',
  'referral',
  'inbound',
]);

export const leadStatusEnum = pgEnum('lead_status', [
  'new',
  'enriched',
  'qualified',
  'demo_ready',
  'contacted',
  'replied',
  'in_conversation',
  'meeting_booked',
  'proposal_sent',
  'won',
  'lost',
  'blacklisted',
]);

export const demoStatusEnum = pgEnum('demo_status', [
  'draft',
  'approved',
  'sent',
  'viewed',
  'multi_viewed',
  'replied',
  'archived',
]);

export const outreachChannelEnum = pgEnum('outreach_channel', [
  'whatsapp',
  'email',
  'instagram_dm',
  'phone_call',
  'in_person',
]);

export const outreachStatusEnum = pgEnum('outreach_status', [
  'queued',
  'sent',
  'delivered',
  'read',
  'replied',
  'failed',
  'bounced',
]);

export const messageDirectionEnum = pgEnum('message_direction', ['outbound', 'inbound']);

export const contentStatusEnum = pgEnum('content_status', [
  'draft',
  'scheduled',
  'published',
  'archived',
]);

/* ============================================================================
   USERS — shared between CRM and CMS
============================================================================ */

export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  email: text('email').notNull().unique(),
  fullName: text('full_name'),
  avatarUrl: text('avatar_url'),
  role: varchar('role', { length: 32 }).notNull().default('admin'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
});

/* ============================================================================
   CRM TABLES
============================================================================ */

export const businesses = pgTable(
  'businesses',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    placeId: text('place_id').unique(),
    name: text('name').notNull(),
    nameArabic: text('name_arabic'),
    category: businessCategoryEnum('category').notNull().default('other'),
    subCategoryNotes: text('sub_category_notes'),

    emirate: emirateEnum('emirate').notNull().default('dubai'),
    areaZone: text('area_zone'),
    address: text('address'),
    addressArabic: text('address_arabic'),
    lat: doublePrecision('lat'),
    lng: doublePrecision('lng'),
    googleMapsUrl: text('google_maps_url'),

    phone: text('phone'),
    phoneSecondary: text('phone_secondary'),
    whatsappNumber: text('whatsapp_number'),
    email: text('email'),
    emailSecondary: text('email_secondary'),

    websiteUrl: text('website_url'),
    hasWebsite: boolean('has_website').notNull().default(false),
    instagramHandle: text('instagram_handle'),
    instagramFollowers: integer('instagram_followers'),
    instagramPostsCount: integer('instagram_posts_count'),
    instagramLastPostAt: timestamp('instagram_last_post_at', { withTimezone: true }),
    tiktokHandle: text('tiktok_handle'),
    facebookUrl: text('facebook_url'),

    googleRating: doublePrecision('google_rating'),
    googleReviewCount: integer('google_review_count'),
    googleReviewsArabicPct: integer('google_reviews_arabic_pct'),

    tradeLicense: text('trade_license'),
    vatTrn: text('vat_trn'),

    websiteScore: integer('website_score'),
    leadScore: integer('lead_score'),
    languagePref: languagePrefEnum('language_pref').notNull().default('unknown'),

    status: leadStatusEnum('status').notNull().default('new'),
    source: leadSourceEnum('source').notNull(),
    priority: integer('priority').notNull().default(0),

    enrichment: jsonb('enrichment').$type<EnrichmentData>().notNull().default({}),

    scrapedAt: timestamp('scraped_at', { withTimezone: true }).notNull().defaultNow(),
    lastEnrichedAt: timestamp('last_enriched_at', { withTimezone: true }),
    lastContactedAt: timestamp('last_contacted_at', { withTimezone: true }),
    nextFollowUpAt: timestamp('next_follow_up_at', { withTimezone: true }),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => ({
    statusIdx: index('businesses_status_idx').on(table.status),
    categoryIdx: index('businesses_category_idx').on(table.category),
    areaIdx: index('businesses_area_idx').on(table.areaZone),
    scoreIdx: index('businesses_score_idx').on(table.leadScore),
    nextFollowUpIdx: index('businesses_next_follow_up_idx').on(table.nextFollowUpAt),
    huntIdx: index('businesses_hunt_idx').on(
      table.category,
      table.areaZone,
      table.status,
      table.leadScore,
    ),
  }),
);

export type EnrichmentData = {
  instagram?: {
    bio?: string;
    bioLink?: string;
    isPrivate?: boolean;
    recentPostUrls?: string[];
    recentPostImages?: string[];
    topHashtags?: string[];
    storyHighlights?: { title: string; coverUrl: string }[];
    fetchedAt?: string;
  };
  website?: {
    techStack?: string[];
    hasSsl?: boolean;
    mobileFriendly?: boolean;
    lastUpdatedGuess?: string;
    waybackFirstSeen?: string;
    lighthouseScores?: {
      performance: number;
      accessibility: number;
      bestPractices: number;
      seo: number;
    };
    issues?: string[];
  };
  competitors?: { name: string; placeId: string; distanceKm: number; hasWebsite: boolean }[];
  notes?: string[];
  customFields?: Record<string, unknown>;
};

export const templates = pgTable('templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 64 }).notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  previewImageUrl: text('preview_image_url'),
  suitableCategories: jsonb('suitable_categories').$type<string[]>().notNull().default([]),
  componentPath: text('component_path').notNull(),
  defaultContent: jsonb('default_content').$type<TemplateContent>().notNull().default(
    {} as TemplateContent,
  ),
  designTokens: jsonb('design_tokens').$type<DesignTokens>().notNull().default({} as DesignTokens),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type TemplateContent = {
  en: BilingualContent;
  ar: BilingualContent;
};

export type BilingualContent = {
  hero?: { headline?: string; sub?: string; ctaPrimary?: string; ctaSecondary?: string };
  services?: { title?: string; items?: { name: string; price?: string; duration?: string }[] };
  about?: { title?: string; body?: string };
  gallery?: { title?: string };
  team?: { title?: string };
  reviews?: { title?: string };
  booking?: { title?: string; whatsappMessage?: string };
  contact?: { title?: string; hoursLabel?: string };
};

export type DesignTokens = {
  colors?: Record<string, string>;
  fonts?: Record<string, string>;
  radius?: 'sharp' | 'soft' | 'pill';
};

export const demos = pgTable(
  'demos',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    businessId: uuid('business_id')
      .notNull()
      .references(() => businesses.id, { onDelete: 'cascade' }),
    templateId: uuid('template_id')
      .notNull()
      .references(() => templates.id),
    slug: varchar('slug', { length: 128 }).notNull().unique(),
    content: jsonb('content').$type<TemplateContent>().notNull(),
    designOverrides: jsonb('design_overrides').$type<Partial<DesignTokens>>().default({}),
    primaryLocale: languagePrefEnum('primary_locale').notNull().default('en'),
    hasArabicVersion: boolean('has_arabic_version').notNull().default(true),
    status: demoStatusEnum('status').notNull().default('draft'),
    viewCount: integer('view_count').notNull().default(0),
    uniqueViewCount: integer('unique_view_count').notNull().default(0),
    firstViewedAt: timestamp('first_viewed_at', { withTimezone: true }),
    lastViewedAt: timestamp('last_viewed_at', { withTimezone: true }),
    sentAt: timestamp('sent_at', { withTimezone: true }),
    internalNotes: text('internal_notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    archivedAt: timestamp('archived_at', { withTimezone: true }),
  },
  (table) => ({
    businessIdIdx: index('demos_business_id_idx').on(table.businessId),
    statusIdx: index('demos_status_idx').on(table.status),
    slugIdx: uniqueIndex('demos_slug_unique_idx').on(table.slug),
  }),
);

export const demoViews = pgTable(
  'demo_views',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    demoId: uuid('demo_id')
      .notNull()
      .references(() => demos.id, { onDelete: 'cascade' }),
    visitorHash: varchar('visitor_hash', { length: 64 }),
    locale: varchar('locale', { length: 8 }),
    referrer: text('referrer'),
    userAgent: text('user_agent'),
    countryCode: varchar('country_code', { length: 2 }),
    city: text('city'),
    timeOnPageSeconds: integer('time_on_page_seconds'),
    scrollDepth: integer('scroll_depth'),
    clickedWhatsapp: boolean('clicked_whatsapp').notNull().default(false),
    clickedCall: boolean('clicked_call').notNull().default(false),
    clickedBook: boolean('clicked_book').notNull().default(false),
    viewedAt: timestamp('viewed_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    demoIdIdx: index('demo_views_demo_id_idx').on(table.demoId),
    viewedAtIdx: index('demo_views_viewed_at_idx').on(table.viewedAt),
  }),
);

export const messageTemplates = pgTable('message_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 64 }).notNull().unique(),
  name: text('name').notNull(),
  channel: outreachChannelEnum('channel').notNull(),
  bodyEn: text('body_en'),
  bodyAr: text('body_ar'),
  subjectEn: text('subject_en'),
  subjectAr: text('subject_ar'),
  providerTemplateName: text('provider_template_name'),
  funnelStage: varchar('funnel_stage', { length: 32 }),
  timesSent: integer('times_sent').notNull().default(0),
  timesReplied: integer('times_replied').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const outreach = pgTable(
  'outreach',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    businessId: uuid('business_id')
      .notNull()
      .references(() => businesses.id, { onDelete: 'cascade' }),
    demoId: uuid('demo_id').references(() => demos.id, { onDelete: 'set null' }),
    messageTemplateId: uuid('message_template_id').references(() => messageTemplates.id),
    channel: outreachChannelEnum('channel').notNull(),
    status: outreachStatusEnum('status').notNull().default('queued'),
    renderedBody: text('rendered_body'),
    renderedSubject: text('rendered_subject'),
    localeUsed: varchar('locale_used', { length: 8 }).notNull().default('en'),
    providerMessageId: text('provider_message_id'),
    providerThreadId: text('provider_thread_id'),
    sentAt: timestamp('sent_at', { withTimezone: true }),
    deliveredAt: timestamp('delivered_at', { withTimezone: true }),
    readAt: timestamp('read_at', { withTimezone: true }),
    repliedAt: timestamp('replied_at', { withTimezone: true }),
    bouncedAt: timestamp('bounced_at', { withTimezone: true }),
    sentByUserId: uuid('sent_by_user_id').references(() => users.id),
    sentFromAddress: text('sent_from_address'),
    failureReason: text('failure_reason'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    businessIdIdx: index('outreach_business_id_idx').on(table.businessId),
    statusIdx: index('outreach_status_idx').on(table.status),
    sentAtIdx: index('outreach_sent_at_idx').on(table.sentAt),
    providerMsgIdx: index('outreach_provider_msg_idx').on(table.providerMessageId),
  }),
);

export const messages = pgTable(
  'messages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    businessId: uuid('business_id')
      .notNull()
      .references(() => businesses.id, { onDelete: 'cascade' }),
    outreachId: uuid('outreach_id').references(() => outreach.id, { onDelete: 'set null' }),
    direction: messageDirectionEnum('direction').notNull(),
    channel: outreachChannelEnum('channel').notNull(),
    body: text('body').notNull(),
    locale: varchar('locale', { length: 8 }),
    mediaUrls: jsonb('media_urls').$type<string[]>().default([]),
    providerMessageId: text('provider_message_id'),
    occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    businessIdIdx: index('messages_business_id_idx').on(table.businessId),
    occurredAtIdx: index('messages_occurred_at_idx').on(table.occurredAt),
  }),
);

export const scrapeJobs = pgTable('scrape_jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  queries: jsonb('queries').$type<string[]>().notNull(),
  targetCategory: businessCategoryEnum('target_category'),
  targetEmirate: emirateEnum('target_emirate').default('dubai'),
  maxResults: integer('max_results').notNull().default(200),
  apifyActorId: text('apify_actor_id'),
  apifyRunId: text('apify_run_id').unique(),
  apifyDatasetId: text('apify_dataset_id'),
  status: varchar('status', { length: 32 }).notNull().default('queued'),
  resultsCount: integer('results_count').notNull().default(0),
  newLeadsCount: integer('new_leads_count').notNull().default(0),
  costUsd: doublePrecision('cost_usd'),
  errorMessage: text('error_message'),
  startedAt: timestamp('started_at', { withTimezone: true }),
  finishedAt: timestamp('finished_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const activityLog = pgTable(
  'activity_log',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    businessId: uuid('business_id').references(() => businesses.id, { onDelete: 'cascade' }),
    demoId: uuid('demo_id').references(() => demos.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    actorType: varchar('actor_type', { length: 32 }).notNull(),
    action: text('action').notNull(),
    details: jsonb('details').$type<Record<string, unknown>>().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    businessIdIdx: index('activity_log_business_id_idx').on(table.businessId),
    createdAtIdx: index('activity_log_created_at_idx').on(table.createdAt),
  }),
);

/* ============================================================================
   CMS TABLES — back the schema-driven collections in config/collections.ts
============================================================================ */

// Used by ALL CMS tables to hold bilingual versions of fields.
// Shape: { en: { title: "...", body: "..." }, ar: { title: "...", body: "..." } }
export type LocalizedContent = Record<string, Record<string, unknown>>;

export const blogPosts = pgTable(
  'blog_posts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: varchar('slug', { length: 200 }).notNull().unique(),
    // Localized content lives in jsonb. Each locale has its own copy of fields.
    content: jsonb('content').$type<LocalizedContent>().notNull().default({}),
    coverImageUrl: text('cover_image_url'),
    tags: jsonb('tags').$type<string[]>().notNull().default([]),
    status: contentStatusEnum('status').notNull().default('draft'),
    authorId: uuid('author_id').references(() => users.id, { onDelete: 'set null' }),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    seoTitle: text('seo_title'),
    seoDescription: text('seo_description'),
    seoNoindex: boolean('seo_noindex').notNull().default(false),
    viewCount: integer('view_count').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => ({
    statusIdx: index('blog_posts_status_idx').on(table.status),
    publishedAtIdx: index('blog_posts_published_at_idx').on(table.publishedAt),
  }),
);

export const pages = pgTable('pages', {
  id: uuid('id').primaryKey().defaultRandom(),
  path: varchar('path', { length: 200 }).notNull().unique(),
  content: jsonb('content').$type<LocalizedContent>().notNull().default({}),
  // The "blocks" composition — array of block objects with type discriminator
  sections: jsonb('sections').$type<unknown[]>().notNull().default([]),
  status: contentStatusEnum('status').notNull().default('draft'),
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export const caseStudies = pgTable('case_studies', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientName: text('client_name').notNull(),
  industry: text('industry'),
  content: jsonb('content').$type<LocalizedContent>().notNull().default({}),
  results: jsonb('results').$type<{ metric: string; value: string }[]>().notNull().default([]),
  heroImageUrl: text('hero_image_url'),
  galleryUrls: jsonb('gallery_urls').$type<string[]>().notNull().default([]),
  status: contentStatusEnum('status').notNull().default('draft'),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export const services = pgTable('services', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  content: jsonb('content').$type<LocalizedContent>().notNull().default({}),
  category: varchar('category', { length: 32 }),
  priceFrom: integer('price_from'),
  icon: text('icon'),
  order: integer('order').notNull().default(0),
  featured: boolean('featured').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export const teamMembers = pgTable('team_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  role: text('role').notNull(),
  bio: text('bio'),
  photoUrl: text('photo_url'),
  linkedinUrl: text('linkedin_url'),
  order: integer('order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

/* ============================================================================
   MEDIA LIBRARY — all image/file uploads
============================================================================ */

export const media = pgTable(
  'media',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    filename: text('filename').notNull(),
    mimeType: varchar('mime_type', { length: 100 }).notNull(),
    sizeBytes: integer('size_bytes').notNull(),
    // Supabase storage path: 'media/uploads/2026/05/abc123.jpg'
    storagePath: text('storage_path').notNull().unique(),
    // Cached public URL
    publicUrl: text('public_url').notNull(),
    width: integer('width'),
    height: integer('height'),
    altText: text('alt_text'),
    uploadedById: uuid('uploaded_by_id').references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    uploadedByIdx: index('media_uploaded_by_idx').on(table.uploadedById),
    createdAtIdx: index('media_created_at_idx').on(table.createdAt),
  }),
);

/* ============================================================================
   RELATIONS
============================================================================ */

export const businessesRelations = relations(businesses, ({ many }) => ({
  demos: many(demos),
  outreachAttempts: many(outreach),
  messages: many(messages),
  activity: many(activityLog),
}));

export const demosRelations = relations(demos, ({ one, many }) => ({
  business: one(businesses, { fields: [demos.businessId], references: [businesses.id] }),
  template: one(templates, { fields: [demos.templateId], references: [templates.id] }),
  views: many(demoViews),
  outreachAttempts: many(outreach),
}));

export const templatesRelations = relations(templates, ({ many }) => ({ demos: many(demos) }));

export const demoViewsRelations = relations(demoViews, ({ one }) => ({
  demo: one(demos, { fields: [demoViews.demoId], references: [demos.id] }),
}));

export const outreachRelations = relations(outreach, ({ one, many }) => ({
  business: one(businesses, { fields: [outreach.businessId], references: [businesses.id] }),
  demo: one(demos, { fields: [outreach.demoId], references: [demos.id] }),
  template: one(messageTemplates, {
    fields: [outreach.messageTemplateId],
    references: [messageTemplates.id],
  }),
  sentBy: one(users, { fields: [outreach.sentByUserId], references: [users.id] }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  business: one(businesses, { fields: [messages.businessId], references: [businesses.id] }),
  outreach: one(outreach, { fields: [messages.outreachId], references: [outreach.id] }),
}));

export const blogPostsRelations = relations(blogPosts, ({ one }) => ({
  author: one(users, { fields: [blogPosts.authorId], references: [users.id] }),
}));

/* ============================================================================
   TYPE EXPORTS
============================================================================ */

export type Business = typeof businesses.$inferSelect;
export type NewBusiness = typeof businesses.$inferInsert;
export type Template = typeof templates.$inferSelect;
export type NewTemplate = typeof templates.$inferInsert;
export type Demo = typeof demos.$inferSelect;
export type NewDemo = typeof demos.$inferInsert;
export type DemoView = typeof demoViews.$inferSelect;
export type NewDemoView = typeof demoViews.$inferInsert;
export type MessageTemplate = typeof messageTemplates.$inferSelect;
export type NewMessageTemplate = typeof messageTemplates.$inferInsert;
export type Outreach = typeof outreach.$inferSelect;
export type NewOutreach = typeof outreach.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
export type ScrapeJob = typeof scrapeJobs.$inferSelect;
export type NewScrapeJob = typeof scrapeJobs.$inferInsert;
export type User = typeof users.$inferSelect;
export type ActivityLog = typeof activityLog.$inferSelect;
export type BlogPost = typeof blogPosts.$inferSelect;
export type NewBlogPost = typeof blogPosts.$inferInsert;
export type Page = typeof pages.$inferSelect;
export type CaseStudy = typeof caseStudies.$inferSelect;
export type Service = typeof services.$inferSelect;
export type TeamMember = typeof teamMembers.$inferSelect;
export type Media = typeof media.$inferSelect;
export type NewMedia = typeof media.$inferInsert;
