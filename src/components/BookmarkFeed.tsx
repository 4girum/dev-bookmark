"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { Bookmark } from "@/lib/mock-data";
import type { PaginatedBookmarks } from "@/lib/actions/bookmarks";
import { db_getNextPage } from "@/lib/actions/bookmarks";
import BookmarkCard from "@/components/BookmarkCard";

// ---------------------------------------------------------------------------
// Skeleton card — shown while the next page is loading
// ---------------------------------------------------------------------------

function SkeletonCard() {
  return (
    <div
      aria-hidden="true"
      className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900"
    >
      <div className="h-4 w-3/4 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
      <div className="h-3 w-full animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
      <div className="h-3 w-5/6 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
      <div className="mt-2 flex gap-2">
        <div className="h-5 w-14 animate-pulse rounded-full bg-blue-100 dark:bg-blue-950" />
        <div className="h-5 w-10 animate-pulse rounded-full bg-blue-100 dark:bg-blue-950" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface BookmarkFeedProps {
  /** SSR-rendered first page, including cursors and hasMore. */
  initialPage: PaginatedBookmarks;
  /** Live search query string (from BookmarkShell). */
  query: string;
  /** Active tag filter (from BookmarkShell). */
  activeTag: string | null;
  /**
   * Prepended items from optimistic creates (temp + confirmed rows from the
   * current session). Rendered before the paginated items so they appear
   * instantly at the top without disrupting pagination cursors.
   */
  optimisticItems: Bookmark[];
  /** Clears both query and tag filters when the user clicks "Clear filters". */
  onClearFilters: () => void;
}

// ---------------------------------------------------------------------------
// BookmarkFeed
// ---------------------------------------------------------------------------

export default function BookmarkFeed({
  initialPage,
  query,
  activeTag,
  optimisticItems,
  onClearFilters,
}: BookmarkFeedProps) {
  // Accumulated pages of bookmarks loaded so far (excludes optimistic items).
  const [pages, setPages] = useState<Bookmark[]>(initialPage.items);
  const [nextCursor, setNextCursor] = useState<string | null>(initialPage.nextCursor);
  const [hasMore, setHasMore] = useState(initialPage.hasMore);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sentinel element at the bottom of the list — observed by IntersectionObserver.
  const sentinelRef = useRef<HTMLDivElement>(null);
  // Guard against concurrent fetches.
  const fetchingRef = useRef(false);

  // Reset feed when the initial page changes (e.g. after a new bookmark is
  // confirmed server-side and the page is revalidated).
  useEffect(() => {
    setPages(initialPage.items);
    setNextCursor(initialPage.nextCursor);
    setHasMore(initialPage.hasMore);
  }, [initialPage]);

  const loadNextPage = useCallback(async () => {
    if (fetchingRef.current || !hasMore || !nextCursor) return;
    fetchingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const result = await db_getNextPage(nextCursor);
      setPages((prev) => {
        // Deduplicate by id in case of timestamp collisions.
        const existingIds = new Set(prev.map((b) => b.id));
        const fresh = result.items.filter((b) => !existingIds.has(b.id));
        return [...prev, ...fresh];
      });
      setNextCursor(result.nextCursor);
      setHasMore(result.hasMore);
    } catch {
      setError("Failed to load more bookmarks. Scroll down to retry.");
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [hasMore, nextCursor]);

  // Wire up IntersectionObserver to the sentinel div.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadNextPage();
        }
      },
      {
        // Start loading 200px before the sentinel is fully visible.
        rootMargin: "0px 0px 200px 0px",
        threshold: 0,
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadNextPage]);

  // ---------------------------------------------------------------------------
  // Filtered view — operates on all accumulated items (optimistic + pages).
  // ---------------------------------------------------------------------------

  const allItems = [...optimisticItems, ...pages];

  const filtered = allItems.filter((b) => {
    const matchesTag = activeTag === null || b.tags.includes(activeTag);
    const q = query.trim().toLowerCase();
    const matchesQuery =
      q === "" ||
      b.title.toLowerCase().includes(q) ||
      b.tags.some((t) => t.toLowerCase().includes(q)) ||
      (b.language ?? "").toLowerCase().includes(q) ||
      (b.description ?? "").toLowerCase().includes(q);
    return matchesTag && matchesQuery;
  });

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const isFiltering = query.trim() !== "" || activeTag !== null;

  if (filtered.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <span className="text-4xl" aria-hidden="true">🔍</span>
        <p className="mt-4 text-sm font-medium text-neutral-500 dark:text-neutral-400">
          {isFiltering
            ? "No bookmarks match your search."
            : "No bookmarks yet — add your first one!"}
        </p>
        {isFiltering && (
          <button
            type="button"
            onClick={onClearFilters}
            className="mt-3 text-sm text-blue-600 hover:underline dark:text-blue-400"
          >
            Clear filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Bookmark grid */}
      {filtered.length > 0 && (
        <ul
          className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
          aria-label="Bookmarks"
        >
          {filtered.map((bookmark) => (
            <li key={bookmark.id}>
              <BookmarkCard bookmark={bookmark} query={query} />
            </li>
          ))}
        </ul>
      )}

      {/* Loading skeletons — shown while fetching the next page */}
      {loading && (
        <ul
          aria-label="Loading more bookmarks"
          className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {Array.from({ length: 3 }).map((_, i) => (
            <li key={`skeleton-${i}`}>
              <SkeletonCard />
            </li>
          ))}
        </ul>
      )}

      {/* Error state with retry */}
      {error && (
        <div className="flex flex-col items-center gap-2 py-4 text-center">
          <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
          <button
            type="button"
            onClick={loadNextPage}
            className="text-sm text-blue-600 hover:underline dark:text-blue-400"
          >
            Try again
          </button>
        </div>
      )}

      {/* End-of-list message — only shown when not filtering (filter may hide items) */}
      {!hasMore && !loading && !isFiltering && allItems.length > 0 && (
        <p className="py-6 text-center text-sm text-neutral-400 dark:text-neutral-500">
          You&apos;ve reached the end of your bookmarks! 🎉
        </p>
      )}

      {/* Invisible sentinel — IntersectionObserver target */}
      {hasMore && !isFiltering && (
        <div ref={sentinelRef} aria-hidden="true" className="h-1 w-full" />
      )}
    </div>
  );
}
