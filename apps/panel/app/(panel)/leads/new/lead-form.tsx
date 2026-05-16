'use client';

import { useActionState } from 'react';
import type { LeadResult } from './actions';

const input =
  'w-full h-10 px-3 rounded-md border border-border bg-background text-sm ' +
  'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary';
const textarea =
  'w-full px-3 py-2 rounded-md border border-border bg-background text-sm ' +
  'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-y';
const lbl = 'block text-xs font-medium text-muted-foreground mb-1';

const CATEGORIES: { value: string; label: string }[] = [
  { value: 'salon_ladies', label: "Salon — ladies'" },
  { value: 'salon_mens_barber', label: "Salon — men's barber" },
  { value: 'salon_premium', label: 'Salon — premium' },
  { value: 'salon_hammam_spa', label: 'Salon / Hammam / Spa' },
  { value: 'salon_brow_lash', label: 'Brow / lash / nail studio' },
  { value: 'salon_mobile', label: 'Mobile salon' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'clinic_dental', label: 'Clinic — dental' },
  { value: 'clinic_dermatology', label: 'Clinic — dermatology' },
  { value: 'clinic_general', label: 'Clinic — general' },
  { value: 'real_estate_broker', label: 'Real estate broker' },
  { value: 'auto_garage', label: 'Auto garage' },
  { value: 'tailor', label: 'Tailor' },
  { value: 'cleaning_services', label: 'Cleaning services' },
  { value: 'law_firm', label: 'Law firm' },
  { value: 'consultancy', label: 'Consultancy' },
  { value: 'other', label: 'Other' },
];

const EMIRATES: { value: string; label: string }[] = [
  { value: 'dubai', label: 'Dubai' },
  { value: 'abu_dhabi', label: 'Abu Dhabi' },
  { value: 'sharjah', label: 'Sharjah' },
  { value: 'ajman', label: 'Ajman' },
  { value: 'fujairah', label: 'Fujairah' },
  { value: 'ras_al_khaimah', label: 'Ras Al Khaimah' },
  { value: 'umm_al_quwain', label: 'Umm Al Quwain' },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
        <div className="flex-1 border-t border-border" />
      </div>
      {children}
    </section>
  );
}

export function LeadForm({
  action,
}: {
  action: (prev: LeadResult | null, fd: FormData) => Promise<LeadResult>;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const errorMsg = state && 'error' in state ? state.error : null;

  return (
    <form action={formAction} className="space-y-7">
      {errorMsg && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <strong>Error:</strong> {errorMsg}
        </div>
      )}

      <Section title="Business">
        <div>
          <label className={lbl} htmlFor="name">Name <span className="text-red-600">*</span></label>
          <input id="name" name="name" type="text" required placeholder="Karama Beauty Lounge" className={input} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={lbl} htmlFor="category">Category</label>
            <select id="category" name="category" defaultValue="salon_ladies" className={input}>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={lbl} htmlFor="emirate">Emirate</label>
            <select id="emirate" name="emirate" defaultValue="dubai" className={input}>
              {EMIRATES.map((e) => (
                <option key={e.value} value={e.value}>{e.label}</option>
              ))}
            </select>
          </div>
        </div>
      </Section>

      <Section title="Location">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={lbl} htmlFor="areaZone">Area / neighbourhood</label>
            <input id="areaZone" name="areaZone" type="text" placeholder="Karama, Bur Dubai, Satwa…" className={input} />
          </div>
          <div>
            <label className={lbl} htmlFor="languagePref">Language preference</label>
            <select id="languagePref" name="languagePref" defaultValue="unknown" className={input}>
              <option value="unknown">Unknown</option>
              <option value="en">English</option>
              <option value="ar">Arabic</option>
              <option value="bilingual">Bilingual</option>
            </select>
          </div>
        </div>
        <div>
          <label className={lbl} htmlFor="address">Address</label>
          <input id="address" name="address" type="text" placeholder="Shop 14, Karama Centre, Dubai" className={input} />
        </div>
        <div>
          <label className={lbl} htmlFor="googleMapsUrl">
            Google Maps URL{' '}
            <span className="text-muted-foreground/70 normal-case">
              (paste the full URL — lat/lng will be auto-extracted)
            </span>
          </label>
          <input
            id="googleMapsUrl"
            name="googleMapsUrl"
            type="url"
            placeholder="https://www.google.com/maps/place/..."
            className={`${input} font-mono text-xs`}
          />
        </div>
      </Section>

      <Section title="Contact">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={lbl} htmlFor="phone">Phone</label>
            <input id="phone" name="phone" type="tel" placeholder="+971 50 000 0000" className={`${input} font-mono`} />
          </div>
          <div>
            <label className={lbl} htmlFor="whatsappNumber">WhatsApp number</label>
            <input id="whatsappNumber" name="whatsappNumber" type="tel" placeholder="+971 50 000 0000" className={`${input} font-mono`} />
          </div>
        </div>
        <p className="text-xs text-muted-foreground -mt-2">
          At least one of phone / WhatsApp is required so outreach can reach them.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={lbl} htmlFor="email">Email</label>
            <input id="email" name="email" type="email" placeholder="hello@example.com" className={`${input} font-mono`} />
          </div>
          <div>
            <label className={lbl} htmlFor="instagramHandle">Instagram handle</label>
            <input id="instagramHandle" name="instagramHandle" type="text" placeholder="karama.beauty" className={input} />
          </div>
        </div>
        <div>
          <label className={lbl} htmlFor="websiteUrl">Website URL (if any)</label>
          <input id="websiteUrl" name="websiteUrl" type="url" placeholder="https://…" className={`${input} font-mono text-xs`} />
          <p className="mt-1 text-xs text-muted-foreground">
            Leave blank if they have no website — that&apos;s the buying signal.
          </p>
        </div>
      </Section>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"
        >
          {pending ? 'Saving…' : 'Save lead'}
        </button>
        <a
          href="/leads"
          className="h-9 px-4 rounded-md border border-border text-sm font-medium hover:bg-muted flex items-center"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
