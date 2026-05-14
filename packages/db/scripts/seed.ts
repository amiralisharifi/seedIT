/**
 * Seed script — populates baseline data for a fresh deployment.
 *
 * Usage: pnpm db:seed (from monorepo root)
 *
 * Idempotent — existing rows are skipped.
 */

import { eq } from 'drizzle-orm';
import { db } from '../src/client';
import { templates, messageTemplates } from '../src/schema';

async function seedTemplates() {
  console.log('Seeding salon templates...');

  const salonTemplates = [
    {
      slug: 'warm-ladies',
      name: 'Warm Ladies Salon',
      description: 'Bright, photo-heavy. For ladies salons in Karama, Bur Dubai, Satwa.',
      suitableCategories: ['salon_ladies', 'salon_brow_lash', 'salon_mobile'],
      componentPath: 'warm-ladies',
      designTokens: {
        colors: {
          primary: '#c25b8a',
          secondary: '#f5e6d3',
          accent: '#d4a574',
          background: '#fdfaf6',
          text: '#2a1f1a',
        },
        fonts: { display: 'Fraunces', body: 'Manrope', arabic: 'Tajawal' },
        radius: 'soft' as const,
      },
      defaultContent: {
        en: {
          hero: {
            headline: 'Beauty, your way.',
            sub: 'Walk in or book ahead — we save your slot, every time.',
            ctaPrimary: 'Book on WhatsApp',
            ctaSecondary: 'See services',
          },
          services: { title: 'Services & Prices' },
          gallery: { title: 'Recent work' },
          reviews: { title: 'What clients say' },
          booking: {
            title: 'Book your appointment',
            whatsappMessage: "Hi! I'd like to book an appointment.",
          },
          contact: { title: 'Visit us', hoursLabel: 'Opening hours' },
        },
        ar: {
          hero: {
            headline: 'جمالك على ذوقك',
            sub: 'تعالي بدون موعد أو احجزي مسبقاً — مكانك محفوظ دائماً',
            ctaPrimary: 'احجزي عبر واتساب',
            ctaSecondary: 'شاهدي الخدمات',
          },
          services: { title: 'الخدمات والأسعار' },
          gallery: { title: 'أعمالنا الأخيرة' },
          reviews: { title: 'آراء عميلاتنا' },
          booking: { title: 'احجزي موعدك', whatsappMessage: 'مرحبا! أرغب في حجز موعد.' },
          contact: { title: 'زورينا', hoursLabel: 'ساعات العمل' },
        },
      },
    },
    {
      slug: 'editorial-premium',
      name: 'Editorial Premium',
      description: 'Minimal, editorial. For high-end ladies salons + spas (JLT, Marina, BB).',
      suitableCategories: ['salon_premium', 'salon_hammam_spa'],
      componentPath: 'editorial-premium',
      designTokens: {
        colors: {
          primary: '#1a1a1a',
          secondary: '#f5f4f0',
          accent: '#a08960',
          background: '#fafaf8',
          text: '#0a0a0a',
        },
        fonts: { display: 'Cormorant Garamond', body: 'Inter', arabic: 'Amiri' },
        radius: 'sharp' as const,
      },
      defaultContent: {
        en: {
          hero: {
            headline: 'A quieter kind of luxury.',
            sub: 'Considered services. Skilled hands. A space designed for stillness.',
            ctaPrimary: 'Reserve',
            ctaSecondary: 'Explore services',
          },
          services: { title: 'Services' },
          gallery: { title: 'The space' },
          reviews: { title: 'Guests' },
          booking: {
            title: 'Reservations',
            whatsappMessage: 'Hello, I would like to make a reservation.',
          },
          contact: { title: 'Find us', hoursLabel: 'Hours' },
        },
        ar: {
          hero: {
            headline: 'فخامة بأسلوب هادئ',
            sub: 'خدمات مدروسة. أيادٍ ماهرة. مساحة مصممة للسكينة.',
            ctaPrimary: 'احجزي',
            ctaSecondary: 'الخدمات',
          },
          services: { title: 'الخدمات' },
          gallery: { title: 'المكان' },
          reviews: { title: 'ضيوفنا' },
          booking: { title: 'الحجوزات', whatsappMessage: 'مرحبا، أرغب في إجراء حجز.' },
          contact: { title: 'تواصلي معنا', hoursLabel: 'ساعات العمل' },
        },
      },
    },
    {
      slug: 'dark-barber',
      name: 'Dark Barber',
      description: "Bold, dark, masculine. For men's barbershops.",
      suitableCategories: ['salon_mens_barber'],
      componentPath: 'dark-barber',
      designTokens: {
        colors: {
          primary: '#d4a955',
          secondary: '#1a1a1a',
          accent: '#8b3a1f',
          background: '#0d0d0d',
          text: '#f0e8d8',
        },
        fonts: { display: 'Oswald', body: 'Inter', arabic: 'Cairo' },
        radius: 'sharp' as const,
      },
      defaultContent: {
        en: {
          hero: {
            headline: 'Sharp cuts. No fuss.',
            sub: "Walk-ins welcome. Book ahead if you're short on time.",
            ctaPrimary: 'Book a chair',
            ctaSecondary: 'Services',
          },
          services: { title: 'Cuts & Services' },
          gallery: { title: 'The work' },
          reviews: { title: 'What the regulars say' },
          booking: { title: 'Book your slot', whatsappMessage: "Hey, I'd like to book a haircut." },
          contact: { title: 'Come by', hoursLabel: 'Open' },
        },
        ar: {
          hero: {
            headline: 'قصات حادة. بدون تعقيد.',
            sub: 'بدون موعد مرحب بكم. احجز مسبقاً إذا كان وقتك ضيقاً.',
            ctaPrimary: 'احجز كرسي',
            ctaSecondary: 'الخدمات',
          },
          services: { title: 'القصات والخدمات' },
          gallery: { title: 'الأعمال' },
          reviews: { title: 'آراء الزبائن' },
          booking: { title: 'احجز موعدك', whatsappMessage: 'مرحبا، أرغب في حجز قصة شعر.' },
          contact: { title: 'زورنا', hoursLabel: 'الدوام' },
        },
      },
    },
  ];

  for (const t of salonTemplates) {
    const existing = await db.query.templates.findFirst({
      where: eq(templates.slug, t.slug),
      columns: { id: true },
    });
    if (existing) {
      console.log(`  ✓ template "${t.slug}" already exists`);
      continue;
    }
    await db.insert(templates).values(t);
    console.log(`  + created template "${t.slug}"`);
  }
}

async function seedMessageTemplates() {
  console.log('Seeding outreach message templates...');

  const msgs = [
    {
      slug: 'whatsapp-salon-cold-1',
      name: 'Salon — Cold Outreach #1',
      channel: 'whatsapp' as const,
      funnelStage: 'cold_1',
      bodyEn:
        'Hi! I came across {{name}} on Google — your reviews look amazing 🌸\n\n' +
        'I run a small studio in Business Bay that builds websites for salons in Dubai. ' +
        'I put together a sample design for {{name}} — want a quick look? No pressure: {{demoUrl}}\n\n' +
        '— {{senderName}}, SEED IT',
      bodyAr:
        'أهلا! شفت {{name}} على قوقل و التقييمات حلوة 🌸\n\n' +
        'أنا من ستوديو صغير في بزنس باي نسوي مواقع للصالونات في دبي. ' +
        'سويت تصميم تجريبي لـ {{name}} — حابة تشوفينه؟ بدون أي التزام: {{demoUrl}}\n\n' +
        '— {{senderName}}, سيد آي تي',
      providerTemplateName: 'salon_cold_1',
    },
    {
      slug: 'whatsapp-salon-follow-up-1',
      name: 'Salon — Follow-up #1 (3 days)',
      channel: 'whatsapp' as const,
      funnelStage: 'follow_up_1',
      bodyEn:
        'Hi again — just checking if you had a chance to see the sample for {{name}}: {{demoUrl}}\n\n' +
        "Happy to adjust anything or hop on a quick call. I'm in Business Bay, can also come to you.",
      bodyAr:
        'مرحبا مرة ثانية — حابة أتأكد إذا شفتي التصميم اللي أرسلته لـ {{name}}: {{demoUrl}}\n\n' +
        'مستعدة أعدل أي شي أو نسوي مكالمة قصيرة. أنا في بزنس باي و ممكن آجي عندكم.',
      providerTemplateName: 'salon_followup_1',
    },
  ];

  for (const m of msgs) {
    const existing = await db.query.messageTemplates.findFirst({
      where: eq(messageTemplates.slug, m.slug),
      columns: { id: true },
    });
    if (existing) {
      console.log(`  ✓ message template "${m.slug}" already exists`);
      continue;
    }
    await db.insert(messageTemplates).values(m);
    console.log(`  + created message template "${m.slug}"`);
  }
}

async function main() {
  await seedTemplates();
  await seedMessageTemplates();
  console.log('Done.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
