"use client";

import { useEffect, useState } from "react";
import type { Bookmark } from "@/lib/mock-data";
import type { CreateBookmarkInput } from "@/lib/actions";
import type { UpdateBookmarkInput } from "@/lib/actions/bookmarks";
import { db_fetchUrlMetadata } from "@/lib/actions/metadata";
import { useDebounce } from "@/lib/useDebounce";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface BookmarkModalProps {
  open: boolean;
  onClose: () => void;
  /** Create mode — called when no bookmarkToEdit is provided. */
  onAdd?: (input: CreateBookmarkInput) => Promise<void>;
  /** Edit mode — called when bookmarkToEdit is provided. */
  onSave?: (id: string, input: UpdateBookmarkInput) => Promise<void>;
  /** When provided the modal opens in edit mode, pre-filled with this bookmark. */
  bookmarkToEdit?: Bookmark | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface FormFields {
  title: string;
  url: string;
  description: string;
  tags: string;
  codeSnippet: string;
  language: string;
}

interface FormErrors {
  title?: string;
  url?: string;
  tags?: string;
}

const EMPTY: FormFields = {
  title: "",
  url: "",
  description: "",
  tags: "",
  codeSnippet: "",
  language: "",
};

function bookmarkToFields(b: Bookmark): FormFields {
  return {
    title: b.title,
    url: b.url ?? "",
    description: b.description ?? "",
    tags: b.tags.join(", "),
    codeSnippet: b.codeSnippet ?? "",
    language: b.language ?? "",
  };
}

function validate(fields: Pick<FormFields, "title" | "url" | "tags">): FormErrors {
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

function isLikelyCompleteUrl(raw: string): boolean {
  try {
    const u = new URL(raw.trim());
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function BookmarkModal({
  open,
  onClose,
  onAdd,
  onSave,
  bookmarkToEdit = null,
}: BookmarkModalProps) {
  const isEditMode = bookmarkToEdit !== null;
  const [fields, setFields] = useState<FormFields>(
    bookmarkToEdit ? bookmarkToFields(bookmarkToEdit) : EMPTY
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  // Metadata fetch state (only active in create mode)
  const [metaLoading, setMetaLoading] = useState(false);
  const [metaError, setMetaError] = useState<string | null>(null);
  const [lastFetchedUrl, setLastFetchedUrl] = useState<string | null>(null);

  const debouncedUrl = useDebounce(fields.url, 600);

  // Re-populate fields whenever the bookmark being edited changes.
  useEffect(() => {
    if (open) {
      setFields(bookmarkToEdit ? bookmarkToFields(bookmarkToEdit) : EMPTY);
      setErrors({});
      setMetaError(null);
      setMetaLoading(false);
      setLastFetchedUrl(null);
    }
  }, [open, bookmarkToEdit]);

  // Auto-fetch metadata in create mode only.
  useEffect(() => {
    if (isEditMode) return;
    if (!isLikelyCompleteUrl(debouncedUrl)) { setMetaError(null); return; }
    if (debouncedUrl === lastFetchedUrl) return;

    let cancelled = false;
    setMetaLoading(true);
    setMetaError(null);

    db_fetchUrlMetadata(debouncedUrl).then((result) => {
      if (cancelled) return;
      setMetaLoading(false);
      setLastFetchedUrl(debouncedUrl);
      if ("error" in result) { setMetaError(result.error); return; }
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
  }, [debouncedUrl, lastFetchedUrl, isEditMode]);

  // Clear fetch state when URL is cleared.
  useEffect(() => {
    if (!fields.url.trim()) { setLastFetchedUrl(null); setMetaError(null); }
  }, [fields.url]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function set(field: keyof FormFields) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFields((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function handleClose() {
    setFields(EMPTY);
    setErrors({});
    setMetaError(null);
    setMetaLoading(false);
    setLastFetchedUrl(null);
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate({ title: fields.title, url: fields.url, tags: fields.tags });
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);

    const parsedTags = fields.tags.split(",").map((t) => t.trim()).filter(Boolean);

    try {
      if (isEditMode && bookmarkToEdit && onSave) {
        await onSave(bookmarkToEdit.id, {
          title: fields.title.trim(),
          url: fields.url.trim() || undefined,
          description: fields.description.trim() || undefined,
          tags: parsedTags,
          codeSnippet: fields.codeSnippet.trim() || undefined,
          language: fields.language.trim() || undefined,
        });
      } else if (!isEditMode && onAdd) {
        await onAdd({
          title: fields.title.trim(),
          url: fields.url.trim() || undefined,
          description: fields.description.trim() || undefined,
          tags: parsedTags,
          codeSnippet: fields.codeSnippet.trim() || undefined,
          language: fields.language.trim() || undefined,
        });
      }
      handleClose();
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  // Shared input class
  const inputCls =
    "w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="bm-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-md flex-col rounded-xl bg-white shadow-xl dark:bg-neutral-900"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-700">
          <h2
            id="bm-modal-title"
            className="text-base font-semibold text-neutral-900 dark:text-neutral-100"
          >
            {isEditMode ? "Edit Bookmark" : "Add Bookmark"}
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={handleClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4" aria-hidden="true">
              <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
            </svg>
          </button>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} noValidate className="flex flex-col overflow-hidden">
          <div className="flex flex-col gap-4 overflow-y-auto px-6 py-5">

            {/* URL (shown first in create mode for metadata pre-fill) */}
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
                  className={`${inputCls} pr-8`}
                />
                {metaLoading && (
                  <span aria-label="Fetching metadata…" className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2">
                    <svg className="h-4 w-4 animate-spin text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                  </span>
                )}
              </div>
              {errors.url && <p className="mt-1 text-xs text-red-500">{errors.url}</p>}
              {!isEditMode && metaError && !errors.url && (
                <p className="mt-1 text-xs text-amber-500 dark:text-amber-400">Could not fetch metadata — fill in the fields manually.</p>
              )}
              {!isEditMode && !metaLoading && !metaError && lastFetchedUrl && (
                <p className="mt-1 text-xs text-green-600 dark:text-green-400">✓ Title and description auto-filled from the page.</p>
              )}
            </div>

            {/* Title */}
            <div>
              <label htmlFor="bm-title" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Title <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <input id="bm-title" type="text" value={fields.title} onChange={set("title")} placeholder="e.g. useCallback vs useMemo" maxLength={200} className={`mt-1 ${inputCls}`} />
              {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="bm-description" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Description</label>
              <textarea id="bm-description" value={fields.description} onChange={set("description")} placeholder="Brief description..." rows={2} className={`mt-1 ${inputCls}`} />
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="bm-tags" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Tags <span className="text-xs text-neutral-400">(comma-separated)</span>
              </label>
              <input id="bm-tags" type="text" value={fields.tags} onChange={set("tags")} placeholder="react, typescript, hooks" className={`mt-1 ${inputCls}`} />
              {errors.tags && <p className="mt-1 text-xs text-red-500">{errors.tags}</p>}
            </div>

            {/* Code Snippet */}
            <div>
              <label htmlFor="bm-snippet" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Code Snippet</label>
              <textarea id="bm-snippet" value={fields.codeSnippet} onChange={set("codeSnippet")} placeholder="Paste code here..." rows={4} className={`mt-1 font-mono text-xs ${inputCls}`} />
            </div>

            {/* Language */}
            <div>
              <label htmlFor="bm-language" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Language</label>
              <input id="bm-language" type="text" value={fields.language} onChange={set("language")} placeholder="typescript, sql, bash..." className={`mt-1 ${inputCls}`} />
            </div>

          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t border-neutral-200 px-6 py-4 dark:border-neutral-700">
            <button type="button" onClick={handleClose} className="rounded-lg px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
              {submitting ? "Saving…" : isEditMode ? "Save Changes" : "Add Bookmark"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
