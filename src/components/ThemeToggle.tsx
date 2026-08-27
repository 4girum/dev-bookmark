"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="h-9 w-full rounded-lg" aria-hidden="true" />;
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
    >
      {/* Icon container — both icons stacked; only one is visible at a time */}
      <span className="relative h-5 w-5 shrink-0" aria-hidden="true">
        {/* Sun — visible in dark mode (about to switch to light) */}
        <span
          className={[
            "absolute inset-0 flex items-center justify-center text-base",
            "transition-all duration-300 ease-in-out",
            isDark
              ? "opacity-100 rotate-0 scale-100"
              : "opacity-0 -rotate-90 scale-50",
          ].join(" ")}
        >
          ☀️
        </span>

        {/* Moon — visible in light mode (about to switch to dark) */}
        <span
          className={[
            "absolute inset-0 flex items-center justify-center text-base",
            "transition-all duration-300 ease-in-out",
            isDark
              ? "opacity-0 rotate-90 scale-50"
              : "opacity-100 rotate-0 scale-100",
          ].join(" ")}
        >
          🌙
        </span>
      </span>

      {/* Label — crossfades between the two strings */}
      <span className="relative h-5 overflow-hidden">
        <span
          className={[
            "absolute inset-0 transition-all duration-300 ease-in-out",
            isDark
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-full",
          ].join(" ")}
        >
          Light mode
        </span>
        <span
          className={[
            "absolute inset-0 transition-all duration-300 ease-in-out",
            isDark
              ? "opacity-0 translate-y-full"
              : "opacity-100 translate-y-0",
          ].join(" ")}
        >
          Dark mode
        </span>
        {/* Hidden text keeps the button width stable */}
        <span className="invisible" aria-hidden="true">
          Light mode
        </span>
      </span>
    </button>
  );
}
