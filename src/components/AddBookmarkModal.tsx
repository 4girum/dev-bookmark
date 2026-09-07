"use client";

import { useEffect, useState } from "react";
import type { CreateBookmarkInput } from "@/lib/actions";
import { db_fetchUrlMetadata } from "@/lib/actions/metadata";
import { useDebounce } from "@/lib/useDebounce";

interface AddBookmarkModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (input: CreateBookmarkInput) => Promise<void>;
}

interface FormErrors {
  title?: string;
  url?: string;
  tags?: string;
}

function validate(fields: { title: string; url: string; tags: string }): FormErrors {
  const errors: FormErrors = {};
  if (!fields.title.trim()) {
    errors.title = "Title is required.";
  } else if (fields.title.trim().length > 200) {
    errors.title = "Title must be 200 characters or fewer.";
  }
  if (fields.url.trim() && !/^https?:\/\/.+/.test(fields.url.trim())) {
    errors.url = "Please enter a valid URL starting with http:// or https://.";
  }
  const tagList = fields.tags.split(",").map((t) => t.trim()).filter(Boolean);
  const longTag = tagList.find((t) => t.length > 50);
  if (longTag) {
    errors.tags = `Tag "${longTag}" exceeds 50 characters.`;
  }
  return errors;
}

const EMPTY = { title: "", url: "", description: "", tags: "", codeSnippet: "", language: "" };

// A URL is worth fetching metadata for only when it looks complete.
function isLikelyCompleteUrl(raw: string): boolean {
  try {
    const u = new URL(raw.trim());
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

export default function AddBookmarkModal({ open, onClose, onAdd }: AddBookmarkModalProps) {
  const [fields, setFields] = useState(EMPTY);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  // Metadata fetch state
  const [metaLoading, setMetaLoading] = useState(false);
  const [metaError, setMetaError] = useState<string | null>(null);
  // Track which URL we last auto-populated from, so we don't clobber manual edits
  // on subsequent fetches for the same URL.
  const [lastFetchedUrl, setLastFetchedUrl] = useState<string | null>(null);

  // Debounce the URL 600ms — gives the user time to finish typing.
  const debouncedUrl = useDebounce(fields.url, 600);

  // Auto-fetch metadata whenever the debounced URL changes.
  useEffect(() => {
    if (!isLikelyCompleteUrl(debouncedUrl)) {
      setMetaError(null);
      return;
    }
    if (debouncedUrl === lastFetchedUrl) return;

    let cancelled = false;
    setMetaLoading(true);
    setMetaError(null);

    db_fetchUrlMetadata(debouncedUrl).then((result) => {
      if (cancelled) return;
      setMetaLoading(false);
      setLastFetchedUrl(debouncedUrl);

      if ("error" in result) {
        setMetaError(result.error);
        return;
      }

      // Only auto-fill fields the user hasn't touched yet.
      setFields((prev) => ({
        ...prev,
        title: prev.title.trim() === "" && result.title ? result.title : prev.title,
        description:
          prev.description.trim() === "" && result.description
            ? result.description
            : prev.description,
      }));
    });

    return () => { cancelled = true; };
  }, [debouncedUrl, lastFetchedUrl]);

  // Reset lastFetchedUrl when the URL field is cleared.
  useEffect(() => {
    if (!fields.url.trim()) {
      setLastFetchedUrl(null);
      setMetaError(null);
    }
  }, [fields.url]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function set(field: keyof typeof EMPTY) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFields((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function resetForm() {
    setFields(EMPTY);
    setErrors({});
    setMetaError(null);
    setMetaLoading(false);
    setLastFetchedUrl(null);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate({ title: fields.title, url: fields.url, tags: fields.tags });
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);
    try {
      await onAdd({
        title: fields.title.trim(),
        url: fields.url.trim() || undefined,
        description: fields.description.trim() || undefined,
        tags: fields.tags.split(",").map((t) => t.trim()).filter(Boolean),
        codeSnippet: fields.codeSnippet.trim() || undefined,
        language: fields.language.trim() || undefined,
      });
      resetForm();
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-md flex-col rounded-xl bg-white shadow-xl dark:bg-gray-900"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-700">
          <h2 id="modal-title" className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            Add Bookmark
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={handleClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
          >
            ✕
          </button>
        </div>

        {/* Scrollable form body */}
        <form onSubmit={handleSubmit} noValidate className="flex flex-col overflow-hidden">
          <div className="flex flex-col gap-4 overflow-y-auto px-6 py-5">

            {/* URL — first so metadata can pre-fill title/description */}
            <div>
              <label htmlFor="bm-url" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                URL
              </label>
              <div className="relative mt-1">
                <input
                  id="bm-url"
                  type="url"
                  value={fields.url}
                  onChange={set("url")}
                  placeholder="https://example.com"
                  className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 pr-8 text-sm text-neutral-900 placeholder-neutral-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
                {/* Loading spinner */}
                {metaLoading && (
                  <span
                    aria-label="Fetching metadata…"
                    className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2"
                  >
                    <svg
                      className="h-4 w-4 animate-spin text-blue-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                  </span>
                )}
              </div>
              {errors.url && <p className="mt-1 text-xs text-red-500">{errors.url}</p>}
              {metaError && !errors.url && (
                <p className="mt-1 text-xs text-amber-500 dark:text-amber-400">
                  Could not fetch metadata — fill in the fields manually.
                </p>
              )}
              {!metaLoading && !metaError && lastFetchedUrl && (
                <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                  ✓ Title and description auto-filled from the page.
                </p>
              )}
            </div>

            {/* Title */}
            <div>
              <label htmlFor="bm-title" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Title <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <input
                id="bm-title"
                type="text"
                value={fields.title}
                onChange={set("title")}
                placeholder="e.g. useCallback vs useMemo"
                maxLength={200}
                className="mt-1 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
              {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="bm-description" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Description
              </label>
              <textarea
                id="bm-description"
                value={fields.description}
                onChange={set("description")}
                placeholder="Brief description..."
                rows={2}
                className="mt-1 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="bm-tags" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Tags <span className="text-xs text-neutral-400">(comma-separated)</span>
              </label>
              <input
                id="bm-tags"
                type="text"
                value={fields.tags}
                onChange={set("tags")}
                placeholder="react, typescript, hooks"
                className="mt-1 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
              {errors.tags && <p className="mt-1 text-xs text-red-500">{errors.tags}</p>}
            </div>

            {/* Code Snippet */}
            <div>
              <label htmlFor="bm-snippet" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Code Snippet
              </label>
              <textarea
                id="bm-snippet"
                value={fields.codeSnippet}
                onChange={set("codeSnippet")}
                placeholder="Paste code here..."
                rows={4}
                className="mt-1 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 font-mono text-xs text-neutral-900 placeholder-neutral-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>

            {/* Language */}
            <div>
              <label htmlFor="bm-language" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Language
              </label>
              <input
                id="bm-language"
                type="text"
                value={fields.language}
                onChange={set("language")}
                placeholder="typescript, sql, bash..."
                className="mt-1 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>

          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t border-neutral-200 px-6 py-4 dark:border-neutral-700">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Add Bookmark"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
