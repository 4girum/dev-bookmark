# Implementation Plan: DevBookmark / QuickNote Hub

## Overview
Implementation phases covering local mock data, core UI components, dark/light theming, real-time search with highlighted results, PostgreSQL database integration, and a modal form for adding new bookmarks.

## Task Dependency Graph
```json
{
  "waves": [
    { "wave": 1, "tasks": ["1"] },
    { "wave": 2, "tasks": ["2"] },
    { "wave": 3, "tasks": ["3"] },
    { "wave": 4, "tasks": ["4"] },
    { "wave": 5, "tasks": ["5"] },
    { "wave": 6, "tasks": ["6"] },
    { "wave": 7, "tasks": ["7"] }
  ]
}
```

## Tasks
- [x] 1. Create mock data structure 📦
  - Create `src/lib/mock-data.ts` containing sample bookmarks with titles, tags, code snippets, and URLs.

- [x] 2. Build individual UI components 🃏
  - Create `BookmarkCard` to display title, tags, description, and snippet.
  - Create `Sidebar` for tag filtering and navigation placeholders.

- [x] 3. Assemble main page layout 🏗️
  - Combine `Sidebar` and a grid of `BookmarkCard` items in `src/app/page.tsx` with responsive desktop/mobile styling.

- [x] 4. Implement Dark / Light Mode Toggle 🌓
  - Set up a `ThemeProvider` (using `next-themes` or a React context) in `src/app/layout.tsx` to persist the user's preferred colour scheme.
  - Add a toggle button component to `Sidebar` that switches between dark and light Tailwind CSS classes.

- [x] 5. Real-Time Search & Tag Filtering 🔍
  - Debounce the search input in `src/app/page.tsx` (300 ms) so filtering only runs after the user pauses typing, reducing unnecessary re-renders.
  - Highlight matched search terms inside `BookmarkCard` title and description by wrapping matched substrings in a `<mark>` element styled with Tailwind (e.g. `bg-yellow-200 dark:bg-yellow-800 rounded px-0.5`).
  - Render active-filter pills in the results header — one dismissible pill per active tag and a separate pill for the current search query — so users can see and clear individual filters without losing the others.

- [x] 6. PostgreSQL Database Setup 🐘
  - Install `pg` and `@types/pg` and create `src/lib/db.ts` exporting a singleton `Pool` instance configured from `process.env.DATABASE_URL`.
  - Write a migration script at `src/lib/db/migrate.ts` that creates the `bookmarks` table with columns: `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`, `title TEXT NOT NULL`, `description TEXT`, `url TEXT`, `code_snippet TEXT`, `language TEXT`, `tags TEXT[] NOT NULL DEFAULT '{}'`, `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`.
  - Add a `db_getBookmarks` Server Action in `src/lib/actions.ts` that queries all rows from `bookmarks` ordered by `created_at DESC` and maps them to the existing `Bookmark` interface.
  - Add a `db_createBookmark` Server Action in `src/lib/actions.ts` that inserts a new row using parameterised queries and returns the created `Bookmark`.
  - Update `src/app/page.tsx` to call `db_getBookmarks` on the server (convert the page to an async Server Component) and pass the results down as props, replacing the mock data import.

- [x] 7. Add Bookmark Modal & Form Validation 📝
  - Create `src/components/AddBookmarkModal.tsx`: a `"use client"` modal dialog (using a native `<dialog>` element or a focus-trapped `<div>` with a backdrop) containing a form with fields for title (required), URL, description, tags (comma-separated input), code snippet, and language.
  - Add client-side validation: title must be non-empty (max 200 chars), URL must match a URL pattern when provided, tags must each be ≤ 50 chars; display inline field-level error messages styled with `text-red-500 text-xs`.
  - On valid submit, call the `db_createBookmark` Server Action, optimistically prepend the new bookmark to the displayed list using `useOptimistic`, and close the modal on success.
  - Add an "Add Bookmark" button in the main content header (top-right of the search bar row) that opens the modal; the button should be accessible with `aria-haspopup="dialog"`.

## Notes
- Using mock data initially to validate layout before connecting a database.
- The dark/light mode toggle uses Tailwind's `dark:` variant classes for styling, and the theme preference is persisted in `localStorage`.
- Real-time filtering is driven by `useMemo` in `page.tsx`; search is debounced at 300 ms to minimise re-renders, and matched terms are highlighted in `BookmarkCard` using a `<mark>` element.
- Task 6 requires a running PostgreSQL instance and a `DATABASE_URL` environment variable; the migration script must be run once before starting the app (`npx tsx src/lib/db/migrate.ts`).
- Task 7 uses `useOptimistic` (React 19) for instant UI feedback on bookmark creation; the modal is keyboard-navigable and closes on Escape or backdrop click.
