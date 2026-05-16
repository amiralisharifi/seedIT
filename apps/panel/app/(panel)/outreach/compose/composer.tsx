'use client';

import { useActionState, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { markOutreachSent, type SentResult } from './actions';

type LeadOption = {
  id: string;
  name: string;
  areaZone: string | null;
  phone: string | null;
  whatsappNumber: string | null;
  languagePref: 'ar' | 'en' | 'bilingual' | 'unknown';
  demo: { id: string; slug: string } | null;
};

type TemplateOption = {
  id: string;
  slug: string;
  name: string;
  channel: 'whatsapp' | 'email' | 'instagram_dm' | 'phone_call' | 'in_person';
  bodyEn: string | null;
  bodyAr: string | null;
};

type DemoInfo = { id: string; slug: string } | null;

const input =
  'w-full h-10 px-3 rounded-md border border-border bg-background text-sm ' +
  'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary';
const textarea =
  'w-full px-3 py-2 rounded-md border border-border bg-background text-sm ' +
  'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-y';
const lbl = 'block text-xs font-medium text-muted-foreground mb-1';

function render(body: string, vars: Record<string, string>): string {
  return body.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) => vars[k] ?? '');
}

function digitsOnly(s: string | null | undefined): string {
  return (s ?? '').replace(/\D/g, '');
}

export function Composer({
  leads,
  templates,
  siteUrl,
  defaultSenderName,
  initialLeadId,
  initialTemplateId,
  initialDemo,
}: {
  leads: LeadOption[];
  templates: TemplateOption[];
  siteUrl: string;
  defaultSenderName: string;
  initialLeadId?: string;
  initialTemplateId?: string;
  initialDemo?: DemoInfo;
}) {
  const router = useRouter();

  const [leadId, setLeadId] = useState(initialLeadId ?? '');
  const [templateId, setTemplateId] = useState(initialTemplateId ?? '');
  const [locale, setLocale] = useState<'en' | 'ar'>('en');
  const [senderName, setSenderName] = useState(defaultSenderName);
  const [demo, setDemo] = useState<DemoInfo>(initialDemo ?? null);
  const [bodyOverride, setBodyOverride] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const lead = leads.find((l) => l.id === leadId) ?? null;
  const template = templates.find((t) => t.id === templateId) ?? null;

  // Demo follows the picked lead — already loaded on the server
  useEffect(() => {
    setDemo(lead?.demo ?? null);
  }, [lead]);

  // Auto-select language based on lead preference
  useEffect(() => {
    if (!lead) return;
    if (lead.languagePref === 'ar') setLocale('ar');
    else setLocale('en');
  }, [lead]);

  const mergeVars = useMemo(() => {
    return {
      name: lead?.name ?? '{{name}}',
      area: lead?.areaZone ?? '',
      demoUrl: demo ? `${siteUrl}/d/${demo.slug}` : '',
      senderName: senderName || 'Amirali',
    };
  }, [lead, demo, siteUrl, senderName]);

  const rawBody = useMemo(() => {
    if (!template) return '';
    return (locale === 'ar' ? template.bodyAr : template.bodyEn) ?? '';
  }, [template, locale]);

  const renderedFromTemplate = useMemo(() => render(rawBody, mergeVars), [rawBody, mergeVars]);
  const renderedBody = bodyOverride ?? renderedFromTemplate;

  // Reset overrides when template / lead / locale changes
  useEffect(() => {
    setBodyOverride(null);
  }, [templateId, leadId, locale]);

  const waDigits = digitsOnly(lead?.whatsappNumber || lead?.phone);
  const waLink = waDigits
    ? `https://wa.me/${waDigits}?text=${encodeURIComponent(renderedBody)}`
    : '';

  const [sendState, sendAction, sendPending] = useActionState(markOutreachSent, null);

  const sendError = sendState && 'error' in sendState ? sendState.error : null;
  const sendOk = sendState && 'ok' in sendState ? sendState : null;

  useEffect(() => {
    if (sendOk) router.refresh();
  }, [sendOk, router]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(renderedBody);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — ignore */
    }
  }

  const canSend = !!lead && renderedBody.trim().length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* LEFT: pickers + editor */}
      <div className="space-y-5">
        <div>
          <label className={lbl} htmlFor="leadId">Lead</label>
          <select
            id="leadId"
            value={leadId}
            onChange={(e) => setLeadId(e.target.value)}
            className={input}
          >
            <option value="">— pick a lead —</option>
            {leads.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}{l.areaZone ? ` · ${l.areaZone}` : ''}
              </option>
            ))}
          </select>
          {leads.length === 0 && (
            <p className="mt-2 text-xs text-amber-700">
              No leads found. <a href="/leads/new" className="underline">Add one</a> first.
            </p>
          )}
        </div>

        <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
          <div>
            <label className={lbl} htmlFor="templateId">Template</label>
            <select
              id="templateId"
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              className={input}
            >
              <option value="">— pick a template —</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            {templates.length === 0 && (
              <p className="mt-2 text-xs text-amber-700">
                No templates seeded yet. Run <code>pnpm db:seed</code> locally to get the
                starter WhatsApp templates.
              </p>
            )}
          </div>
          <div>
            <label className={lbl}>Language</label>
            <div className="flex gap-1 rounded-md border border-border p-0.5">
              {(['en', 'ar'] as const).map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setLocale(loc)}
                  className={
                    'h-8 px-3 rounded text-xs font-mono uppercase ' +
                    (locale === loc
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground')
                  }
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className={lbl} htmlFor="senderName">Sender name <span className="text-muted-foreground/70 normal-case">(for {'{{senderName}}'})</span></label>
          <input
            id="senderName"
            type="text"
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            placeholder="Amirali"
            className={input}
          />
        </div>

        {!demo && lead && (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            No demo found for this lead. <code>{'{{demoUrl}}'}</code> will render empty.{' '}
            <a href="/demos/new" className="underline">Create one →</a>
          </div>
        )}
        {demo && (
          <div className="rounded-md border border-border bg-muted/30 px-3 py-2 text-xs">
            Demo: <a href={`${siteUrl}/d/${demo.slug}`} target="_blank" rel="noreferrer" className="font-mono text-primary hover:underline">{siteUrl}/d/{demo.slug}</a>
          </div>
        )}

        <div>
          <label className={lbl}>
            Message{' '}
            <span className="text-muted-foreground/70 normal-case">
              ({renderedBody.length} chars · edits override template)
            </span>
          </label>
          <textarea
            value={renderedBody}
            onChange={(e) => setBodyOverride(e.target.value)}
            rows={12}
            dir={locale === 'ar' ? 'rtl' : 'ltr'}
            className={`${textarea} ${locale === 'ar' ? 'text-right font-sans' : 'font-sans'}`}
          />
        </div>
      </div>

      {/* RIGHT: preview + actions */}
      <div className="space-y-5">
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 text-xs font-mono uppercase tracking-wider text-emerald-700 flex items-center justify-between">
            <span>WhatsApp preview</span>
            {lead && (
              <span className="text-emerald-600/70 normal-case font-sans">
                → {lead.whatsappNumber || lead.phone || '(no number)'}
              </span>
            )}
          </div>
          <div
            className={`p-4 text-sm whitespace-pre-wrap ${locale === 'ar' ? 'text-right' : ''}`}
            dir={locale === 'ar' ? 'rtl' : 'ltr'}
          >
            {renderedBody || (
              <span className="text-muted-foreground italic">
                Pick a lead and template to see the message…
              </span>
            )}
          </div>
        </div>

        {sendError && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {sendError}
          </div>
        )}
        {sendOk && (
          <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            ✓ Logged as sent. <a href="/outreach" className="underline">View history</a>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <a
            href={canSend && waDigits ? waLink : undefined}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => {
              if (!canSend || !waDigits) e.preventDefault();
            }}
            aria-disabled={!canSend || !waDigits}
            className={
              'h-10 px-4 rounded-md text-sm font-medium flex items-center gap-2 ' +
              (canSend && waDigits
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-muted text-muted-foreground cursor-not-allowed')
            }
          >
            <span>Open WhatsApp Web</span>
            <span>↗</span>
          </a>
          <button
            type="button"
            onClick={handleCopy}
            disabled={!canSend}
            className="h-10 px-4 rounded-md border border-border text-sm font-medium hover:bg-muted disabled:opacity-50"
          >
            {copied ? '✓ Copied' : 'Copy message'}
          </button>
        </div>

        <form action={sendAction}>
          <input type="hidden" name="businessId" value={lead?.id ?? ''} />
          <input type="hidden" name="templateId" value={template?.id ?? ''} />
          <input type="hidden" name="demoId" value={demo?.id ?? ''} />
          <input type="hidden" name="channel" value="whatsapp" />
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="renderedBody" value={renderedBody} />
          <button
            type="submit"
            disabled={!canSend || sendPending}
            className="w-full h-10 px-4 rounded-md border border-primary text-primary text-sm font-medium hover:bg-primary/5 disabled:opacity-50"
          >
            {sendPending ? 'Logging…' : 'Mark as sent (log to history)'}
          </button>
        </form>

        <p className="text-xs text-muted-foreground">
          Two-step send: click <strong>Open WhatsApp Web</strong>, hit send on your phone or browser,
          then come back here and click <strong>Mark as sent</strong> to log it for dashboard metrics
          and the conversation timeline.
        </p>
      </div>
    </div>
  );
}
