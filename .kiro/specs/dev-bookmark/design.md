# Design Specification: DevBookmark / QuickNote Hub

## Overview
A micro dashboard to manage, tag, and search developer snippets and links.

## Architecture
Next.js 15 App Router client/server components with local state management.

## 🎨 UI/UX & Layout Architecture
- **Desktop (>= 768px):** Two-column layout (Sidebar + Grid).
- **Mobile (< 768px):** Single-column layout with collapsible menu.

## Components and Interfaces
- `Sidebar`: Nav & filter tags.
- `BookmarkGrid`: Main display container.
- `BookmarkCard`: Snippet/link visual card.

### 1. Layout Structure
- **Desktop (>= 768px):** Two-column layout.
  - **Left Sidebar (250px):** Navigation, category/tag filters, and theme toggle.
  - **Main Content:** Top search bar + grid of bookmark cards.
- **Mobile (< 768px):** Single-column layout.
  - Collapsible drawer/hamburger menu for the sidebar.
  - Bookmark cards stack vertically (1 column).

### 2. Design Tokens & Styling
- **Framework:** Tailwind CSS + `shadcn/ui`.
- **Theme:** Full Dark/Light mode support using CSS variables.
- **Grid System:** `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` for bookmark lists.

---

## Data Models
```typescript
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