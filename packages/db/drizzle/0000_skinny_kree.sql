CREATE TYPE "public"."business_category" AS ENUM('salon_ladies', 'salon_mens_barber', 'salon_premium', 'salon_hammam_spa', 'salon_brow_lash', 'salon_mobile', 'restaurant', 'clinic_dental', 'clinic_dermatology', 'clinic_general', 'real_estate_broker', 'auto_garage', 'tailor', 'cleaning_services', 'law_firm', 'consultancy', 'other');--> statement-breakpoint
CREATE TYPE "public"."content_status" AS ENUM('draft', 'scheduled', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."demo_status" AS ENUM('draft', 'approved', 'sent', 'viewed', 'multi_viewed', 'replied', 'archived');--> statement-breakpoint
CREATE TYPE "public"."emirate" AS ENUM('dubai', 'abu_dhabi', 'sharjah', 'ajman', 'fujairah', 'ras_al_khaimah', 'umm_al_quwain');--> statement-breakpoint
CREATE TYPE "public"."language_pref" AS ENUM('ar', 'en', 'bilingual', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."lead_source" AS ENUM('apify_google_maps', 'apify_instagram', 'manual', 'referral', 'inbound');--> statement-breakpoint
CREATE TYPE "public"."lead_status" AS ENUM('new', 'enriched', 'qualified', 'demo_ready', 'contacted', 'replied', 'in_conversation', 'meeting_booked', 'proposal_sent', 'won', 'lost', 'blacklisted');--> statement-breakpoint
CREATE TYPE "public"."message_direction" AS ENUM('outbound', 'inbound');--> statement-breakpoint
CREATE TYPE "public"."outreach_channel" AS ENUM('whatsapp', 'email', 'instagram_dm', 'phone_call', 'in_person');--> statement-breakpoint
CREATE TYPE "public"."outreach_status" AS ENUM('queued', 'sent', 'delivered', 'read', 'replied', 'failed', 'bounced');--> statement-breakpoint
CREATE TABLE "activity_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid,
	"demo_id" uuid,
	"user_id" uuid,
	"actor_type" varchar(32) NOT NULL,
	"action" text NOT NULL,
	"details" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blog_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(200) NOT NULL,
	"content" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"cover_image_url" text,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"author_id" uuid,
	"published_at" timestamp with time zone,
	"seo_title" text,
	"seo_description" text,
	"seo_noindex" boolean DEFAULT false NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "blog_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "businesses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"place_id" text,
	"name" text NOT NULL,
	"name_arabic" text,
	"category" "business_category" DEFAULT 'other' NOT NULL,
	"sub_category_notes" text,
	"emirate" "emirate" DEFAULT 'dubai' NOT NULL,
	"area_zone" text,
	"address" text,
	"address_arabic" text,
	"lat" double precision,
	"lng" double precision,
	"google_maps_url" text,
	"phone" text,
	"phone_secondary" text,
	"whatsapp_number" text,
	"email" text,
	"email_secondary" text,
	"website_url" text,
	"has_website" boolean DEFAULT false NOT NULL,
	"instagram_handle" text,
	"instagram_followers" integer,
	"instagram_posts_count" integer,
	"instagram_last_post_at" timestamp with time zone,
	"tiktok_handle" text,
	"facebook_url" text,
	"google_rating" double precision,
	"google_review_count" integer,
	"google_reviews_arabic_pct" integer,
	"trade_license" text,
	"vat_trn" text,
	"website_score" integer,
	"lead_score" integer,
	"language_pref" "language_pref" DEFAULT 'unknown' NOT NULL,
	"status" "lead_status" DEFAULT 'new' NOT NULL,
	"source" "lead_source" NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"enrichment" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"scraped_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_enriched_at" timestamp with time zone,
	"last_contacted_at" timestamp with time zone,
	"next_follow_up_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "businesses_place_id_unique" UNIQUE("place_id")
);
--> statement-breakpoint
CREATE TABLE "case_studies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_name" text NOT NULL,
	"industry" text,
	"content" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"results" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"hero_image_url" text,
	"gallery_urls" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "demo_views" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"demo_id" uuid NOT NULL,
	"visitor_hash" varchar(64),
	"locale" varchar(8),
	"referrer" text,
	"user_agent" text,
	"country_code" varchar(2),
	"city" text,
	"time_on_page_seconds" integer,
	"scroll_depth" integer,
	"clicked_whatsapp" boolean DEFAULT false NOT NULL,
	"clicked_call" boolean DEFAULT false NOT NULL,
	"clicked_book" boolean DEFAULT false NOT NULL,
	"viewed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "demos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"template_id" uuid NOT NULL,
	"slug" varchar(128) NOT NULL,
	"content" jsonb NOT NULL,
	"design_overrides" jsonb DEFAULT '{}'::jsonb,
	"primary_locale" "language_pref" DEFAULT 'en' NOT NULL,
	"has_arabic_version" boolean DEFAULT true NOT NULL,
	"status" "demo_status" DEFAULT 'draft' NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"unique_view_count" integer DEFAULT 0 NOT NULL,
	"first_viewed_at" timestamp with time zone,
	"last_viewed_at" timestamp with time zone,
	"sent_at" timestamp with time zone,
	"internal_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone,
	CONSTRAINT "demos_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"filename" text NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"size_bytes" integer NOT NULL,
	"storage_path" text NOT NULL,
	"public_url" text NOT NULL,
	"width" integer,
	"height" integer,
	"alt_text" text,
	"uploaded_by_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "media_storage_path_unique" UNIQUE("storage_path")
);
--> statement-breakpoint
CREATE TABLE "message_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(64) NOT NULL,
	"name" text NOT NULL,
	"channel" "outreach_channel" NOT NULL,
	"body_en" text,
	"body_ar" text,
	"subject_en" text,
	"subject_ar" text,
	"provider_template_name" text,
	"funnel_stage" varchar(32),
	"times_sent" integer DEFAULT 0 NOT NULL,
	"times_replied" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "message_templates_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"outreach_id" uuid,
	"direction" "message_direction" NOT NULL,
	"channel" "outreach_channel" NOT NULL,
	"body" text NOT NULL,
	"locale" varchar(8),
	"media_urls" jsonb DEFAULT '[]'::jsonb,
	"provider_message_id" text,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "outreach" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"demo_id" uuid,
	"message_template_id" uuid,
	"channel" "outreach_channel" NOT NULL,
	"status" "outreach_status" DEFAULT 'queued' NOT NULL,
	"rendered_body" text,
	"rendered_subject" text,
	"locale_used" varchar(8) DEFAULT 'en' NOT NULL,
	"provider_message_id" text,
	"provider_thread_id" text,
	"sent_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"read_at" timestamp with time zone,
	"replied_at" timestamp with time zone,
	"bounced_at" timestamp with time zone,
	"sent_by_user_id" uuid,
	"sent_from_address" text,
	"failure_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"path" varchar(200) NOT NULL,
	"content" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"sections" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"seo_title" text,
	"seo_description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "pages_path_unique" UNIQUE("path")
);
--> statement-breakpoint
CREATE TABLE "scrape_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"queries" jsonb NOT NULL,
	"target_category" "business_category",
	"target_emirate" "emirate" DEFAULT 'dubai',
	"max_results" integer DEFAULT 200 NOT NULL,
	"apify_actor_id" text,
	"apify_run_id" text,
	"apify_dataset_id" text,
	"status" varchar(32) DEFAULT 'queued' NOT NULL,
	"results_count" integer DEFAULT 0 NOT NULL,
	"new_leads_count" integer DEFAULT 0 NOT NULL,
	"cost_usd" double precision,
	"error_message" text,
	"started_at" timestamp with time zone,
	"finished_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "scrape_jobs_apify_run_id_unique" UNIQUE("apify_run_id")
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(100) NOT NULL,
	"content" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"category" varchar(32),
	"price_from" integer,
	"icon" text,
	"order" integer DEFAULT 0 NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "services_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "team_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"role" text NOT NULL,
	"bio" text,
	"photo_url" text,
	"linkedin_url" text,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(64) NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"preview_image_url" text,
	"suitable_categories" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"component_path" text NOT NULL,
	"default_content" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"design_tokens" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "templates_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"full_name" text,
	"avatar_url" text,
	"role" varchar(32) DEFAULT 'admin' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_login_at" timestamp with time zone,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_demo_id_demos_id_fk" FOREIGN KEY ("demo_id") REFERENCES "public"."demos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demo_views" ADD CONSTRAINT "demo_views_demo_id_demos_id_fk" FOREIGN KEY ("demo_id") REFERENCES "public"."demos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demos" ADD CONSTRAINT "demos_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demos" ADD CONSTRAINT "demos_template_id_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_uploaded_by_id_users_id_fk" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_outreach_id_outreach_id_fk" FOREIGN KEY ("outreach_id") REFERENCES "public"."outreach"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outreach" ADD CONSTRAINT "outreach_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outreach" ADD CONSTRAINT "outreach_demo_id_demos_id_fk" FOREIGN KEY ("demo_id") REFERENCES "public"."demos"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outreach" ADD CONSTRAINT "outreach_message_template_id_message_templates_id_fk" FOREIGN KEY ("message_template_id") REFERENCES "public"."message_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outreach" ADD CONSTRAINT "outreach_sent_by_user_id_users_id_fk" FOREIGN KEY ("sent_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activity_log_business_id_idx" ON "activity_log" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "activity_log_created_at_idx" ON "activity_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "blog_posts_status_idx" ON "blog_posts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "blog_posts_published_at_idx" ON "blog_posts" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "businesses_status_idx" ON "businesses" USING btree ("status");--> statement-breakpoint
CREATE INDEX "businesses_category_idx" ON "businesses" USING btree ("category");--> statement-breakpoint
CREATE INDEX "businesses_area_idx" ON "businesses" USING btree ("area_zone");--> statement-breakpoint
CREATE INDEX "businesses_score_idx" ON "businesses" USING btree ("lead_score");--> statement-breakpoint
CREATE INDEX "businesses_next_follow_up_idx" ON "businesses" USING btree ("next_follow_up_at");--> statement-breakpoint
CREATE INDEX "businesses_hunt_idx" ON "businesses" USING btree ("category","area_zone","status","lead_score");--> statement-breakpoint
CREATE INDEX "demo_views_demo_id_idx" ON "demo_views" USING btree ("demo_id");--> statement-breakpoint
CREATE INDEX "demo_views_viewed_at_idx" ON "demo_views" USING btree ("viewed_at");--> statement-breakpoint
CREATE INDEX "demos_business_id_idx" ON "demos" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "demos_status_idx" ON "demos" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "demos_slug_unique_idx" ON "demos" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "media_uploaded_by_idx" ON "media" USING btree ("uploaded_by_id");--> statement-breakpoint
CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "messages_business_id_idx" ON "messages" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "messages_occurred_at_idx" ON "messages" USING btree ("occurred_at");--> statement-breakpoint
CREATE INDEX "outreach_business_id_idx" ON "outreach" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "outreach_status_idx" ON "outreach" USING btree ("status");--> statement-breakpoint
CREATE INDEX "outreach_sent_at_idx" ON "outreach" USING btree ("sent_at");--> statement-breakpoint
CREATE INDEX "outreach_provider_msg_idx" ON "outreach" USING btree ("provider_message_id");