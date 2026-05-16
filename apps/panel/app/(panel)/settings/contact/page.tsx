import { PageHeader } from '@/components/layout/page-header';
import { queries } from '@seed-panel/db';
import { brand } from '@/config';
import { ContactForm } from './contact-form';
import { saveContactSettings } from './actions';

export const metadata = { title: 'Contact Settings' };

export default async function ContactSettingsPage() {
  let contact: Record<string, unknown> = {};
  let social: Record<string, unknown> = {};

  try {
    contact = await queries.getSettings('contact');
    social = await queries.getSettings('social');
  } catch {
    // If DB is unreachable fall back to brand config defaults
  }

  // Merge DB values on top of brand.ts defaults so first load is pre-filled
  const initial = {
    phone: (contact.phone as string) || brand.business.phone,
    whatsapp: (contact.whatsapp as string) || brand.business.whatsapp,
    supportEmail: (contact.supportEmail as string) || brand.business.supportEmail,
    salesEmail: (contact.salesEmail as string) || brand.business.salesEmail,
    address: (contact.address as string) || brand.business.address,
    legalName: (contact.legalName as string) || brand.business.legalName,
    tradeLicense: (contact.tradeLicense as string) || brand.business.tradeLicense,
    vatTrn: (contact.vatTrn as string) || brand.business.vatTrn,
    instagram: (social.instagram as string) || brand.social.instagram,
    linkedin: (social.linkedin as string) || brand.social.linkedin,
    x: (social.x as string) || brand.social.x,
  };

  return (
    <>
      <PageHeader
        title="Contact & Social"
        description="Phone, WhatsApp, emails, address and social handles used on the public site."
      />
      <div className="p-8 max-w-2xl">
        <ContactForm initial={initial} action={saveContactSettings} />
      </div>
    </>
  );
}
