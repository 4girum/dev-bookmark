"use client";

import { ThemeToggle } from "@/components/ThemeToggle";
import Link from "next/link";
import { signOut } from "@/app/auth/actions";

interface SidebarProps {
  /** All available tags to display as filter options. */
  tags: string[];
  /** The currently active tag filter, or null for "All". */
  activeTag: string | null;
  /** Called when the user selects a tag (or null to clear the filter). */
  onTagSelect: (tag: string | null) => void;
  /** Authenticated user's email, or null when not signed in. */
  userEmail: string | null;
}

export default function Sidebar({ tags, activeTag, onTagSelect, userEmail }: SidebarProps) {
  return (
    <aside
      className="flex w-full flex-col gap-6  md:shrink-0"
      aria-label="Sidebar navigation"
    >
      <div>
       
      </div>
      {/* Brand / logo area */}
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
          &lt;/&gt;
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
          {navItems.map(({ label, icon, link }) => (
            <li key={label}>
              <Link
                href={link}>               
              
              <button
                type="button"
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
                aria-disabled="true"
                tabIndex={-1}
              >
                <span aria-hidden="true">{icon}</span>
                {label}
                <span className="ml-auto text-xs text-neutral-300 dark:text-neutral-600">
                  
                </span>
              </button>
              </Link>
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

      {/* Auth Container - Now Sticky at the Bottom */}
<div className="sticky bottom-0 z-10 bg-white dark:bg-neutral-900 mt-auto pt-4 pb-4 border-t border-neutral-200 dark:border-neutral-800">
  {userEmail ? (
    <div className="space-y-2">
      {/* User identity row */}
      <div className="flex items-center gap-2.5 px-1">
        {/* Avatar — initial letter in an indigo circle */}
        <span
          aria-hidden="true"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white uppercase"
        >
          {userEmail[0]}
        </span>
        <p
          className="truncate text-xs text-neutral-600 dark:text-neutral-300 font-medium"
          title={userEmail}
        >
          {userEmail}
        </p>
      </div>
      {/* Sign Out */}
      <form action={signOut}>
        <button
          type="submit"
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-red-50 hover:text-red-700 dark:text-neutral-400 dark:hover:bg-red-950 dark:hover:text-red-400"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 shrink-0" aria-hidden="true">
            <path fillRule="evenodd" d="M2 4.75A2.75 2.75 0 0 1 4.75 2h3a2.75 2.75 0 0 1 2.75 2.75v.5a.75.75 0 0 1-1.5 0v-.5c0-.69-.56-1.25-1.25-1.25h-3c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h3c.69 0 1.25-.56 1.25-1.25v-.5a.75.75 0 0 1 1.5 0v.5A2.75 2.75 0 0 1 7.75 14h-3A2.75 2.75 0 0 1 2 11.25v-6.5Zm9.47.47a.75.75 0 0 1 1.06 0l2.25 2.25a.75.75 0 0 1 0 1.06l-2.25 2.25a.75.75 0 1 1-1.06-1.06l.97-.97H6.75a.75.75 0 0 1 0-1.5h5.69l-.97-.97a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
          </svg>
          Sign Out
        </button>
      </form>
    </div>
  ) : (
    <Link
      href="/login"
      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 shrink-0" aria-hidden="true">
        <path fillRule="evenodd" d="M3.5 2A1.5 1.5 0 0 0 2 3.5v9A1.5 1.5 0 0 0 3.5 14h5a1.5 1.5 0 0 0 1.5-1.5v-.5a.75.75 0 0 0-1.5 0v.5h-5v-9h5v.5a.75.75 0 0 0 1.5 0v-.5A1.5 1.5 0 0 0 8.5 2h-5Zm7.72 4.22a.75.75 0 0 1 1.06 0l1.5 1.5a.75.75 0 0 1 0 1.06l-1.5 1.5a.75.75 0 1 1-1.06-1.06l.22-.22H7.5a.75.75 0 0 1 0-1.5h3.94l-.22-.22a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
      </svg>
      Log In
    </Link>
  )}
</div>

    </aside>
  );
}

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

const navItems: { label: string; icon: string; link: string; }[] = [
  { label: "Home", icon: "🏘", link: "/" },
  // { label: "Snippets", icon: "💻", link: "/" },
  // { label: "Links", icon: "🔗", link: "/" },
  // { label: "Settings", icon: "⚙️", link: "/" },
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
