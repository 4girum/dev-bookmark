"use client";

import { useState, useOptimistic, useTransition } from "react";
import type { Bookmark } from "@/lib/mock-data";
import type { PaginatedBookmarks } from "@/lib/actions/bookmarks";
import BookmarkFeed from "@/components/BookmarkFeed";
import Sidebar from "@/components/Sidebar";
import AddBookmarkModal from "@/components/AddBookmarkModal";
import { useDebounce } from "@/lib/useDebounce";
import { db_createBookmark, type CreateBookmarkInput } from "@/lib/actions";

interface BookmarkShellProps {
  /** First page of bookmarks from the server, including pagination cursors. */
  initialPage: PaginatedBookmarks;
  /** All unique tags derived from the initial dataset. */
  initialTags: string[];
  /** Authenticated user's email, or null when not signed in. */
  userEmail: string | null;
}

export default function BookmarkShell({
  initialPage,
  initialTags,
  userEmail,
}: BookmarkShellProps) {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [, startTransition] = useTransition();

  // Optimistic items prepended by the current session's creates.
  // These are passed directly to BookmarkFeed so they appear instantly
  // without disrupting the pagination cursor chain.
  const [optimisticItems, addOptimistic] = useOptimistic(
    [] as Bookmark[],
    (current: Bookmark[], newBookmark: Bookmark) => [newBookmark, ...current]
  );

  async function handleAddBookmark(input: CreateBookmarkInput): Promise<void> {
    const tempBookmark: Bookmark = {
      id: `temp-${Date.now()}`,
      title: input.title,
      description: input.description,
      url: input.url,
      codeSnippet: input.codeSnippet,
      language: input.language,
      tags: input.tags,
      createdAt: new Date().toISOString(),
    };

    startTransition(async () => {
      addOptimistic(tempBookmark);
      await db_createBookmark(input);
    });
  }

  // Total displayed count: optimistic + paginated items loaded so far.
  // BookmarkFeed tracks its own accumulated count internally; we show
  // a simple "filtered" indicator in the header via the search bar.

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 dark:bg-neutral-950">
      {/* ── Mobile top bar ─────────────────────────────────────────── */}
      <header className="flex items-center gap-3 border-b border-neutral-200 bg-white px-4 py-3 md:hidden dark:border-neutral-800 dark:bg-neutral-900">
        <button
          type="button"
          aria-label="Toggle sidebar"
          aria-expanded={sidebarOpen}
          onClick={() => setSidebarOpen((o) => !o)}
          className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          {sidebarOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 0 1 1.414 0L10 8.586l4.293-4.293a1 1 0 1 1 1.414 1.414L11.414 10l4.293 4.293a1 1 0 0 1-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 0 1-1.414-1.414L8.586 10 4.293 5.707a1 1 0 0 1 0-1.414Z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75Zm0 10.5a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75ZM2 10a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 10Z" clipRule="evenodd" />
            </svg>
          )}
        </button>
        <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          DevBookmark
        </span>
      </header>

      <div className="flex flex-1">
        {/* ── Sidebar ──────────────────────────────────────────────── */}
        <div
          className={[
            "fixed inset-y-0 left-0 z-30 w-64 overflow-y-auto border-r border-neutral-200 bg-white p-5 transition-transform duration-200 dark:border-neutral-800 dark:bg-neutral-900",
            "md:static md:z-auto md:flex md:w-[250px] md:translate-x-0",
            sidebarOpen ? "translate-x-0 shadow-xl" : "-translate-x-full",
          ].join(" ")}
        >
          <Sidebar
            tags={initialTags}
            activeTag={activeTag}
            onTagSelect={(tag) => {
              setActiveTag(tag);
              setSidebarOpen(false);
            }}
            userEmail={userEmail}
          />
        </div>

        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/30 md:hidden"
            aria-hidden="true"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Main content ─────────────────────────────────────────── */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {/* Search bar + Add button */}
          <div className="border-b border-neutral-200 bg-white px-6 py-4 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center gap-3">
              <label htmlFor="search" className="sr-only">Search bookmarks</label>
              <div className="relative flex-1">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" aria-hidden="true">
                  <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
                </svg>
                <input
                  id="search"
                  type="search"
                  placeholder="Search by title, tag, or language…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2 pl-9 pr-4 text-sm text-neutral-900 placeholder-neutral-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-500 dark:focus:border-blue-500"
                />
              </div>
              <button
                type="button"
                aria-haspopup="dialog"
                aria-label="Add new bookmark"
                onClick={() => setModalOpen(true)}
                className="shrink-0 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
              >
                + Add
              </button>
            </div>
          </div>

          {/* Active filter pills */}
          {(debouncedQuery.trim() || activeTag) && (
            <div className="flex flex-wrap items-center gap-2 px-6 py-2">
              {debouncedQuery.trim() && (
                <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                  🔍 &ldquo;{debouncedQuery.trim()}&rdquo;
                  <button type="button" aria-label="Clear search query" onClick={() => setQuery("")} className="ml-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200">×</button>
                </span>
              )}
              {activeTag && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  #{activeTag}
                  <button type="button" aria-label={`Remove tag filter: ${activeTag}`} onClick={() => setActiveTag(null)} className="ml-1 text-blue-400 hover:text-blue-700 dark:hover:text-blue-200">×</button>
                </span>
              )}
              {debouncedQuery.trim() && activeTag && (
                <button type="button" onClick={() => { setActiveTag(null); setQuery(""); }} className="text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200">
                  Clear all
                </button>
              )}
            </div>
          )}

          {/* Infinite scroll feed */}
          <div className="flex-1 overflow-y-auto px-6 pb-10 pt-4">
            <BookmarkFeed
              initialPage={initialPage}
              query={debouncedQuery}
              activeTag={activeTag}
              optimisticItems={optimisticItems}
              onClearFilters={() => { setActiveTag(null); setQuery(""); }}
            />
          </div>
        </main>
      </div>

      <AddBookmarkModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={handleAddBookmark}
      />
    </div>
  );
}
