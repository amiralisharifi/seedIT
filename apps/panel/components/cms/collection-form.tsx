'use client';

import { useTransition, useState, useRef } from 'react';
import type { CollectionDefinition, FieldDef } from '@seed-panel/core';

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
  const dbCol = colToDb(name, field);
  const val = record[dbCol];
  if (val == null) return '';
  if (field.type === 'tags' && Array.isArray(val)) return val.join(', ');
  if (val instanceof Date) return val.toISOString().slice(0, 16);
  if (typeof val === 'string' && field.type === 'datetime') return val.slice(0, 16);
  return String(val);
}

/* ─── individual field renderers ─── */

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
  const label = field.label ?? name.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim();
  const id = `field-${name}`;

  const baseInput =
    'w-full h-10 px-3 rounded-md border border-border bg-background text-sm ' +
    'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary';

  const wrapClass = 'space-y-1.5';
  const labelClass = 'block text-xs font-medium text-muted-foreground capitalize';
  const helpClass = 'text-xs text-muted-foreground/70';

  if (field.type === 'blocks' || field.type === 'repeater' || field.type === 'imageGallery' || field.type === 'file' || field.type === 'icon') {
    return (
      <div className={wrapClass}>
        <label className={labelClass}>{label}</label>
        <p className="text-xs text-muted-foreground italic">
          {field.type} editor — coming soon.
        </p>
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
        <label htmlFor={id} className="text-sm">
          {label}
        </label>
        {field.helpText && <span className={helpClass}>— {field.helpText}</span>}
      </div>
    );
  }

  if (field.type === 'select') {
    const options =
      typeof field.options[0] === 'string'
        ? (field.options as string[]).map((o) => ({ value: o, label: o }))
        : (field.options as { value: string; label: string }[]);
    return (
      <div className={wrapClass}>
        <label htmlFor={id} className={labelClass}>{label}</label>
        <select
          id={id}
          name={inputName}
          defaultValue={initialValue || (field.default as string | undefined) || options[0]?.value}
          className={baseInput}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        {field.helpText && <p className={helpClass}>{field.helpText}</p>}
      </div>
    );
  }

  if (field.type === 'textarea') {
    return (
      <div className={wrapClass}>
        <label htmlFor={id} className={labelClass}>{label}</label>
        <textarea
          id={id}
          name={inputName}
          defaultValue={initialValue}
          rows={field.rows ?? 4}
          required={field.required}
          maxLength={field.max}
          className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-y"
        />
        {field.helpText && <p className={helpClass}>{field.helpText}</p>}
      </div>
    );
  }

  if (field.type === 'richText') {
    return (
      <div className={wrapClass}>
        <label htmlFor={id} className={labelClass}>{label} <span className="text-muted-foreground/50">(HTML)</span></label>
        <textarea
          id={id}
          name={inputName}
          defaultValue={initialValue}
          rows={12}
          required={field.required}
          className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-y"
        />
        {field.helpText && <p className={helpClass}>{field.helpText}</p>}
      </div>
    );
  }

  if (field.type === 'image') {
    return (
      <div className={wrapClass}>
        <label htmlFor={id} className={labelClass}>{label} <span className="text-muted-foreground/50">(URL)</span></label>
        {initialValue && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={initialValue} alt="" className="h-24 w-auto rounded-md border border-border object-cover" />
        )}
        <input
          type="url"
          id={id}
          name={inputName}
          defaultValue={initialValue}
          placeholder="https://..."
          className={baseInput}
        />
        {field.helpText && <p className={helpClass}>{field.helpText}</p>}
      </div>
    );
  }

  if (field.type === 'tags') {
    return (
      <div className={wrapClass}>
        <label htmlFor={id} className={labelClass}>{label}</label>
        <input
          type="text"
          id={id}
          name={inputName}
          defaultValue={initialValue}
          placeholder="tag1, tag2, tag3"
          className={baseInput}
        />
        <p className={helpClass}>Comma-separated</p>
      </div>
    );
  }

  if (field.type === 'datetime') {
    return (
      <div className={wrapClass}>
        <label htmlFor={id} className={labelClass}>{label}</label>
        <input type="datetime-local" id={id} name={inputName} defaultValue={initialValue} className={baseInput} />
      </div>
    );
  }

  if (field.type === 'date') {
    return (
      <div className={wrapClass}>
        <label htmlFor={id} className={labelClass}>{label}</label>
        <input type="date" id={id} name={inputName} defaultValue={initialValue} className={baseInput} />
      </div>
    );
  }

  if (field.type === 'number') {
    return (
      <div className={wrapClass}>
        <label htmlFor={id} className={labelClass}>{label}</label>
        <input
          type="number"
          id={id}
          name={inputName}
          defaultValue={initialValue}
          min={field.min}
          max={field.max}
          step={field.step}
          className={baseInput}
        />
        {field.helpText && <p className={helpClass}>{field.helpText}</p>}
      </div>
    );
  }

  if (field.type === 'reference') {
    return (
      <div className={wrapClass}>
        <label htmlFor={id} className={labelClass}>{label} <span className="text-muted-foreground/50">(ID)</span></label>
        <input
          type="text"
          id={id}
          name={inputName}
          defaultValue={initialValue}
          placeholder="UUID"
          className={baseInput + ' font-mono text-xs'}
        />
        {field.helpText && <p className={helpClass}>{field.helpText}</p>}
      </div>
    );
  }

  // text, slug, url, email
  return (
    <div className={wrapClass}>
      <label htmlFor={id} className={labelClass}>{label}</label>
      <input
        type={field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : 'text'}
        id={id}
        name={inputName}
        defaultValue={initialValue}
        required={field.required}
        maxLength={field.type !== 'slug' && field.type !== 'url' && field.type !== 'email' ? (field as { max?: number }).max : undefined}
        placeholder={field.type === 'slug' ? 'auto-generated-from-title' : undefined}
        className={baseInput}
        onChange={name === 'title' && onTitleChange ? (e) => onTitleChange(e.target.value) : undefined}
      />
      {field.helpText && <p className={helpClass}>{field.helpText}</p>}
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
  action: (fd: FormData) => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Auto-slug from title
  const slugField = Object.entries(collection.fields).find(([, f]) => f.type === 'slug');
  const slugInputRef = useRef<HTMLInputElement | null>(null);

  function handleTitleChange(value: string) {
    if (!slugField || record) return; // don't overwrite slug on edit
    const slug = value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
    const el = formRef.current?.querySelector<HTMLInputElement>(`[name="f_${slugField[0]}"]`);
    if (el && !el.dataset.touched) el.value = slug;
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(formRef.current!);
    startTransition(async () => {
      try {
        await action(fd);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong.');
      }
    });
  }

  const fieldEntries = Object.entries(collection.fields);
  // Separate localized vs top-level for visual grouping
  const localizedFields = fieldEntries.filter(([n, f]) => isLocalized(n, f, collection));
  const topFields = fieldEntries.filter(([n, f]) => !isLocalized(n, f, collection));

  return (
    <form ref={formRef} onSubmit={submit} className="space-y-8">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Localized content */}
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

      {/* Top-level / meta fields */}
      {topFields.length > 0 && (
        <section className="space-y-5">
          {localizedFields.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Settings</span>
              <div className="flex-1 border-t border-border" />
            </div>
          )}
          {topFields.map(([name, field]) => (
            <FieldInput
              key={name}
              name={name}
              field={field}
              initialValue={getInitialValue(name, field, collection, record)}
            />
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
