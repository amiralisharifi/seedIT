'use client';

import { useActionState } from 'react';
import type { ContactResult } from './actions';

const base =
  'w-full h-10 px-3 rounded-md border border-border bg-background text-sm ' +
  'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary';
const lbl = 'block text-xs font-medium text-muted-foreground mb-1';

function Field({
  label,
  name,
  type = 'text',
  value,
  placeholder,
  mono,
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  placeholder?: string;
  mono?: boolean;
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={name} className={lbl}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={value}
        placeholder={placeholder}
        className={base + (mono ? ' font-mono' : '')}
      />
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 pt-2">
      <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
        {children}
      </span>
      <div className="flex-1 border-t border-border" />
    </div>
  );
}

export function ContactForm({
  initial,
  action,
}: {
  initial: Record<string, string>;
  action: (prev: ContactResult | null, fd: FormData) => Promise<ContactResult>;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const saved = state && 'ok' in state;
  const errorMsg = state && 'error' in state ? state.error : null;

  return (
    <form action={formAction} className="space-y-5">
      {errorMsg && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <strong>Error:</strong> {errorMsg}
        </div>
      )}
      {saved && (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          Saved successfully.
        </div>
      )}

      <SectionTitle>Contact</SectionTitle>
      <Field label="Phone" name="phone" type="tel" value={initial.phone ?? ''} placeholder="+971 50 000 0000" mono />
      <Field label="WhatsApp" name="whatsapp" type="tel" value={initial.whatsapp ?? ''} placeholder="+971 50 000 0000" mono />
      <Field label="Business hours" name="hours" value={initial.hours ?? ''} placeholder="Sun–Thu · 9:00–18:00 GST" />
      <Field label="Support email" name="supportEmail" type="email" value={initial.supportEmail ?? ''} placeholder="hello@example.com" mono />
      <Field label="Sales email" name="salesEmail" type="email" value={initial.salesEmail ?? ''} placeholder="sales@example.com" mono />

      <SectionTitle>Business</SectionTitle>
      <Field label="Legal name" name="legalName" value={initial.legalName ?? ''} placeholder="SEED IT FZ-LLC" />
      <Field label="Address" name="address" value={initial.address ?? ''} placeholder="Business Bay, Dubai, UAE" />
      <Field label="Trade license no." name="tradeLicense" value={initial.tradeLicense ?? ''} mono />
      <Field label="VAT TRN" name="vatTrn" value={initial.vatTrn ?? ''} mono />

      <SectionTitle>Social</SectionTitle>
      <Field label="Instagram handle" name="instagram" value={initial.instagram ?? ''} placeholder="seedit.ae" />
      <Field label="LinkedIn (company/...)" name="linkedin" value={initial.linkedin ?? ''} placeholder="company/seedit-ae" />
      <Field label="X / Twitter handle" name="x" value={initial.x ?? ''} placeholder="seedit_ae" />

      <div className="pt-2">
        <button
          type="submit"
          disabled={pending}
          className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"
        >
          {pending ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}
