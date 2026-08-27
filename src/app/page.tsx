export const dynamic = "force-dynamic";
export const revalidate = 0;

import { db_getBookmarks } from "@/lib/actions";
import { mockBookmarks, allTags } from "@/lib/mock-data";
import BookmarkShell from "@/components/BookmarkShell";
import type { Bookmark } from "@/lib/mock-data";

export default async function Home() {
  let bookmarks: Bookmark[];
  let tags: string[];

  if (!process.env.DATABASE_URL) {
    console.warn("DATABASE_URL is not set — falling back to mock data.");
    return <BookmarkShell initialBookmarks={mockBookmarks} initialTags={allTags} />;
  }

  try {
    bookmarks = await db_getBookmarks();
    tags = Array.from(new Set(bookmarks.flatMap((b) => b.tags))).sort();
  } catch {
    // Fall back to mock data if the database is not configured
    bookmarks = mockBookmarks;
    tags = allTags;
  }

  return <BookmarkShell initialBookmarks={bookmarks} initialTags={tags} />;
}
