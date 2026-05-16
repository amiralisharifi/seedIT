'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import type { CollectionDefinition, FieldDef } from '@seed-panel/core';
import type { ActionResult } from '@/app/(panel)/content/[collection]/actions';

const TOP_LEVEL_TYPES = new Set([
  'slug', 'select', 'boolean', 'datetime', 'date',
  'image', 'imageGallery', 'tags', 'reference',
  'number', 'url', 'email', 'file', 'icon', 'blocks', 'repeater',
]);

function isLocalized(name: string, field: FieldDef, col: CollectionDefinition) {
  if (!col.localized) return false;
  if (TOP_LEVEL_TYPES.has(field.type)) return false;
  if (name.startsWith('seo')) return false;
  return true;
}

function colToDb(name: string, field: FieldDef): string {
  if (field.type === 'image') return name + 'Url';
  if (field.type === 'reference') return name + 'Id';
  return name;
}

function getInitialValue(
  name: string,
  field: FieldDef,
  col: CollectionDefinition,
  record: Record<string, unknown> | null,
): string {
  if (!record) return '';
  if (isLocalized(name, field, col)) {
    const content = record.content as Record<string, Record<string, unknown>> | undefined;
    const val = content?.en?.[name];
    return val != null ? String(val) : '';
  }
  const db = colToDb(name, field);
  const val = record[db];
  if (val == null) return '';
  if (field.type === 'tags' && Array.isArray(val)) return val.join(', ');
  if (typeof val === 'string' && (field.type === 'datetime' || field.type === 'date'))
    return val.slice(0, 16);
  if (val instanceof Date) return val.toISOString().slice(0, 16);
  return String(val);
}

/* ─── field inputs ─── */

function FieldInput({
  name,
  field,
  initialValue,
  onTitleChange,
}: {
  name: string;
  field: FieldDef;
  initialValue: string;
  onTitleChange?: (v: string) => void;
}) {
  const inputName = `f_${name}`;
  const label = field.label ?? name.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim();
  const id = `field-${name}`;

  const base =
    'w-full h-10 px-3 rounded-md border border-border bg-background text-sm ' +
    'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary';
  const wrap = 'space-y-1.5';
  const lbl = 'block text-xs font-medium text-muted-foreground capitalize';
  const help = 'text-xs text-muted-foreground/70';

  if (['blocks', 'repeater', 'imageGallery', 'file', 'icon'].includes(field.type)) {
    return (
      <div className={wrap}>
        <span className={lbl}>{label}</span>
        <p className="text-xs text-muted-foreground italic">{field.type} — coming soon.</p>
      </div>
    );
  }

  if (field.type === 'boolean') {
    return (
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id={id}
          name={inputName}
          value="true"
          defaultChecked={initialValue === 'true'}
          className="h-4 w-4 rounded border-border accent-primary"
        />
        <label htmlFor={id} className="text-sm">{label}</label>
        {field.helpText && <span className={help}>— {field.helpText}</span>}
      </div>
    );
  }

  if (field.type === 'select') {
    const opts =
      typeof field.options[0] === 'string'
        ? (field.options as string[]).map((o) => ({ value: o, label: o }))
        : (field.options as { value: string; label: string }[]);
    return (
      <div className={wrap}>
        <label htmlFor={id} className={lbl}>{label}</label>
        <select
          id={id}
          name={inputName}
          defaultValue={initialValue || (field.default as string | undefined) || opts[0]?.value}
          className={base}
        >
          {opts.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        {field.helpText && <p className={help}>{field.helpText}</p>}
      </div>
    );
  }

  if (field.type === 'textarea') {
    return (
      <div className={wrap}>
        <div className="flex items-baseline justify-between">
          <label htmlFor={id} className={lbl}>{label}</label>
          {field.max && <CharCounter inputId={id} max={field.max} initial={initialValue.length} />}
        </div>
        <textarea
          id={id}
          name={inputName}
          defaultValue={initialValue}
          rows={field.rows ?? 4}
          required={field.required}
          maxLength={field.max}
          className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-y"
        />
        {field.helpText && <p className={help}>{field.helpText}</p>}
      </div>
    );
  }

  if (field.type === 'richText') {
    return (
      <div className={wrap}>
        <label htmlFor={id} className={lbl}>
          {label} <span className="text-muted-foreground/50 normal-case">(HTML)</span>
        </label>
        <textarea
          id={id}
          name={inputName}
          defaultValue={initialValue}
          rows={14}
          required={field.required}
          className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-y"
        />
        {field.helpText && <p className={help}>{field.helpText}</p>}
      </div>
    );
  }

  if (field.type === 'image') {
    return (
      <div className={wrap}>
        <label htmlFor={id} className={lbl}>
          {label} <span className="text-muted-foreground/50 normal-case">(URL)</span>
        </label>
        {initialValue && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={initialValue} alt="" className="h-24 w-auto rounded-md border border-border object-cover" />
        )}
        <input type="url" id={id} name={inputName} defaultValue={initialValue} placeholder="https://..." className={base} />
        {field.helpText && <p className={help}>{field.helpText}</p>}
      </div>
    );
  }

  if (field.type === 'tags') {
    return (
      <div className={wrap}>
        <label htmlFor={id} className={lbl}>{label}</label>
        <input type="text" id={id} name={inputName} defaultValue={initialValue} placeholder="tag1, tag2, tag3" className={base} />
        <p className={help}>Comma-separated</p>
      </div>
    );
  }

  if (field.type === 'datetime') {
    return (
      <div className={wrap}>
        <label htmlFor={id} className={lbl}>{label}</label>
        <input type="datetime-local" id={id} name={inputName} defaultValue={initialValue} className={base} />
        {field.helpText && <p className={help}>{field.helpText}</p>}
      </div>
    );
  }

  if (field.type === 'date') {
    return (
      <div className={wrap}>
        <label htmlFor={id} className={lbl}>{label}</label>
        <input type="date" id={id} name={inputName} defaultValue={initialValue} className={base} />
        {field.helpText && <p className={help}>{field.helpText}</p>}
      </div>
    );
  }

  if (field.type === 'number') {
    return (
      <div className={wrap}>
        <label htmlFor={id} className={lbl}>{label}</label>
        <input
          type="number"
          id={id}
          name={inputName}
          defaultValue={initialValue}
          min={field.min}
          max={field.max}
          step={field.step}
          className={base}
        />
        {field.helpText && <p className={help}>{field.helpText}</p>}
      </div>
    );
  }

  if (field.type === 'reference') {
    return (
      <div className={wrap}>
        <label htmlFor={id} className={lbl}>{label} <span className="text-muted-foreground/50 normal-case">(UUID)</span></label>
        <input type="text" id={id} name={inputName} defaultValue={initialValue} placeholder="UUID" className={`${base} font-mono text-xs`} />
        {field.helpText && <p className={help}>{field.helpText}</p>}
      </div>
    );
  }

  // slug — use React state so auto-generation is reliable
  if (field.type === 'slug') {
    return <SlugInput name={name} field={field} initialValue={initialValue} />;
  }

  // text, url, email
  const textMax = (field as { max?: number }).max;
  return (
    <div className={wrap}>
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className={lbl}>{label}</label>
        {textMax && field.type === 'text' && (
          <CharCounter inputId={id} max={textMax} initial={initialValue.length} />
        )}
      </div>
      <input
        type={field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : 'text'}
        id={id}
        name={inputName}
        defaultValue={initialValue}
        required={field.required}
        maxLength={textMax}
        className={base}
        onChange={name === 'title' && onTitleChange ? (e) => onTitleChange(e.target.value) : undefined}
      />
      {field.helpText && <p className={help}>{field.helpText}</p>}
    </div>
  );
}

function CharCounter({ inputId, max, initial }: { inputId: string; max: number; initial: number }) {
  const [count, setCount] = useState(initial);
  useEffect(() => {
    const el = document.getElementById(inputId) as HTMLInputElement | HTMLTextAreaElement | null;
    if (!el) return;
    const onInput = () => setCount(el.value.length);
    el.addEventListener('input', onInput);
    return () => el.removeEventListener('input', onInput);
  }, [inputId]);
  const warn = count > Math.floor(max * 0.9);
  const over = count >= max;
  const color = over ? 'text-red-600' : warn ? 'text-amber-600' : 'text-muted-foreground/70';
  return <span className={`text-[10px] font-mono ${color}`}>{count} / {max}</span>;
}

function SlugInput({ name, field, initialValue }: { name: string; field: FieldDef & { type: 'slug' }; initialValue: string }) {
  const [value, setValue] = useState(initialValue);
  const base =
    'w-full h-10 px-3 rounded-md border border-border bg-background text-sm font-mono ' +
    'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary';
  return (
    <div className="space-y-1.5">
      <label htmlFor={`field-${name}`} className="block text-xs font-medium text-muted-foreground capitalize">slug</label>
      <input
        type="text"
        id={`field-${name}`}
        name={`f_${name}`}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        required={field.required}
        placeholder="auto-generated-from-title"
        className={base}
        data-slug-input="true"
      />
      {field.helpText && <p className="text-xs text-muted-foreground/70">{field.helpText}</p>}
    </div>
  );
}

/* ─── main form ─── */

export function CollectionForm({
  collection,
  record,
  action,
}: {
  collection: CollectionDefinition;
  record: Record<string, unknown> | null;
  action: (prev: ActionResult | null, fd: FormData) => Promise<ActionResult>;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const formRef = useRef<HTMLFormElement>(null);

  const slugEntry = Object.entries(collection.fields).find(([, f]) => f.type === 'slug');

  function handleTitleChange(value: string) {
    if (!slugEntry || record) return;
    const slug = value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
    // Update the controlled SlugInput by dispatching a native change event
    const el = formRef.current?.querySelector<HTMLInputElement>('[data-slug-input="true"]');
    if (el) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
      nativeInputValueSetter?.call(el, slug);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  const fieldEntries = Object.entries(collection.fields);
  const localizedFields = fieldEntries.filter(([n, f]) => isLocalized(n, f, collection));
  const topFields = fieldEntries.filter(([n, f]) => !isLocalized(n, f, collection));
  const seoFields = topFields.filter(([n]) => n.startsWith('seo'));
  const settingsFields = topFields.filter(([n]) => !n.startsWith('seo'));
  const errorMsg = state && 'error' in state ? state.error : null;
  const saved = state && 'id' in state;

  return (
    <form ref={formRef} action={formAction} className="space-y-8">
      {errorMsg && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <strong>Error:</strong> {errorMsg}
        </div>
      )}
      {saved && !record && (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          Saved successfully.
        </div>
      )}

      {localizedFields.length > 0 && (
        <section className="space-y-5">
          {collection.localized && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Content (EN)</span>
              <div className="flex-1 border-t border-border" />
            </div>
          )}
          {localizedFields.map(([name, field]) => (
            <FieldInput
              key={name}
              name={name}
              field={field}
              initialValue={getInitialValue(name, field, collection, record)}
              onTitleChange={name === 'title' ? handleTitleChange : undefined}
            />
          ))}
        </section>
      )}

      {settingsFields.length > 0 && (
        <section className="space-y-5">
          {localizedFields.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Settings</span>
              <div className="flex-1 border-t border-border" />
            </div>
          )}
          {settingsFields.map(([name, field]) => (
            <FieldInput key={name} name={name} field={field} initialValue={getInitialValue(name, field, collection, record)} />
          ))}
        </section>
      )}

      {seoFields.length > 0 && (
        <section className="space-y-5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">SEO</span>
            <div className="flex-1 border-t border-border" />
          </div>
          {seoFields.map(([name, field]) => (
            <FieldInput key={name} name={name} field={field} initialValue={getInitialValue(name, field, collection, record)} />
          ))}
        </section>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"
        >
          {pending ? 'Saving…' : record ? 'Save changes' : `Create ${collection.nameSingular}`}
        </button>
        <a
          href={`/content/${collection.slug}`}
          className="h-9 px-4 rounded-md border border-border text-sm font-medium hover:bg-muted flex items-center"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
