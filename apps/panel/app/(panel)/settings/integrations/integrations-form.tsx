'use client';

import { useActionState } from 'react';
import type { IntegrationsResult } from './actions';

const base =
  'w-full h-10 px-3 rounded-md border border-border bg-background text-sm font-mono ' +
  'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary';
const lbl = 'block text-xs font-medium text-muted-foreground mb-1';

function Field({
  label,
  name,
  value,
  placeholder,
  hint,
}: {
  label: string;
  name: string;
  value: string;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={name} className={lbl}>{label}</label>
      <input
        id={name}
        name={name}
        type="text"
        defaultValue={value}
        placeholder={placeholder}
        className={base}
      />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Toggle({ name, checked, label }: { name: string; checked: boolean; label: string }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <div className="relative">
        <input type="checkbox" name={name} defaultChecked={checked} className="sr-only peer" />
        <div className="h-5 w-9 rounded-full bg-muted peer-checked:bg-primary transition-colors" />
        <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
      </div>
      <span className="text-sm font-medium">{label}</span>
    </label>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border p-5 space-y-4">
      <h3 className="text-sm font-semibold">{title}</h3>
      {children}
    </div>
  );
}

export function IntegrationsForm({
  initial,
  seoDefaults,
  action,
}: {
  initial: Record<string, unknown>;
  seoDefaults: Record<string, unknown>;
  action: (prev: IntegrationsResult | null, fd: FormData) => Promise<IntegrationsResult>;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const saved = state && 'ok' in state;
  const errorMsg = state && 'error' in state ? state.error : null;

  const str = (key: string) => (initial[key] as string) || '';
  const bool = (key: string) => !!initial[key];
  const seo = (key: string) => (seoDefaults[key] as string) || '';

  return (
    <form action={formAction} className="space-y-6">
      {errorMsg && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <strong>Error:</strong> {errorMsg}
        </div>
      )}
      {saved && (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          Saved. Changes on the public site take effect within 1 hour.
        </div>
      )}

      <Card title="Google Analytics 4">
        <Toggle name="ga4Enabled" checked={bool('ga4Enabled')} label="Enable GA4" />
        <Field
          label="Measurement ID"
          name="ga4MeasurementId"
          value={str('ga4MeasurementId')}
          placeholder="G-XXXXXXXXXX"
          hint="Found in GA4 → Admin → Data Streams → your stream → Measurement ID"
        />
      </Card>

      <Card title="Google Tag Manager">
        <Toggle name="gtmEnabled" checked={bool('gtmEnabled')} label="Enable GTM" />
        <Field
          label="Container ID"
          name="gtmContainerId"
          value={str('gtmContainerId')}
          placeholder="GTM-XXXXXXX"
          hint="Found in GTM → your container → top-right corner"
        />
      </Card>

      <Card title="Google Search Console">
        <Toggle name="gscEnabled" checked={bool('gscEnabled')} label="Enable verification tag" />
        <Field
          label="Verification token"
          name="gscVerificationToken"
          value={str('gscVerificationToken')}
          placeholder="paste the content= value from the meta tag"
          hint="In GSC → Settings → Ownership verification → HTML tag → copy only the content= value"
        />
      </Card>

      <Card title="Bing Webmaster Tools">
        <Toggle name="bwtEnabled" checked={bool('bwtEnabled')} label="Enable verification tag" />
        <Field
          label="Verification token"
          name="bwtVerificationToken"
          value={str('bwtVerificationToken')}
          placeholder="paste the content= value from the meta tag"
          hint="In Bing Webmaster → Settings → Site verification → HTML meta tag → copy only the content= value"
        />
      </Card>

      <Card title="Other verifications">
        <Field label="Yandex Webmaster" name="yandexVerification" value={str('yandexVerification')} placeholder="verification token" />
        <Field label="Pinterest" name="pinterestVerification" value={str('pinterestVerification')} placeholder="verification token" />
        <Field label="Facebook domain" name="facebookDomainVerification" value={str('facebookDomainVerification')} placeholder="verification token" />
        <Field label="Ahrefs" name="ahrefsVerification" value={str('ahrefsVerification')} placeholder="verification token" />
      </Card>

      <Card title="SEO defaults">
        <Field
          label="Site name"
          name="siteName"
          value={seo('siteName')}
          placeholder="SEED IT"
          hint="Used in OG site_name and the page title template"
        />
        <Field
          label="Default description"
          name="defaultDescription"
          value={seo('defaultDescription')}
          placeholder="Web development, automation & design from Dubai."
          hint="Falls back to this when a page has no meta description"
        />
        <Field
          label="Default OG image URL"
          name="defaultOgImage"
          value={seo('defaultOgImage')}
          placeholder="https://seedit.ae/og.png"
          hint="1200×630 recommended. Used when a blog post has no cover image."
        />
        <Field
          label="Twitter / X handle"
          name="twitterHandle"
          value={seo('twitterHandle')}
          placeholder="@seedit_ae"
          hint="Include the @. Sets twitter:site and twitter:creator."
        />
      </Card>

      <div>
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
