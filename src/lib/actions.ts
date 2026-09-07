"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Bookmark } from "@/lib/mock-data";

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

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/**
 * Fetch all bookmarks for the currently authenticated user, ordered by
 * creation date descending.
 *
 * RLS on the bookmarks table ensures only the user's own rows are returned —
 * no explicit WHERE clause needed.
 */
export async function db_getBookmarks(): Promise<Bookmark[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("bookmarks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`db_getBookmarks failed: ${error.message}`);
  }

  return (data as BookmarkRow[]).map(rowToBookmark);
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export interface CreateBookmarkInput {
  title: string;
  description?: string;
  url?: string;
  codeSnippet?: string;
  language?: string;
  tags: string[];
}

/**
 * Insert a new bookmark for the current user.
 *
 * The user_id is resolved from the active session server-side — never
 * trusted from the client payload.  RLS INSERT policy enforces the same
 * constraint at the database level as an additional safety net.
 */
export async function db_createBookmark(
  input: CreateBookmarkInput
): Promise<Bookmark> {
  const supabase = await createClient();

  // Resolve the authenticated user inside the server action.
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Not authenticated — cannot create bookmark.");
  }

  const { data, error } = await supabase
    .from("bookmarks")
    .insert({
      user_id: user.id,
      title: input.title,
      description: input.description ?? null,
      url: input.url ?? null,
      code_snippet: input.codeSnippet ?? null,
      language: input.language ?? null,
      tags: input.tags,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`db_createBookmark failed: ${error.message}`);
  }

  revalidatePath("/bookmarks");
  return rowToBookmark(data as BookmarkRow);
}
