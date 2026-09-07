export const dynamic = "force-dynamic";
export const revalidate = 0;

import { mockBookmarks, allTags } from "@/lib/mock-data";
import BookmarkShell from "@/components/BookmarkShell";
import type { PaginatedBookmarks } from "@/lib/actions/bookmarks";

// Resolve the user's session server-side so the sidebar can show the correct
// auth state without any client-side flicker.
async function getUser() {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return null;
    }
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

/** Mock data shaped as a PaginatedBookmarks first page for local dev. */
function mockFirstPage(): PaginatedBookmarks {
  return {
    items: mockBookmarks,
    nextCursor: mockBookmarks.length > 0
      ? mockBookmarks[mockBookmarks.length - 1].createdAt
      : null,
    prevCursor: mockBookmarks.length > 0
      ? mockBookmarks[0].createdAt
      : null,
    // Mock data is small — no more pages.
    hasMore: false,
  };
}

export default async function BookmarksPage() {
  const user = await getUser();

  // ── No Supabase: use mock data ──────────────────────────────────────────
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn("Supabase not configured — falling back to mock data.");
    return (
      <BookmarkShell
        initialPage={mockFirstPage()}
        initialTags={allTags}
        userEmail={user?.email ?? null}
      />
    );
  }

  // ── Supabase configured: fetch first page via cursor pagination ─────────
  let initialPage: PaginatedBookmarks;
  let tags: string[];

  try {
    const { db_getFirstPage } = await import("@/lib/actions/bookmarks");
    initialPage = await db_getFirstPage();
    tags = Array.from(new Set(initialPage.items.flatMap((b) => b.tags))).sort();
  } catch {
    // Fall back to mock data if the DB query fails.
    console.warn("db_getFirstPage failed — falling back to mock data.");
    initialPage = mockFirstPage();
    tags = allTags;
  }

  return (
    <BookmarkShell
      initialPage={initialPage}
      initialTags={tags}
      userEmail={user?.email ?? null}
    />
  );
}
