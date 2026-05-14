-- ============================================================
-- SEED PANEL — Initial seed data
-- ============================================================
-- Run AFTER applying 0000_skinny_kree.sql.
-- Idempotent: existing rows (matched by slug) are left untouched.
-- Mirrors packages/db/scripts/seed.ts exactly.
-- ============================================================

-- ----- TEMPLATES -----

INSERT INTO templates (slug, name, description, suitable_categories, component_path, design_tokens, default_content)
VALUES (
  'warm-ladies',
  'Warm Ladies Salon',
  'Bright, photo-heavy. For ladies salons in Karama, Bur Dubai, Satwa.',
  $j$["salon_ladies","salon_brow_lash","salon_mobile"]$j$::jsonb,
  'warm-ladies',
  $j${
    "colors": {
      "primary": "#c25b8a",
      "secondary": "#f5e6d3",
      "accent": "#d4a574",
      "background": "#fdfaf6",
      "text": "#2a1f1a"
    },
    "fonts": { "display": "Fraunces", "body": "Manrope", "arabic": "Tajawal" },
    "radius": "soft"
  }$j$::jsonb,
  $j${
    "en": {
      "hero": {
        "headline": "Beauty, your way.",
        "sub": "Walk in or book ahead — we save your slot, every time.",
        "ctaPrimary": "Book on WhatsApp",
        "ctaSecondary": "See services"
      },
      "services": { "title": "Services & Prices" },
      "gallery": { "title": "Recent work" },
      "reviews": { "title": "What clients say" },
      "booking": {
        "title": "Book your appointment",
        "whatsappMessage": "Hi! I'd like to book an appointment."
      },
      "contact": { "title": "Visit us", "hoursLabel": "Opening hours" }
    },
    "ar": {
      "hero": {
        "headline": "جمالك على ذوقك",
        "sub": "تعالي بدون موعد أو احجزي مسبقاً — مكانك محفوظ دائماً",
        "ctaPrimary": "احجزي عبر واتساب",
        "ctaSecondary": "شاهدي الخدمات"
      },
      "services": { "title": "الخدمات والأسعار" },
      "gallery": { "title": "أعمالنا الأخيرة" },
      "reviews": { "title": "آراء عميلاتنا" },
      "booking": { "title": "احجزي موعدك", "whatsappMessage": "مرحبا! أرغب في حجز موعد." },
      "contact": { "title": "زورينا", "hoursLabel": "ساعات العمل" }
    }
  }$j$::jsonb
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO templates (slug, name, description, suitable_categories, component_path, design_tokens, default_content)
VALUES (
  'editorial-premium',
  'Editorial Premium',
  'Minimal, editorial. For high-end ladies salons + spas (JLT, Marina, BB).',
  $j$["salon_premium","salon_hammam_spa"]$j$::jsonb,
  'editorial-premium',
  $j${
    "colors": {
      "primary": "#1a1a1a",
      "secondary": "#f5f4f0",
      "accent": "#a08960",
      "background": "#fafaf8",
      "text": "#0a0a0a"
    },
    "fonts": { "display": "Cormorant Garamond", "body": "Inter", "arabic": "Amiri" },
    "radius": "sharp"
  }$j$::jsonb,
  $j${
    "en": {
      "hero": {
        "headline": "A quieter kind of luxury.",
        "sub": "Considered services. Skilled hands. A space designed for stillness.",
        "ctaPrimary": "Reserve",
        "ctaSecondary": "Explore services"
      },
      "services": { "title": "Services" },
      "gallery": { "title": "The space" },
      "reviews": { "title": "Guests" },
      "booking": {
        "title": "Reservations",
        "whatsappMessage": "Hello, I would like to make a reservation."
      },
      "contact": { "title": "Find us", "hoursLabel": "Hours" }
    },
    "ar": {
      "hero": {
        "headline": "فخامة بأسلوب هادئ",
        "sub": "خدمات مدروسة. أيادٍ ماهرة. مساحة مصممة للسكينة.",
        "ctaPrimary": "احجزي",
        "ctaSecondary": "الخدمات"
      },
      "services": { "title": "الخدمات" },
      "gallery": { "title": "المكان" },
      "reviews": { "title": "ضيوفنا" },
      "booking": { "title": "الحجوزات", "whatsappMessage": "مرحبا، أرغب في إجراء حجز." },
      "contact": { "title": "تواصلي معنا", "hoursLabel": "ساعات العمل" }
    }
  }$j$::jsonb
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO templates (slug, name, description, suitable_categories, component_path, design_tokens, default_content)
VALUES (
  'dark-barber',
  'Dark Barber',
  'Bold, dark, masculine. For men''s barbershops.',
  $j$["salon_mens_barber"]$j$::jsonb,
  'dark-barber',
  $j${
    "colors": {
      "primary": "#d4a955",
      "secondary": "#1a1a1a",
      "accent": "#8b3a1f",
      "background": "#0d0d0d",
      "text": "#f0e8d8"
    },
    "fonts": { "display": "Oswald", "body": "Inter", "arabic": "Cairo" },
    "radius": "sharp"
  }$j$::jsonb,
  $j${
    "en": {
      "hero": {
        "headline": "Sharp cuts. No fuss.",
        "sub": "Walk-ins welcome. Book ahead if you're short on time.",
        "ctaPrimary": "Book a chair",
        "ctaSecondary": "Services"
      },
      "services": { "title": "Cuts & Services" },
      "gallery": { "title": "The work" },
      "reviews": { "title": "What the regulars say" },
      "booking": {
        "title": "Book your slot",
        "whatsappMessage": "Hey, I'd like to book a haircut."
      },
      "contact": { "title": "Come by", "hoursLabel": "Open" }
    },
    "ar": {
      "hero": {
        "headline": "قصات حادة. بدون تعقيد.",
        "sub": "بدون موعد مرحب بكم. احجز مسبقاً إذا كان وقتك ضيقاً.",
        "ctaPrimary": "احجز كرسي",
        "ctaSecondary": "الخدمات"
      },
      "services": { "title": "القصات والخدمات" },
      "gallery": { "title": "الأعمال" },
      "reviews": { "title": "آراء الزبائن" },
      "booking": { "title": "احجز موعدك", "whatsappMessage": "مرحبا، أرغب في حجز قصة شعر." },
      "contact": { "title": "زورنا", "hoursLabel": "الدوام" }
    }
  }$j$::jsonb
)
ON CONFLICT (slug) DO NOTHING;

-- ----- MESSAGE TEMPLATES -----

INSERT INTO message_templates (slug, name, channel, funnel_stage, body_en, body_ar, provider_template_name)
VALUES (
  'whatsapp-salon-cold-1',
  'Salon — Cold Outreach #1',
  'whatsapp',
  'cold_1',
  $body$Hi! I came across {{name}} on Google — your reviews look amazing 🌸

I run a small studio in Business Bay that builds websites for salons in Dubai. I put together a sample design for {{name}} — want a quick look? No pressure: {{demoUrl}}

— {{senderName}}, SEED IT$body$,
  $body$أهلا! شفت {{name}} على قوقل و التقييمات حلوة 🌸

أنا من ستوديو صغير في بزنس باي نسوي مواقع للصالونات في دبي. سويت تصميم تجريبي لـ {{name}} — حابة تشوفينه؟ بدون أي التزام: {{demoUrl}}

— {{senderName}}, سيد آي تي$body$,
  'salon_cold_1'
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO message_templates (slug, name, channel, funnel_stage, body_en, body_ar, provider_template_name)
VALUES (
  'whatsapp-salon-follow-up-1',
  'Salon — Follow-up #1 (3 days)',
  'whatsapp',
  'follow_up_1',
  $body$Hi again — just checking if you had a chance to see the sample for {{name}}: {{demoUrl}}

Happy to adjust anything or hop on a quick call. I'm in Business Bay, can also come to you.$body$,
  $body$مرحبا مرة ثانية — حابة أتأكد إذا شفتي التصميم اللي أرسلته لـ {{name}}: {{demoUrl}}

مستعدة أعدل أي شي أو نسوي مكالمة قصيرة. أنا في بزنس باي و ممكن آجي عندكم.$body$,
  'salon_followup_1'
)
ON CONFLICT (slug) DO NOTHING;
