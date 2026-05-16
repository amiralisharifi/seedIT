'use client';

import { useActionState, useState } from 'react';
import type { DemoResult } from './actions';

type BusinessOption = {
  id: string;
  name: string;
  areaZone: string | null;
  category: string;
};

type ServiceItem = { name: string; price: string; duration: string };

type Initial = {
  businessId?: string;
  slug?: string;
  status?: string;
  internalNotes?: string;
  content?: {
    en?: {
      hero?: {
        headline?: string;
        sub?: string;
        ctaPrimary?: string;
        ctaSecondary?: string;
      };
      services?: {
        title?: string;
        items?: ServiceItem[];
      };
      about?: { title?: string; body?: string };
      contact?: { title?: string; hoursLabel?: string };
      booking?: { whatsappMessage?: string };
    };
  };
};

const input =
  'w-full h-10 px-3 rounded-md border border-border bg-background text-sm ' +
  'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary';
const textarea =
  'w-full px-3 py-2 rounded-md border border-border bg-background text-sm ' +
  'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-y';
const lbl = 'block text-xs font-medium text-muted-foreground mb-1';

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

const STATUS_OPTIONS = [
  'draft',
  'approved',
  'sent',
  'viewed',
  'multi_viewed',
  'replied',
  'archived',
] as const;

export function DemoForm({
  mode,
  businesses,
  initial,
  action,
}: {
  mode: 'create' | 'edit';
  businesses: BusinessOption[];
  initial: Initial;
  action: (prev: DemoResult | null, fd: FormData) => Promise<DemoResult>;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const errorMsg = state && 'error' in state ? state.error : null;
  const saved = state && 'id' in state && mode === 'edit';

  const [selectedBizId, setSelectedBizId] = useState(initial.businessId ?? '');
  const selectedBiz = businesses.find((b) => b.id === selectedBizId);

  const [services, setServices] = useState<ServiceItem[]>(
    (initial.content?.en?.services?.items as ServiceItem[] | undefined) ?? [
      { name: '', price: '', duration: '' },
    ],
  );

  const en = initial.content?.en ?? {};

  function addService() {
    setServices((s) => [...s, { name: '', price: '', duration: '' }]);
  }
  function removeService(i: number) {
    setServices((s) => s.filter((_, idx) => idx !== i));
  }
  function updateService(i: number, field: keyof ServiceItem, value: string) {
    setServices((s) => s.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)));
  }

  const filteredServices = services.filter((s) => s.name.trim().length > 0);

  return (
    <form action={formAction} className="space-y-7">
      {errorMsg && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <strong>Error:</strong> {errorMsg}
        </div>
      )}
      {saved && (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          Saved.
        </div>
      )}

      {/* Hidden serialized services */}
      <input type="hidden" name="services" value={JSON.stringify(filteredServices)} />
      {/* Hidden business name so action can slugify */}
      <input type="hidden" name="businessName" value={selectedBiz?.name ?? ''} />

      <Section title="Business">
        {mode === 'create' ? (
          <div>
            <label className={lbl} htmlFor="businessId">
              Pick a business
            </label>
            <select
              id="businessId"
              name="businessId"
              required
              value={selectedBizId}
              onChange={(e) => setSelectedBizId(e.target.value)}
              className={input}
            >
              <option value="">— select —</option>
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                  {b.areaZone ? ` — ${b.areaZone}` : ''}
                </option>
              ))}
            </select>
            {businesses.length === 0 && (
              <p className="mt-2 text-xs text-amber-700">
                No businesses found. Add one in <a href="/leads" className="underline">Leads</a> first.
              </p>
            )}
          </div>
        ) : (
          <div className="rounded-md border border-border bg-muted/30 px-4 py-3 text-sm">
            <span className="text-muted-foreground">Linked to: </span>
            <span className="font-medium">{selectedBiz?.name ?? initial.businessId}</span>
            <input type="hidden" name="businessId" value={initial.businessId ?? ''} />
          </div>
        )}
      </Section>

      <Section title="URL">
        <div>
          <label className={lbl} htmlFor="slug">
            Slug{' '}
            <span className="text-muted-foreground/70 normal-case">
              (auto-generated from business name if left blank)
            </span>
          </label>
          <input
            id="slug"
            name="slug"
            type="text"
            defaultValue={initial.slug ?? ''}
            placeholder="karama-beauty"
            className={`${input} font-mono`}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Demo lives at <code>seedit.ae/d/&lt;slug&gt;</code>
          </p>
        </div>
      </Section>

      <Section title="Hero">
        <div>
          <label className={lbl} htmlFor="hero_headline">Headline</label>
          <input
            id="hero_headline"
            name="hero_headline"
            type="text"
            defaultValue={en.hero?.headline ?? ''}
            placeholder="Walk in beautiful. Walk out radiant."
            className={input}
          />
        </div>
        <div>
          <label className={lbl} htmlFor="hero_sub">Subtitle</label>
          <textarea
            id="hero_sub"
            name="hero_sub"
            defaultValue={en.hero?.sub ?? ''}
            rows={2}
            placeholder="Hair, nails, and skin care by a team that has served Karama for 12 years."
            className={textarea}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={lbl} htmlFor="hero_ctaPrimary">Primary CTA label</label>
            <input
              id="hero_ctaPrimary"
              name="hero_ctaPrimary"
              type="text"
              defaultValue={en.hero?.ctaPrimary ?? 'Book on WhatsApp'}
              className={input}
            />
          </div>
          <div>
            <label className={lbl} htmlFor="hero_ctaSecondary">Secondary CTA label</label>
            <input
              id="hero_ctaSecondary"
              name="hero_ctaSecondary"
              type="text"
              defaultValue={en.hero?.ctaSecondary ?? ''}
              placeholder="Call now"
              className={input}
            />
          </div>
        </div>
      </Section>

      <Section title="Services">
        <div>
          <label className={lbl} htmlFor="services_title">Section title</label>
          <input
            id="services_title"
            name="services_title"
            type="text"
            defaultValue={en.services?.title ?? 'Most loved services'}
            className={input}
          />
        </div>
        <div className="space-y-2">
          {services.map((s, i) => (
            <div key={i} className="grid grid-cols-[1fr_120px_120px_auto] gap-2 items-end">
              <div>
                {i === 0 && <label className={lbl}>Name</label>}
                <input
                  type="text"
                  value={s.name}
                  onChange={(e) => updateService(i, 'name', e.target.value)}
                  placeholder="Hair colour + blow dry"
                  className={input}
                />
              </div>
              <div>
                {i === 0 && <label className={lbl}>Price</label>}
                <input
                  type="text"
                  value={s.price}
                  onChange={(e) => updateService(i, 'price', e.target.value)}
                  placeholder="AED 220"
                  className={`${input} font-mono`}
                />
              </div>
              <div>
                {i === 0 && <label className={lbl}>Duration</label>}
                <input
                  type="text"
                  value={s.duration}
                  onChange={(e) => updateService(i, 'duration', e.target.value)}
                  placeholder="90 min"
                  className={input}
                />
              </div>
              <button
                type="button"
                onClick={() => removeService(i)}
                className="h-10 w-10 rounded-md border border-border text-muted-foreground hover:text-red-600 hover:border-red-300"
                aria-label="Remove service"
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addService}
            className="h-9 px-3 rounded-md border border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:border-border"
          >
            + Add service
          </button>
        </div>
      </Section>

      <Section title="About">
        <div>
          <label className={lbl} htmlFor="about_title">Title</label>
          <input
            id="about_title"
            name="about_title"
            type="text"
            defaultValue={en.about?.title ?? ''}
            placeholder="Twelve years in Karama"
            className={input}
          />
        </div>
        <div>
          <label className={lbl} htmlFor="about_body">Body</label>
          <textarea
            id="about_body"
            name="about_body"
            defaultValue={en.about?.body ?? ''}
            rows={4}
            placeholder="A short paragraph about the salon — what makes it special."
            className={textarea}
          />
        </div>
      </Section>

      <Section title="Contact & booking">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={lbl} htmlFor="contact_title">Contact section title</label>
            <input
              id="contact_title"
              name="contact_title"
              type="text"
              defaultValue={en.contact?.title ?? 'Find us'}
              className={input}
            />
          </div>
          <div>
            <label className={lbl} htmlFor="contact_hoursLabel">Hours label</label>
            <input
              id="contact_hoursLabel"
              name="contact_hoursLabel"
              type="text"
              defaultValue={en.contact?.hoursLabel ?? 'Open daily 10:00 – 22:00'}
              className={input}
            />
          </div>
        </div>
        <div>
          <label className={lbl} htmlFor="booking_whatsappMessage">
            WhatsApp prefilled message
          </label>
          <textarea
            id="booking_whatsappMessage"
            name="booking_whatsappMessage"
            defaultValue={en.booking?.whatsappMessage ?? ''}
            rows={2}
            placeholder="Hi! I'd like to book at {Business Name}."
            className={textarea}
          />
        </div>
      </Section>

      <Section title="Internal">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={lbl} htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              defaultValue={initial.status ?? 'draft'}
              className={input}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className={lbl} htmlFor="internalNotes">Internal notes</label>
          <textarea
            id="internalNotes"
            name="internalNotes"
            defaultValue={initial.internalNotes ?? ''}
            rows={2}
            placeholder="Not shown publicly. e.g. 'sent via WhatsApp 16 May'"
            className={textarea}
          />
        </div>
      </Section>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"
        >
          {pending ? 'Saving…' : mode === 'edit' ? 'Save changes' : 'Create demo'}
        </button>
        <a
          href="/demos"
          className="h-9 px-4 rounded-md border border-border text-sm font-medium hover:bg-muted flex items-center"
        >
          Cancel
        </a>
        {mode === 'edit' && initial.slug && (
          <a
            href={`https://seedit.ae/d/${initial.slug}`}
            target="_blank"
            rel="noreferrer"
            className="ml-auto h-9 px-4 rounded-md border border-border text-sm font-medium hover:bg-muted flex items-center text-muted-foreground"
          >
            Preview live →
          </a>
        )}
      </div>
    </form>
  );
}
