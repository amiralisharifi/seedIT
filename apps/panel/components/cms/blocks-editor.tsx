'use client';

import { useState } from 'react';
import type { FieldDef } from '@seed-panel/core';
import { blockSchemas } from '@/config/blocks';

type Block = { id: string; type: string; data: Record<string, string> };

function makeId(): string {
  return 'b' + Math.random().toString(36).slice(2, 9);
}

// Parse the sections JSON the form loads with into editable blocks. Tolerant of
// junk so a bad row never breaks the editor.
function parseInitial(json: string): Block[] {
  if (!json) return [];
  try {
    const parsed: unknown = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((raw) => {
        const b = (raw ?? {}) as { id?: unknown; type?: unknown; data?: unknown };
        const data =
          b.data && typeof b.data === 'object'
            ? Object.fromEntries(
                Object.entries(b.data as Record<string, unknown>).map(([k, v]) => [
                  k,
                  v == null ? '' : String(v),
                ]),
              )
            : {};
        return {
          id: typeof b.id === 'string' ? b.id : makeId(),
          type: typeof b.type === 'string' ? b.type : '',
          data,
        };
      })
      .filter((b) => b.type);
  } catch {
    return [];
  }
}

function BlockField({
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
  const label = field.label ?? fieldKey.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim();
  const base =
    'w-full px-3 rounded-md border border-border bg-background text-sm ' +
    'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary';

  return (
    <label className="block space-y-1">
      <span className="block text-xs font-medium text-muted-foreground capitalize">
        {label}
        {field.required ? ' *' : ''}
      </span>
      {field.type === 'textarea' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={field.rows ?? 3}
          className={`${base} py-2`}
        />
      ) : field.type === 'richText' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={8}
          placeholder="HTML — <h2>…</h2><p>…</p>"
          className={`${base} py-2 font-mono text-xs`}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${base} h-9`}
        />
      )}
      {field.helpText && (
        <span className="block text-[11px] text-muted-foreground/70">{field.helpText}</span>
      )}
    </label>
  );
}

/**
 * Structured block editor. Renders the current `sections` as a stack of blocks,
 * each with add / remove / reorder and a per-block form driven by
 * config/blocks.ts. Serializes to a hidden `f_<name>` input as JSON, which the
 * server action parses back into the `sections` jsonb column.
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
  function setField(id: string, key: string, value: string) {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, data: { ...b.data, [key]: value } } : b)),
    );
  }

  return (
    <div className="space-y-3">
      {/* Carries the serialized blocks into the form submit. */}
      <input type="hidden" name={`f_${name}`} value={JSON.stringify(blocks)} readOnly />

      {blocks.length === 0 && (
        <p className="text-xs text-muted-foreground italic">No blocks yet. Add one below.</p>
      )}

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
                  <BlockField
                    key={key}
                    fieldKey={key}
                    field={field}
                    value={block.data[key] ?? ''}
                    onChange={(v) => setField(block.id, key, v)}
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
