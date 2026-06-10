'use client';

import { useState } from 'react';
import type { FieldDef } from '@seed-panel/core';
import { blockSchemas } from '@/config/blocks';

type ItemValue = Record<string, string>;
type FieldValue = string | ItemValue[];
type Block = { id: string; type: string; data: Record<string, FieldValue> };

function makeId(): string {
  return 'b' + Math.random().toString(36).slice(2, 9);
}

// Coerce a parsed block's data into our editable shape: scalars become strings,
// arrays become item lists (each item a flat string map). Tolerant of junk.
function normalizeData(raw: unknown): Record<string, FieldValue> {
  if (!raw || typeof raw !== 'object') return {};
  const out: Record<string, FieldValue> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (Array.isArray(v)) {
      out[k] = v.map((item) => {
        const obj: ItemValue = {};
        if (item && typeof item === 'object') {
          for (const [ik, iv] of Object.entries(item as Record<string, unknown>)) {
            obj[ik] = iv == null ? '' : String(iv);
          }
        }
        return obj;
      });
    } else {
      out[k] = v == null ? '' : String(v);
    }
  }
  return out;
}

function parseInitial(json: string): Block[] {
  if (!json) return [];
  try {
    const parsed: unknown = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((raw) => {
        const b = (raw ?? {}) as { id?: unknown; type?: unknown; data?: unknown };
        return {
          id: typeof b.id === 'string' ? b.id : makeId(),
          type: typeof b.type === 'string' ? b.type : '',
          data: normalizeData(b.data),
        };
      })
      .filter((b) => b.type);
  } catch {
    return [];
  }
}

const inputBase =
  'w-full px-3 rounded-md border border-border bg-background text-sm ' +
  'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary';

function labelFor(key: string, field: FieldDef): string {
  return field.label ?? key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim();
}

// A single flat input (text / textarea / richText). Used for scalar block
// fields and for the fields inside a repeater item.
function FlatInput({
  fieldKey,
  field,
  value,
  onChange,
}: {
  fieldKey: string;
  field: FieldDef;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block space-y-1">
      <span className="block text-xs font-medium text-muted-foreground capitalize">
        {labelFor(fieldKey, field)}
        {field.required ? ' *' : ''}
      </span>
      {field.type === 'textarea' ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={field.rows ?? 3} className={`${inputBase} py-2`} />
      ) : field.type === 'richText' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={8}
          placeholder="HTML — <h2>…</h2><p>…</p>"
          className={`${inputBase} py-2 font-mono text-xs`}
        />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className={`${inputBase} h-9`} />
      )}
      {field.helpText && <span className="block text-[11px] text-muted-foreground/70">{field.helpText}</span>}
    </label>
  );
}

// A list of repeating items (features, FAQ entries, testimonials). Each item is
// a small set of flat fields from the repeater's `fields`.
function RepeaterControl({
  field,
  value,
  onChange,
}: {
  field: FieldDef & { type: 'repeater' };
  value: ItemValue[];
  onChange: (v: ItemValue[]) => void;
}) {
  const itemFields = Object.entries(field.fields);
  const atMax = field.max != null && value.length >= field.max;

  return (
    <div className="space-y-2">
      {value.map((item, i) => (
        <div key={i} className="rounded-md border border-border bg-background p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-muted-foreground">Item {i + 1}</span>
            <button
              type="button"
              onClick={() => onChange(value.filter((_, idx) => idx !== i))}
              className="text-xs text-red-600 hover:underline"
            >
              Remove
            </button>
          </div>
          {itemFields.map(([k, f]) => (
            <FlatInput
              key={k}
              fieldKey={k}
              field={f}
              value={item[k] ?? ''}
              onChange={(v) => onChange(value.map((it, idx) => (idx === i ? { ...it, [k]: v } : it)))}
            />
          ))}
        </div>
      ))}
      {!atMax && (
        <button
          type="button"
          onClick={() => onChange([...value, {}])}
          className="h-8 px-3 rounded-md border border-dashed border-border text-xs font-medium hover:bg-muted"
        >
          + Add item
        </button>
      )}
    </div>
  );
}

// Dispatch a single block field to the right control.
function FieldControl({
  fieldKey,
  field,
  value,
  onChange,
}: {
  fieldKey: string;
  field: FieldDef;
  value: FieldValue | undefined;
  onChange: (v: FieldValue) => void;
}) {
  if (field.type === 'repeater') {
    return (
      <div className="space-y-1.5">
        <span className="block text-xs font-medium text-muted-foreground capitalize">{labelFor(fieldKey, field)}</span>
        <RepeaterControl field={field} value={Array.isArray(value) ? value : []} onChange={onChange} />
      </div>
    );
  }
  return (
    <FlatInput fieldKey={fieldKey} field={field} value={typeof value === 'string' ? value : ''} onChange={onChange} />
  );
}

/**
 * Structured block editor. Renders the current `sections` as a stack of blocks,
 * each with add / remove / reorder and a per-block form driven by
 * config/blocks.ts (including nested repeater item lists). Serializes to a
 * hidden `f_<name>` input as JSON, which the server action parses back into the
 * `sections` jsonb column.
 */
export function BlocksEditor({
  name,
  acceptedTypes,
  initialJson,
}: {
  name: string;
  acceptedTypes: string[];
  initialJson: string;
}) {
  const [blocks, setBlocks] = useState<Block[]>(() => parseInitial(initialJson));

  // Only offer block types this collection accepts AND that have a schema.
  const palette = acceptedTypes.filter((t) => t in blockSchemas);

  function addBlock(type: string) {
    setBlocks((prev) => [...prev, { id: makeId(), type, data: {} }]);
  }
  function removeBlock(id: string) {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  }
  function move(id: string, dir: -1 | 1) {
    setBlocks((prev) => {
      const i = prev.findIndex((b) => b.id === id);
      const j = i + dir;
      const a = prev[i];
      const b = prev[j];
      if (i < 0 || j < 0 || !a || !b) return prev;
      const next = prev.slice();
      next[i] = b;
      next[j] = a;
      return next;
    });
  }
  function setData(id: string, key: string, value: FieldValue) {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, data: { ...b.data, [key]: value } } : b)));
  }

  return (
    <div className="space-y-3">
      {/* Carries the serialized blocks into the form submit. */}
      <input type="hidden" name={`f_${name}`} value={JSON.stringify(blocks)} readOnly />

      {blocks.length === 0 && <p className="text-xs text-muted-foreground italic">No blocks yet. Add one below.</p>}

      {blocks.map((block, idx) => {
        const schema = blockSchemas[block.type];
        return (
          <div key={block.id} className="rounded-md border border-border bg-muted/30 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                {schema?.label ?? block.type}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => move(block.id, -1)}
                  disabled={idx === 0}
                  className="h-7 w-7 rounded border border-border text-sm disabled:opacity-30"
                  aria-label="Move block up"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(block.id, 1)}
                  disabled={idx === blocks.length - 1}
                  className="h-7 w-7 rounded border border-border text-sm disabled:opacity-30"
                  aria-label="Move block down"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => removeBlock(block.id)}
                  className="h-7 px-2 rounded border border-red-200 text-red-600 text-xs hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
            </div>

            {schema ? (
              <div className="space-y-2.5">
                {Object.entries(schema.fields).map(([key, field]) => (
                  <FieldControl
                    key={key}
                    fieldKey={key}
                    field={field}
                    value={block.data[key]}
                    onChange={(v) => setData(block.id, key, v)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-xs text-amber-600">
                Unknown block type “{block.type}” — no editor. It will be kept as-is on save.
              </p>
            )}
          </div>
        );
      })}

      {palette.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-muted-foreground">Add block:</span>
          {palette.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => addBlock(type)}
              className="h-8 px-3 rounded-md border border-border text-xs font-medium hover:bg-muted"
            >
              + {blockSchemas[type]?.label ?? type}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
