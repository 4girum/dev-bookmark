"use client";

import { useState } from "react";
import type { Bookmark } from "@/lib/mock-data";
import { HighlightText } from "@/components/HighlightText";

interface BookmarkCardProps {
  bookmark: Bookmark;
  query?: string;
}

/** Maps a language identifier to a display-friendly label. */
function formatLanguage(lang: string): string {
  const labels: Record<string, string> = {
    typescript: "TS",
    tsx: "TSX",
    javascript: "JS",
    jsx: "JSX",
    sql: "SQL",
    python: "PY",
    bash: "SH",
    css: "CSS",
    html: "HTML",
    json: "JSON",
  };
  return labels[lang.toLowerCase()] ?? lang.toUpperCase();
}

/** Formats an ISO date string to a human-readable short date (e.g. "Aug 18, 2026"). */
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Derives the favicon URL from a bookmark URL via Google's favicon CDN. */
function faviconUrl(url: string): string {
  try {
    const { origin } = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(origin)}&sz=32`;
  } catch {
    return "";
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Copy-to-clipboard button with a 2-second "Copied!" feedback state. */
function CopyButton({
  value,
  label,
  copiedLabel = "Copied!",
}: {
  value: string;
  label: string;
  copiedLabel?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API blocked (non-secure context / permissions) — silent fail.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? copiedLabel : label}
      className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium transition-colors duration-150 ${
        copied
          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
          : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-200"
      }`}
    >
      {copied ? (
        <>
          {/* Checkmark icon */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" fill="currentColor" className="h-3 w-3" aria-hidden="true">
            <path fillRule="evenodd" d="M10.22 2.97a.75.75 0 0 1 0 1.06L4.78 9.47a.75.75 0 0 1-1.06 0L1.28 7.03a.75.75 0 0 1 1.06-1.06L4.25 7.88l4.91-4.91a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
          </svg>
          {copiedLabel}
        </>
      ) : (
        <>
          {/* Copy icon */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" fill="currentColor" className="h-3 w-3" aria-hidden="true">
            <path fillRule="evenodd" d="M3.5 1.5A.5.5 0 0 1 4 1h5.5A1.5 1.5 0 0 1 11 2.5V8a.5.5 0 0 1-1 0V2.5a.5.5 0 0 0-.5-.5H4a.5.5 0 0 1-.5-.5ZM2 4a1 1 0 0 0-1 1v5.5A1.5 1.5 0 0 0 2.5 12H7a1.5 1.5 0 0 0 1.5-1.5V5a1 1 0 0 0-1-1H2Zm0 1h5.5a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-.5.5H2.5a.5.5 0 0 1-.5-.5V5Z" clipRule="evenodd" />
          </svg>
          {label}
        </>
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// BookmarkCard
// ---------------------------------------------------------------------------

export default function BookmarkCard({ bookmark, query = "" }: BookmarkCardProps) {
  const { title, description, url, codeSnippet, language, tags, createdAt } = bookmark;
  const favicon = url ? faviconUrl(url) : "";

  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-neutral-700 dark:bg-neutral-900">

      {/* Header: favicon + title + external link */}
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
            onError={(e) => {
              // Hide broken favicon image gracefully
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        )}

        <h2 className="flex-1 text-base font-semibold leading-snug text-neutral-900 dark:text-neutral-100">
          <HighlightText text={title} query={query} />
        </h2>

        {/* External link + Copy URL */}
        {url && (
          <div className="mt-0.5 flex shrink-0 items-center gap-1.5">
            <CopyButton value={url} label="Copy link" copiedLabel="Copied!" />
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${title} in new tab`}
              className="text-neutral-400 transition-colors hover:text-blue-500 dark:hover:text-blue-400"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M4.25 5.5a.75.75 0 0 0-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-4a.75.75 0 0 1 1.5 0v4A2.25 2.25 0 0 1 12.75 17h-8.5A2.25 2.25 0 0 1 2 14.75v-8.5A2.25 2.25 0 0 1 4.25 4h5a.75.75 0 0 1 0 1.5h-5Zm6.75-3a.75.75 0 0 1 .75-.75h5a.75.75 0 0 1 .75.75v5a.75.75 0 0 1-1.5 0V4.06l-6.22 6.22a.75.75 0 1 1-1.06-1.06L15.94 3H12a.75.75 0 0 1-.75-.75Z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          </div>
        )}
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
          {/* Language badge bar + Copy Code button */}
          <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-100 px-3 py-1.5 dark:border-neutral-700 dark:bg-neutral-800">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              {language ? formatLanguage(language) : "CODE"}
            </span>
            <CopyButton value={codeSnippet} label="Copy code" copiedLabel="Copied!" />
          </div>
          {/* Snippet body */}
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
            <li
              key={tag}
              className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300"
            >
              {tag}
            </li>
          ))}
        </ul>
        <time
          dateTime={createdAt}
          className="shrink-0 text-xs text-neutral-400 dark:text-neutral-500"
        >
          {formatDate(createdAt)}
        </time>
      </div>
    </article>
  );
}
