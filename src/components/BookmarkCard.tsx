"use client";

import { useEffect, useRef, useState } from "react";
import type { Bookmark } from "@/lib/mock-data";
import { HighlightText } from "@/components/HighlightText";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface BookmarkCardProps {
  bookmark: Bookmark;
  query?: string;
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (id: string) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatLanguage(lang: string): string {
  const labels: Record<string, string> = {
    typescript: "TS", tsx: "TSX", javascript: "JS", jsx: "JSX",
    sql: "SQL", python: "PY", bash: "SH", css: "CSS", html: "HTML", json: "JSON",
  };
  return labels[lang.toLowerCase()] ?? lang.toUpperCase();
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function faviconUrl(url: string): string {
  try {
    const { origin } = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(origin)}&sz=32`;
  } catch {
    return "";
  }
}

// ---------------------------------------------------------------------------
// CopyIconButton — icon-only clipboard button with 2-second feedback
// ---------------------------------------------------------------------------

function CopyIconButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — silent fail.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "Copied!" : label}
      title={copied ? "Copied!" : label}
      className={`rounded p-1 transition-colors duration-150 ${
        copied
          ? "text-green-600 dark:text-green-400"
          : "text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
      }`}
    >
      {copied ? (
        // Checkmark
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
          <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
        </svg>
      ) : (
        // Copy icon
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
          <path fillRule="evenodd" d="M5.5 3.5A1.5 1.5 0 0 1 7 2h5.5A1.5 1.5 0 0 1 14 3.5V10a1.5 1.5 0 0 1-1.5 1.5H11v1A1.5 1.5 0 0 1 9.5 14H4A1.5 1.5 0 0 1 2.5 12.5V6A1.5 1.5 0 0 1 4 4.5h1.5v-1Zm1.5 0v1H9.5A1.5 1.5 0 0 1 11 6v4h1.5a.5.5 0 0 0 .5-.5V3.5a.5.5 0 0 0-.5-.5H7a.5.5 0 0 0-.5.5ZM4 6a.5.5 0 0 0-.5.5v6a.5.5 0 0 0 .5.5h5.5a.5.5 0 0 0 .5-.5V6a.5.5 0 0 0-.5-.5H4Z" clipRule="evenodd" />
        </svg>
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// KebabMenu — three-dot dropdown with Edit and Delete actions
// ---------------------------------------------------------------------------

interface KebabMenuProps {
  onEdit: () => void;
  onDelete: () => void;
}

function KebabMenu({ onEdit, onDelete }: KebabMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside.
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-label="More options"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="rounded p-1 text-neutral-400 transition-colors hover:text-neutral-700 dark:hover:text-neutral-200"
      >
        {/* Kebab (three-dot) icon */}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4" aria-hidden="true">
          <path d="M8 2a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM8 6.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM9.5 12.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0Z" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-20 mt-1 min-w-[130px] overflow-hidden rounded-lg border border-neutral-200 bg-white py-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-800"
        >
          <button
            role="menuitem"
            type="button"
            onClick={() => { setOpen(false); onEdit(); }}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5 shrink-0 text-neutral-400" aria-hidden="true">
              <path d="M13.488 2.513a1.75 1.75 0 0 0-2.475 0L6.75 6.774a2.75 2.75 0 0 0-.714 1.286l-.358 1.43a.75.75 0 0 0 .908.908l1.43-.357a2.75 2.75 0 0 0 1.286-.715l4.262-4.262a1.75 1.75 0 0 0 0-2.475ZM4.75 7.5A2.25 2.25 0 0 0 2.5 9.75v1A2.25 2.25 0 0 0 4.75 13h1a2.25 2.25 0 0 0 2.25-2.25v-.5a.75.75 0 0 0-1.5 0v.5a.75.75 0 0 1-.75.75h-1a.75.75 0 0 1-.75-.75v-1a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 0 0-1.5h-.5Z" />
            </svg>
            Edit
          </button>

          <button
            role="menuitem"
            type="button"
            onClick={() => { setOpen(false); onDelete(); }}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5 shrink-0" aria-hidden="true">
              <path fillRule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.713l.275 5.5a.75.75 0 0 1-1.498.075l-.275-5.5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .712.787l-.275 5.5a.75.75 0 0 1-1.498-.075l.275-5.5a.75.75 0 0 1 .786-.712Z" clipRule="evenodd" />
            </svg>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// DeleteConfirmDialog — inline confirmation before committing deletion
// ---------------------------------------------------------------------------

interface DeleteConfirmProps {
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteConfirmDialog({ title, onConfirm, onCancel }: DeleteConfirmProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-title"
        aria-describedby="delete-desc"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl dark:bg-neutral-900"
      >
        <h3 id="delete-title" className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
          Delete bookmark?
        </h3>
        <p id="delete-desc" className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          &ldquo;{title}&rdquo; will be permanently deleted. This cannot be undone.
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// BookmarkCard
// ---------------------------------------------------------------------------

export default function BookmarkCard({ bookmark, query = "", onEdit, onDelete }: BookmarkCardProps) {
  const { title, description, url, codeSnippet, language, tags, createdAt } = bookmark;
  const favicon = url ? faviconUrl(url) : "";
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  function handleDeleteConfirmed() {
    setConfirmingDelete(false);
    onDelete(bookmark.id);
  }

  return (
    <>
      <article className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-neutral-700 dark:bg-neutral-900">

        {/* Header: favicon + title + action icons */}
        <div className="flex items-start gap-2.5">
          {/* Favicon */}
          {favicon && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={favicon}
              alt=""
              aria-hidden="true"
              width={16}
              height={16}
              className="mt-0.5 h-4 w-4 shrink-0 rounded-sm object-contain"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            />
          )}

          <h2 className="flex-1 text-base font-semibold leading-snug text-neutral-900 dark:text-neutral-100">
            <HighlightText text={title} query={query} />
          </h2>

          {/* Action row: copy link, external link, kebab */}
          <div className="mt-0.5 flex shrink-0 items-center gap-0.5">
            {url && (
              <>
                <CopyIconButton value={url} label="Copy link" />
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open ${title} in new tab`}
                  title="Open in new tab"
                  className="rounded p-1 text-neutral-400 transition-colors hover:text-blue-500 dark:hover:text-blue-400"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
                    <path fillRule="evenodd" d="M8.914 6.025a.75.75 0 0 1 1.06 0 3.5 3.5 0 0 1 0 4.95l-2 2a3.5 3.5 0 0 1-4.95-4.95l1.5-1.5a.75.75 0 0 1 1.06 1.06L4.09 9.085a2 2 0 1 0 2.828 2.829l2-2a2 2 0 0 0 0-2.829.75.75 0 0 1 0-1.06Zm-4 4a.75.75 0 0 1 1.06 0 2 2 0 0 0 2.829 0l2-2a2 2 0 0 0-2.829-2.828l-1.5 1.5a.75.75 0 0 1-1.06-1.061l1.5-1.5a3.5 3.5 0 0 1 4.95 4.95l-2 2a3.5 3.5 0 0 1-4.95 0 .75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                  </svg>
                </a>
              </>
            )}
            <KebabMenu
              onEdit={() => onEdit(bookmark)}
              onDelete={() => setConfirmingDelete(true)}
            />
          </div>
        </div>

        {/* Description */}
        {description && (
          <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
            <HighlightText text={description} query={query} />
          </p>
        )}

        {/* Code snippet */}
        {codeSnippet && (
          <div className="overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-100 px-3 py-1.5 dark:border-neutral-700 dark:bg-neutral-800">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                {language ? formatLanguage(language) : "CODE"}
              </span>
              <CopyIconButton value={codeSnippet} label="Copy code" />
            </div>
            <pre className="overflow-x-auto p-3">
              <code className="font-mono text-xs leading-relaxed text-neutral-800 dark:text-neutral-200">
                {codeSnippet}
              </code>
            </pre>
          </div>
        )}

        {/* Footer: tags + date */}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-1">
          <ul className="flex flex-wrap gap-1.5" aria-label="Tags">
            {tags.map((tag) => (
              <li key={tag} className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                {tag}
              </li>
            ))}
          </ul>
          <time dateTime={createdAt} className="shrink-0 text-xs text-neutral-400 dark:text-neutral-500">
            {formatDate(createdAt)}
          </time>
        </div>
      </article>

      {/* Delete confirmation dialog — rendered outside the article to avoid z-index issues */}
      {confirmingDelete && (
        <DeleteConfirmDialog
          title={title}
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setConfirmingDelete(false)}
        />
      )}
    </>
  );
}
