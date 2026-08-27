"use server";

import pool from "@/lib/db";
import type { Bookmark } from "@/lib/mock-data";

/** Row shape returned by the database. */
interface BookmarkRow {
  id: string;
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

/** Fetch all bookmarks ordered by creation date descending. */
export async function db_getBookmarks(): Promise<Bookmark[]> {
  const result = await pool.query<BookmarkRow>(
    "SELECT * FROM bookmarks ORDER BY created_at DESC"
  );
  return result.rows.map(rowToBookmark);
}

export interface CreateBookmarkInput {
  title: string;
  description?: string;
  url?: string;
  codeSnippet?: string;
  language?: string;
  tags: string[];
}

/** Insert a new bookmark and return the created row. */
export async function db_createBookmark(
  input: CreateBookmarkInput
): Promise<Bookmark> {
  const result = await pool.query<BookmarkRow>(
    `INSERT INTO bookmarks (title, description, url, code_snippet, language, tags)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      input.title,
      input.description ?? null,
      input.url ?? null,
      input.codeSnippet ?? null,
      input.language ?? null,
      input.tags,
    ]
  );
  return rowToBookmark(result.rows[0]);
}
