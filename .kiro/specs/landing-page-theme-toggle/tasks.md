# Implementation Plan: Landing Page Theme Toggle

## Overview

The feature is already fully implemented. Tasks cover verifying each layer: ThemeProvider configuration, the `LandingThemeToggle` component, its integration in the landing page navbar, and FOUC/hydration prevention. Any gap found during verification should be fixed in-place.

## Tasks

- [x] 1. Verify ThemeProvider configuration in `src/app/layout.tsx`
  - [x] 1.1 Confirm `ThemeProvider` is imported and wraps `{children}` in `RootLayout`
    - Check `attribute="class"` is set so next-themes toggles `.dark` on `<html>`
    - Check `defaultTheme="system"` and `enableSystem` are present
    - _Requirements: 1.3, 3.1_
  - [x] 1.2 Confirm `<html>` has `suppressHydrationWarning`
    - Attribute must be on the `<html>` element in `RootLayout`, not elsewhere
    - _Requirements: 4.3_

- [x] 2. Verify `LandingThemeToggle` component at `src/components/LandingThemeToggle.tsx`
  - [x] 2.1 Verify three theme options are defined and rendered
    - `options` array must contain `{ value: "light", label: "Light", Icon: Sun }`, `{ value: "dark", ... }`, `{ value: "system", ... }`
    - Dropdown `<ul role="listbox">` must render exactly three `<li role="option">` items
    - _Requirements: 1.1_
  - [x] 2.2 Verify selecting an option calls `setTheme` and closes the dropdown
    - `onClick` on each option button must call `setTheme(value)` and `setOpen(false)`
    - _Requirements: 1.2_
  - [ ]* 2.3 Write unit tests for option rendering and selection behaviour
    - Test that all three options are rendered when dropdown is open
    - Test that clicking an option calls `setTheme` with the correct value
    - Test that clicking an option sets `open` to `false`
    - **Property 1: Dropdown always exposes all three theme options — Validates: Requirements 1.1**
    - **Property 2: Selecting any option closes the dropdown and applies the theme — Validates: Requirements 1.2**
  - [x] 2.4 Verify FOUC prevention skeleton
    - Before `mounted` is `true` the component must render a skeleton placeholder (not the real button)
    - After mount the real trigger button must be rendered
    - _Requirements: 4.1, 4.2_
  - [x] 2.5 Verify dismiss behaviour
    - `mousedown` outside `containerRef` must close the dropdown
    - `Escape` keydown must close the dropdown
    - _Requirements: 1.2 (close on select is the primary path; outside-click / Escape are defensive)_

- [x] 3. Verify integration in `src/app/page.tsx`
  - [x] 3.1 Confirm `LandingThemeToggle` is imported from `@/components/LandingThemeToggle` and rendered inside the `<header>` navbar
    - _Requirements: 1.1, 5.1_

- [x] 4. Verify localStorage persistence via next-themes
  - [x] 4.1 Confirm no custom localStorage logic exists in `LandingThemeToggle`
    - Persistence is fully delegated to next-themes; the component only calls `setTheme`
    - _Requirements: 2.1, 2.2_

- [x] 5. Checkpoint — Ensure all tests pass
  - Run the test suite; fix any failures before proceeding.
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- All requirements are already satisfied by the existing code; tasks are verification checkpoints
- If any verification step reveals a gap, fix it in-place before moving to the next task
- Property tests (2.3) validate the two correctness properties defined in `design.md`

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1", "2.4", "2.5", "3.1", "4.1"] },
    { "id": 2, "tasks": ["2.2"] },
    { "id": 3, "tasks": ["2.3"] }
  ]
}
```
