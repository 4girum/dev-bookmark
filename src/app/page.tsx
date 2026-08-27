import { db_getBookmarks } from "@/lib/actions";
import { mockBookmarks, allTags } from "@/lib/mock-data";
import BookmarkShell from "@/components/BookmarkShell";
import type { Bookmark } from "@/lib/mock-data";

export default async function Home() {
  let bookmarks: Bookmark[];
  let tags: string[];

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
