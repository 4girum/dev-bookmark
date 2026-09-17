# Design: Landing Page Theme Toggle

## Overview

A three-way theme dropdown rendered in the landing page navbar, letting visitors choose Light, Dark, or System (OS-matching) colour scheme. The feature is built entirely from already-installed packages (`next-themes`, `lucide-react`, Tailwind CSS) and the component is already shipped at `src/components/LandingThemeToggle.tsx`.

---

## Architecture

The feature sits entirely in the **presentation layer** — there is no server-side data fetching, no database interaction, and no Server Actions. The data flow is:

```
next-themes (ThemeProvider)
        │
        │  resolvedTheme / setTheme
        ▼
LandingThemeToggle  ──────────────  src/app/page.tsx (navbar)
  "use client"
  - reads:  theme, setTheme  via useTheme()
  - writes: setTheme(value)  on user selection
  - side effects: localStorage write delegated to next-themes
```

### Component Tree

```
src/app/layout.tsx
  └─ ThemeProvider  (next-themes, attribute="class", defaultTheme="system")
       └─ src/app/page.tsx  (Landing – Server Component)
            └─ <header>
                 └─ LandingThemeToggle  ("use client")
                      ├─ <button>  trigger (aria-haspopup="listbox")
                      └─ <ul role="listbox">
                           ├─ <li> Light  (Sun icon)
                           ├─ <li> Dark   (Moon icon)
                           └─ <li> System (Monitor icon)
```

---

## Components

### `ThemeProvider` (`src/components/ThemeProvider.tsx`)

Thin wrapper around `NextThemesProvider` from `next-themes`.

| Prop | Value | Effect |
|---|---|---|
| `attribute` | `"class"` | Adds/removes `.dark` on `<html>`, enabling Tailwind `dark:` variants |
| `defaultTheme` | `"system"` | Falls back to System when no localStorage preference exists |
| `enableSystem` | `true` | Allows OS preference detection |

`src/app/layout.tsx` passes `suppressHydrationWarning` on `<html>` to silence the React hydration warning that next-themes triggers when it injects the class server-side.

### `LandingThemeToggle` (`src/components/LandingThemeToggle.tsx`)

`"use client"` component. Responsibilities:

1. **Skeleton gate** — renders a `animate-pulse` skeleton before `mounted` is true; avoids FOUC and hydration mismatch.
2. **Trigger button** — displays the active option's icon + label + chevron. `aria-haspopup="listbox"` and `aria-expanded` for accessibility.
3. **Dropdown panel** — a `<ul role="listbox">` with one `<li role="option">` per theme. The active item shows a checkmark and receives distinct highlight styles.
4. **Dismiss behaviour** — closes on outside `mousedown` (via `containerRef`) and on `Escape` keydown.

#### State

| Variable | Type | Description |
|---|---|---|
| `mounted` | `boolean` | `false` until first `useEffect` fires; guards SSR skeleton |
| `open` | `boolean` | Controls dropdown visibility |
| `theme` | `string \| undefined` | Current theme from `useTheme()` |

#### Option Definition

```typescript
type ThemeOption = "light" | "dark" | "system";

const options: { value: ThemeOption; label: string; Icon: React.ElementType }[] = [
  { value: "light",  label: "Light",  Icon: Sun     },
  { value: "dark",   label: "Dark",   Icon: Moon    },
  { value: "system", label: "System", Icon: Monitor },
];
```

---

## Interfaces & Data Models

No new types are introduced. The component consumes the `useTheme()` hook surface from `next-themes`:

```typescript
// Consumed from next-themes
interface UseThemeReturn {
  theme: string | undefined;    // current stored preference
  setTheme: (theme: string) => void;
}
```

---

## Error Handling & Edge Cases

| Scenario | Handling |
|---|---|
| Component renders before mount (SSR / hydration) | Skeleton placeholder rendered; real UI deferred to `useEffect` |
| `theme` is `undefined` before next-themes initialises | Fallback to `options[2]` (System) in `current` derivation |
| User clicks outside dropdown | `mousedown` listener on `document` closes the panel |
| User presses Escape | `keydown` listener closes the panel |
| OS preference changes while System is active | Fully delegated to next-themes `enableSystem`; no custom logic needed |

---

## Styling

Tailwind CSS `dark:` variants are activated by next-themes injecting `.dark` on `<html>`. Key classes used in the component:

- Container: `border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900`
- Active option: `text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40`
- Hover state: `hover:bg-neutral-100 dark:hover:bg-neutral-800`
- Skeleton: `bg-neutral-100 dark:bg-neutral-800 animate-pulse`

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Dropdown always exposes all three theme options

*For any* mounted state of `LandingThemeToggle` with the dropdown open, the rendered listbox SHALL contain exactly three items with labels "Light", "Dark", and "System", each accompanied by its corresponding icon (Sun, Moon, Monitor respectively).

**Validates: Requirements 1.1**

### Property 2: Selecting any option closes the dropdown and applies the theme

*For any* of the three theme option values (`"light"`, `"dark"`, `"system"`), clicking that option's button SHALL invoke `setTheme` with that exact value AND set the dropdown open state to `false`.

**Validates: Requirements 1.2**
