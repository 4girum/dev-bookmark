"use server";

import { createClient } from "@/lib/supabase/server";
import type { Bookmark } from "@/lib/mock-data";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_PAGE_SIZE = 1;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Row shape returned by Supabase (snake_case columns). */
interface BookmarkRow {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  url: string | null;
  code_snippet: string | null;
  language: string | null;
  tags: string[];
  created_at: string;
}

function rowToBookmark(row: BookmarkRow): Bookmark {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    url: row.url ?? undefined,
    codeSnippet: row.code_snippet ?? undefined,
    language: row.language ?? undefined,
    tags: row.tags,
    createdAt: row.created_at,
  };
}

export interface PaginatedBookmarks {
  /** The current page of bookmark records. */
  items: Bookmark[];
  /**
   * Cursor to pass as `cursor` with `direction: "next"` to fetch the
   * next (older) page. Null when this is already the last page.
   */
  nextCursor: string | null;
  /**
   * Cursor to pass as `cursor` with `direction: "prev"` to fetch the
   * previous (newer) page. Null when this is already the first page.
   */
  prevCursor: string | null;
  /** True when a page in the requested direction still has more records. */
  hasMore: boolean;
}

export interface FetchBookmarksParams {
  /**
   * The `created_at` ISO timestamp of the boundary item.
   * Omit (or pass null) for the very first load — returns the most
   * recent `limit` records.
   */
  cursor?: string | null;
  /** Number of records per page. Defaults to DEFAULT_PAGE_SIZE. */
  limit?: number;
  /**
   * "next" → fetch items older than the cursor (created_at < cursor).
   * "prev" → fetch items newer than the cursor (created_at > cursor).
   * Ignored when cursor is null/undefined (initial load).
   */
  direction?: "next" | "prev";
}

// ---------------------------------------------------------------------------
// Action
// ---------------------------------------------------------------------------

/**
 * Fetches a cursor-based page of bookmarks for the authenticated user.
 *
 * Ordering is always created_at DESC (newest first).
 *
 * Bi-directional behaviour:
 *   • direction "next" (default): return rows with created_at < cursor,
 *     i.e. older than the current page's last item.
 *   • direction "prev": return rows with created_at > cursor,
 *     i.e. newer than the current page's first item. Because Supabase
 *     returns gt() rows in ascending order when combined with our DESC
 *     sort, we fetch them ascending and reverse to maintain DESC display.
 *
 * hasMore detection: we always request limit + 1 rows. If the response
 * contains limit + 1 items, a further page exists in that direction; we
 * slice back to limit before returning.
 */
export async function db_fetchBookmarkPage(
  params: FetchBookmarksParams = {}
): Promise<PaginatedBookmarks> {
  const { cursor = null, limit = DEFAULT_PAGE_SIZE, direction = "next" } = params;
  const fetchSize = limit + 1; // one extra to detect hasMore

  const supabase = await createClient();

  // ── Build query ──────────────────────────────────────────────────────────
  // RLS ensures only the authenticated user's rows are returned.
  let query = supabase
    .from("bookmarks")
    .select("*");

  if (!cursor) {
    // Initial load — most recent records, no cursor filtering needed.
    query = query.order("created_at", { ascending: false }).limit(fetchSize);
  } else if (direction === "next") {
    // Older items: created_at strictly before the cursor.
    query = query
      .lt("created_at", cursor)
      .order("created_at", { ascending: false })
      .limit(fetchSize);
  } else {
    // direction === "prev": newer items created_at strictly after the cursor.
    // We must use ascending order here so .gt() returns the records closest
    // to the cursor first (otherwise we'd skip items). We reverse after fetching
    // to restore the expected newest-first display order.
    query = query
      .gt("created_at", cursor)
      .order("created_at", { ascending: true })
      .limit(fetchSize);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`db_fetchBookmarkPage failed: ${error.message}`);
  }

  const rows = data as BookmarkRow[];

  // ── hasMore detection ────────────────────────────────────────────────────
  const hasMore = rows.length === fetchSize;
  const pageRows = hasMore ? rows.slice(0, limit) : rows;

  // For "prev" direction the rows arrived ascending — reverse to DESC.
  if (direction === "prev") {
    pageRows.reverse();
  }

  const items = pageRows.map(rowToBookmark);

  // ── Cursors ──────────────────────────────────────────────────────────────
  // nextCursor points at the oldest item on this page (last in DESC order).
  // prevCursor points at the newest item on this page (first in DESC order).
  const nextCursor = items.length > 0 ? items[items.length - 1].createdAt : null;
  const prevCursor = items.length > 0 ? items[0].createdAt : null;

  return { items, nextCursor, prevCursor, hasMore };
}

// ---------------------------------------------------------------------------
// Convenience wrappers (thin aliases for the UI layer)
// ---------------------------------------------------------------------------

/** Fetch the first page of bookmarks (no cursor). */
export async function db_getFirstPage(
  limit = DEFAULT_PAGE_SIZE
): Promise<PaginatedBookmarks> {
  return db_fetchBookmarkPage({ limit });
}

/** Fetch the next (older) page given the last item's cursor. */
export async function db_getNextPage(
  cursor: string,
  limit = DEFAULT_PAGE_SIZE
): Promise<PaginatedBookmarks> {
  return db_fetchBookmarkPage({ cursor, limit, direction: "next" });
}

/** Fetch the previous (newer) page given the first item's cursor. */
export async function db_getPrevPage(
  cursor: string,
  limit = DEFAULT_PAGE_SIZE
): Promise<PaginatedBookmarks> {
  return db_fetchBookmarkPage({ cursor, limit, direction: "prev" });
}
