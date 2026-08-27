export interface Bookmark {
  id: string;
  title: string;
  description?: string;
  url?: string;
  codeSnippet?: string;
  language?: string;
  tags: string[];
  createdAt: string;
}

export const mockBookmarks: Bookmark[] = [
  {
    id: "1",
    title: "useCallback vs useMemo",
    description:
      "Quick reference for when to use useCallback versus useMemo in React to avoid unnecessary re-renders.",
    url: "https://react.dev/reference/react/useCallback",
    tags: ["react", "hooks", "performance"],
    createdAt: "2026-08-01T10:00:00Z",
  },
  {
    id: "2",
    title: "Debounce utility",
    description: "Generic debounce helper for limiting the rate of function calls.",
    codeSnippet: `function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}`,
    language: "typescript",
    tags: ["typescript", "utils", "performance"],
    createdAt: "2026-08-05T14:30:00Z",
  },
  {
    id: "3",
    title: "Next.js App Router data fetching",
    description:
      "Patterns for server components, fetch caching, and revalidation in the Next.js App Router.",
    url: "https://nextjs.org/docs/app/building-your-application/data-fetching",
    tags: ["nextjs", "react", "server-components"],
    createdAt: "2026-08-10T09:15:00Z",
  },
  {
    id: "4",
    title: "Tailwind responsive grid",
    description: "Responsive CSS grid setup using Tailwind utility classes.",
    codeSnippet: `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map((item) => (
    <Card key={item.id} {...item} />
  ))}
</div>`,
    language: "tsx",
    tags: ["tailwind", "css", "layout"],
    createdAt: "2026-08-12T11:00:00Z",
  },
  {
    id: "5",
    title: "PostgreSQL JSONB indexing",
    description:
      "How to create GIN indexes on JSONB columns in PostgreSQL for efficient key/value lookups.",
    url: "https://www.postgresql.org/docs/current/datatype-json.html",
    codeSnippet: `CREATE INDEX idx_meta ON bookmarks USING gin(meta);`,
    language: "sql",
    tags: ["postgres", "database", "performance"],
    createdAt: "2026-08-15T16:45:00Z",
  },
  {
    id: "6",
    title: "Zod schema validation",
    description: "Runtime type validation with Zod — defining schemas and parsing unknown input.",
    url: "https://zod.dev",
    codeSnippet: `import { z } from "zod";

const BookmarkSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  url: z.string().url().optional(),
  tags: z.array(z.string()),
});

type Bookmark = z.infer<typeof BookmarkSchema>;`,
    language: "typescript",
    tags: ["typescript", "validation", "zod"],
    createdAt: "2026-08-18T08:00:00Z",
  },
];

/** All unique tags derived from the mock data set. */
export const allTags: string[] = Array.from(
  new Set(mockBookmarks.flatMap((b) => b.tags))
).sort();
