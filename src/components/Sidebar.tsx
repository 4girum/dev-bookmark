"use client";

import { ThemeToggle } from "@/components/ThemeToggle";

interface SidebarProps {
  /** All available tags to display as filter options. */
  tags: string[];
  /** The currently active tag filter, or null for "All". */
  activeTag: string | null;
  /** Called when the user selects a tag (or null to clear the filter). */
  onTagSelect: (tag: string | null) => void;
}

export default function Sidebar({ tags, activeTag, onTagSelect }: SidebarProps) {
  return (
    <aside
      className="flex w-full flex-col gap-6 md:w-[250px] md:shrink-0"
      aria-label="Sidebar navigation"
    >
      {/* Brand / logo area */}
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
          D
        </span>
        <span className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
          DevBookmark
        </span>
      </div>

      {/* Primary navigation placeholders */}
      <nav aria-label="Primary navigation">
        <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
          Navigation
        </p>
        <ul className="flex flex-col gap-0.5">
          {navItems.map(({ label, icon }) => (
            <li key={label}>
              <button
                type="button"
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
                aria-disabled="true"
                tabIndex={-1}
              >
                <span aria-hidden="true">{icon}</span>
                {label}
                <span className="ml-auto text-xs text-neutral-300 dark:text-neutral-600">
                  soon
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Tag filter */}
      <nav aria-label="Filter by tag">
        <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
          Filter by tag
        </p>
        <ul className="flex flex-col gap-0.5">
          {/* "All" option */}
          <li>
            <button
              type="button"
              onClick={() => onTagSelect(null)}
              aria-pressed={activeTag === null}
              className={tagButtonClass(activeTag === null)}
            >
              <span className="text-neutral-400" aria-hidden="true">
                #
              </span>
              All
              {activeTag === null && <ActiveDot />}
            </button>
          </li>

          {tags.map((tag) => (
            <li key={tag}>
              <button
                type="button"
                onClick={() => onTagSelect(tag)}
                aria-pressed={activeTag === tag}
                className={tagButtonClass(activeTag === tag)}
              >
                <span className="text-neutral-400" aria-hidden="true">
                  #
                </span>
                {tag}
                {activeTag === tag && <ActiveDot />}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Theme toggle */}
      <div>
        <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
          Theme
        </p>
        <ThemeToggle />
      </div>
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

const navItems: { label: string; icon: string }[] = [
  { label: "All Bookmarks", icon: "🔖" },
  { label: "Snippets", icon: "💻" },
  { label: "Links", icon: "🔗" },
  { label: "Settings", icon: "⚙️" },
];

function tagButtonClass(active: boolean): string {
  const base =
    "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors";
  if (active) {
    return `${base} bg-blue-50 font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300`;
  }
  return `${base} font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100`;
}

function ActiveDot() {
  return (
    <span
      className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-500"
      aria-hidden="true"
    />
  );
}
