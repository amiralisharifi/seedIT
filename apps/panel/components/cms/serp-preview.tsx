'use client';

import { useEffect, useState } from 'react';

/**
 * Live Google-SERP-style preview for a CMS post.
 *
 * Listens to live values from existing form inputs by ID — no controlled
 * state needed in the parent form. Renders an inert preview block.
 */
export function SerpPreview({
  titleFieldId,
  descriptionFieldId,
  slugFieldId,
  siteUrl,
  pathPrefix,
  fallbackTitle,
}: {
  titleFieldId: string;
  descriptionFieldId: string;
  slugFieldId?: string;
  siteUrl: string;
  pathPrefix: string;
  fallbackTitle?: string;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [slug, setSlug] = useState('');

  useEffect(() => {
    const titleEl = document.getElementById(titleFieldId) as HTMLInputElement | HTMLTextAreaElement | null;
    const descEl = document.getElementById(descriptionFieldId) as HTMLInputElement | HTMLTextAreaElement | null;
    const slugEl = slugFieldId
      ? (document.getElementById(slugFieldId) as HTMLInputElement | null)
      : null;

    const sync = () => {
      setTitle(titleEl?.value ?? '');
      setDescription(descEl?.value ?? '');
      setSlug(slugEl?.value ?? '');
    };

    sync();

    titleEl?.addEventListener('input', sync);
    descEl?.addEventListener('input', sync);
    slugEl?.addEventListener('input', sync);

    return () => {
      titleEl?.removeEventListener('input', sync);
      descEl?.removeEventListener('input', sync);
      slugEl?.removeEventListener('input', sync);
    };
  }, [titleFieldId, descriptionFieldId, slugFieldId]);

  const displayTitle = title.trim() || fallbackTitle || 'Your post title';
  const displayDescription =
    description.trim() || 'Your meta description will appear here…';
  const cleanHost = siteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
  // Google shows breadcrumbs separated by ›
  const pathSegments = `${pathPrefix}${slug || 'your-slug'}`
    .split('/')
    .filter(Boolean);
  const breadcrumb = `${cleanHost}${pathSegments.length > 0 ? ' › ' + pathSegments.join(' › ') : ''}`;

  const titleOver = title.length > 60;
  const descOver = description.length > 160;

  return (
    <div className="rounded-md border border-border bg-white p-4 space-y-1.5 max-w-xl">
      <div className="flex items-center gap-2 mb-1">
        <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-mono">
          S
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-xs text-gray-700">{cleanHost}</span>
          <span className="text-[11px] text-gray-500">{breadcrumb}</span>
        </div>
      </div>
      <h3
        className={`text-[18px] leading-snug font-normal ${titleOver ? 'text-red-700' : 'text-[#1a0dab]'} hover:underline cursor-pointer`}
        style={{ fontFamily: 'arial, sans-serif' }}
      >
        {displayTitle}
        {titleOver && (
          <span className="text-xs text-red-600 ml-2 font-mono">(over 60)</span>
        )}
      </h3>
      <p
        className={`text-sm leading-snug ${descOver ? 'text-red-700' : 'text-[#4d5156]'}`}
        style={{ fontFamily: 'arial, sans-serif' }}
      >
        {displayDescription}
        {descOver && (
          <span className="text-xs text-red-600 ml-2 font-mono">(over 160)</span>
        )}
      </p>
    </div>
  );
}
