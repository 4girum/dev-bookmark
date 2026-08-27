"use client";

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

export default function BookmarkCard({ bookmark, query = "" }: BookmarkCardProps) {
  const { title, description, url, codeSnippet, language, tags, createdAt } =
    bookmark;

  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-neutral-700 dark:bg-neutral-900">
      {/* Header: title + optional URL */}
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-base font-semibold leading-snug text-neutral-900 dark:text-neutral-100">
          <HighlightText text={title} query={query} />
        </h2>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${title} link`}
            className="mt-0.5 shrink-0 text-neutral-400 transition-colors hover:text-blue-500 dark:hover:text-blue-400"
          >
            {/* External link icon */}
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
          {/* Language badge bar */}
          <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-100 px-3 py-1.5 dark:border-neutral-700 dark:bg-neutral-800">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              {language ? formatLanguage(language) : "CODE"}
            </span>
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
        {/* Tags */}
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

        {/* Created date */}
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
