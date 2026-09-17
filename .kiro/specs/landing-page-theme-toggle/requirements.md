# Requirements: Landing Page Theme Toggle

## Overview
Add a three-way theme toggle dropdown to the landing page navigation bar, allowing users to choose Light, Dark, or System (OS-matching) themes. The feature uses next-themes for persistence and system preference delegation, and Tailwind CSS dark: variants for styling.

---

### Requirement 1

**User Story:** As a visitor to the landing page, I want to choose between Light, Dark, and System themes, so that I can browse in the colour scheme I prefer.

#### Acceptance Criteria

1. WHEN a user opens the theme dropdown THEN the system SHALL display three options: Light, Dark, and System, each with a corresponding icon (Sun, Moon, Monitor).
2. WHEN a user selects a theme option THEN the system SHALL apply that theme immediately and close the dropdown.
3. WHEN no theme preference is saved THEN the system SHALL default to the System option.

---

### Requirement 2

**User Story:** As a visitor, I want my theme preference to persist across page reloads, so that I don't have to re-select it every visit.

#### Acceptance Criteria

1. WHEN a user selects a theme THEN the system SHALL persist the selection in localStorage via next-themes.
2. WHEN a user returns to the page THEN the system SHALL restore the previously saved theme from localStorage.

---

### Requirement 3

**User Story:** As a visitor with System theme selected, I want the site to follow my OS dark/light preference automatically, so that theme changes in my OS are reflected on the site without manual intervention.

#### Acceptance Criteria

1. WHEN the System option is active THEN the system SHALL delegate OS preference detection and change handling to next-themes.
2. WHEN the OS preference changes while System is active THEN the system SHALL update the applied theme without requiring user interaction.

---

### Requirement 4

**User Story:** As a developer, I want the theme component to avoid FOUC and hydration mismatches during SSR, so that users don't see a flash of the wrong theme on page load.

#### Acceptance Criteria

1. WHEN the component renders on the server THEN the system SHALL render a skeleton placeholder instead of the real UI.
2. WHEN the component mounts on the client THEN the system SHALL replace the skeleton with the functional theme dropdown.
3. WHEN the html element is rendered THEN the system SHALL include the `suppressHydrationWarning` attribute to suppress React hydration warnings caused by next-themes injecting the `.dark` class server-side.

---

### Requirement 5

**User Story:** As a developer, I want the theme toggle to live in a specific, predictable location, so that the codebase stays organised.

#### Acceptance Criteria

1. THE component SHALL reside at `src/components/LandingThemeToggle.tsx` and be imported by `src/app/page.tsx`.
2. THE component SHALL use only already-installed packages: `lucide-react` for icons and `next-themes` for theme management.
3. THE ThemeProvider in `src/app/layout.tsx` SHALL use `attribute="class"` so next-themes toggles the `.dark` class on the `<html>` element, enabling Tailwind CSS `dark:` variants.
