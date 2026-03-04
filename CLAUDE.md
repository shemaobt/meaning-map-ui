# Frontend Agent Guidelines (meaning-map-ui)

This file defines **frontend-specific** conventions for LLM agents working in `meaning-map-ui/`. Follow those global guidelines first, then apply what is below.

---

## 1. Stack and Build

- **Framework**: React 18
- **Language**: TypeScript
- **Build / dev**: Vite
- **Styling**: **Tailwind CSS** only (no CSS-in-JS, no styled-components, no SASS unless already present)
- **UI primitives**: Radix UI (via shadcn-style components in `src/components/ui/`)
- **State**: **Zustand** for application/passage state; **React Context** for auth and UI state (e.g. sidebar)
- **HTTP**: Axios (single client in `src/services/api.ts`)
- **Icons**: lucide-react
- **Toasts**: sonner
- **Utilities**: class-variance-authority (cva), clsx, tailwind-merge; use `cn()` from `src/utils/cn.ts` for merging class names

Use only these stack choices. Do not introduce Redux, MobX, or other state libraries; do not add a second styling system.

---

## 2. Project Structure

```
src/
├── App.tsx
├── main.tsx
├── components/
│   ├── common/       # shared UI (LoadingSpinner, EmptyState, StatusBadge, LockBadge, etc.)
│   ├── layout/       # AppShell, AppHeader, Sidebar, BHSAPanel
│   ├── pages/        # full-page views (LoginPage, SignupPage, DashboardPage, BooksPage,
│   │                 #   BookPage, MeaningMapPage, AccessDeniedPage, NotFoundPage)
│   └── ui/           # primitives (Button, Badge, Progress, etc.)
├── contexts/         # AuthContext (user, appRole, login, logout)
├── stores/           # Zustand stores (bhsaStore, etc.)
├── services/         # api.ts — single Axios client with namespaced APIs:
│   │                 #   authAPI, booksAPI, pericopesAPI, projectsAPI,
│   │                 #   meaningMapsAPI, bhsaAPI
├── hooks/            # useBHSA, useValidation, etc.
├── types/            # auth.ts, bible.ts, project.ts, meaningMap.ts, bhsa.ts
├── constants/        # app.ts (API_BASE_URL, token keys, etc.)
├── utils/            # cn, etc.
└── styles/           # index.css + centralized style constants (layout.ts, badges.ts, etc.)
```

- **components/**  
  Use **functional components** only. No class components. Prefer small, reusable components; avoid huge single-file pages.

### Component size and modularization

- **Target size**: Individual component files should generally be **under 300 lines**. If a component exceeds 400 lines, it almost certainly needs to be broken down.
- **Modularize by responsibility**: Split large components into smaller, focused sub-components. Each component should have a single responsibility.
- **Extract reusable patterns**: If a UI pattern appears more than once, extract it into a reusable component in `components/common/` or `components/ui/`.
- **Co-locate related components**: Sub-components that are only used by one parent can live in the same folder (e.g., `stages/Stage1Syntax/` with `index.tsx`, `PericopeSelector.tsx`, `ClauseCard.tsx`).
- **Avoid unnecessary breaking**: Don't split a component just to hit a line count. Split when there is a clear separation of concerns, reusability potential, or when the component becomes hard to read/maintain.
- **Keep state close**: Sub-components should receive data via props. Lift state only when necessary for sharing between siblings.

**Signs a component needs splitting:**

- More than 400 lines
- Multiple large JSX blocks that could be named components
- Many useState hooks managing unrelated state
- Helper functions that are only used for one section of the UI
- Hard to understand the component's main purpose at a glance

**Examples:**

- ✅ **Good:** `Stage1Syntax/index.tsx` (main logic ~200 lines) + `PericopeSelector.tsx` + `ClauseCard.tsx` + `PreviewCard.tsx` + `DiscardSessionDialog.tsx`
- ❌ **Bad:** Single 1000+ line file with all logic, all JSX, and all helpers mixed together.
- ✅ **Good:** Extract `ClauseCard` that receives `clause`, `isChecked`, `onToggle` as props and renders one clause.
- ❌ **Bad:** Inline 50+ lines of JSX for each clause inside a `.map()` in the parent component.
- ✅ **Good:** Reusable `ConfirmDialog` in `components/common/` used across multiple pages.
- ❌ **Bad:** Copy-pasting dialog markup in every component that needs a confirmation modal.

- **Modularize**: Split large components into smaller ones. Reuse primitives from `components/ui/` (Button, Card, Input, Dialog, Select, Badge, etc.). Do not duplicate UI patterns that already exist in `ui/`.

- **pages/**
  Full-page views. Compose from layout and ui components.
  - `DashboardPage` — statistics overview (status counts, progress bar, per-analyst table for admins). Non-admin users see only their own pericope stats; admins see all users.
  - `BooksPage` — book grid (OT/NT sections) with BookCard components. Default landing page (`/app/books`).
  - `BookPage` — single book view with chapters and pericopes.
  - `MeaningMapPage` — meaning map editor/viewer.

- **stages/**  
  Stage-specific UI (Stage1Syntax … Stage5Discourse). Use stores and services; keep presentation and data flow clear.

---

## 2b. Routing

Routes are defined in `App.tsx` under the `/app` shell (`AppShell`):

| Path | Component | Description |
|------|-----------|-------------|
| `/app` (index) | → redirects to `/app/books` | Default landing page |
| `/app/books` | `BooksPage` | Book grid (OT/NT) |
| `/app/books/:bookId` | `BookPage` | Single book with chapters/pericopes |
| `/app/dashboard` | `DashboardPage` | Statistics overview (role-aware) |
| `/app/maps/:mapId` | `MeaningMapPage` | Meaning map editor |

**Role-aware views**: `DashboardPage` uses `useAuth()` to check `appRole`. Admins (`appRole === "admin"`) see all-user stats and the analyst breakdown table. Non-admins see only their own pericopes (filtered by `analyst_name === user.display_name`).

---

## 3. Styling and Tailwind

- **Use Tailwind only** for layout, spacing, colors, typography, and responsive behavior.
- **Avoid inline styles** for things Tailwind can do (e.g. `className="flex items-center gap-2"` instead of `style={{ display: 'flex', alignItems: 'center' }}`). Use inline `style` only when necessary (e.g. dynamic values, third-party integration).
- **Use the design tokens** from `tailwind.config.js`: `branco`, `areia`, `azul`, `telha`, `verde`, `verde-claro`, `preto`, and semantic tokens (`primary`, `background`, `border`, `ring`, etc.). Do not introduce arbitrary hex values in JSX; extend the theme if new tokens are needed.

### Centralized style constants

- **Use `src/styles/`** for reusable style constants. This directory contains TypeScript objects with Tailwind class strings organized by purpose:
  - `cards.ts` — card, clause, event, participant card styles
  - `sections.ts` — collapsible section variant styles (roles, emotions, etc.)
  - `badges.ts` — category colors for participants, discourse, roles, validation
  - `layout.ts` — page, header, grid, form, modal layout patterns
  - `states.ts` — empty, loading, error, success, warning, info, read-only banners
- **Import from `@/styles`** when using these constants: `import { cardStyles, emptyStateStyles } from '@/styles'`
- **Prefer centralized styles** over repeating the same class strings across components. If you find yourself copying the same `className` pattern in multiple places, extract it to `src/styles/`.
- **Extend the central styles** when adding new patterns. Add new style objects to the appropriate file or create a new file if the category doesn't exist.

**Examples:**

- ✅ **Good:** `<div className={cn(cardStyles.base, cardStyles.hover)}>` — uses centralized card styles
- ❌ **Bad:** `<div className="bg-white rounded-lg border border-areia/30 shadow-sm transition-all duration-200 hover:shadow-md">` repeated in 10 components
- ✅ **Good:** `<div className={emptyStateStyles.container}>` — consistent empty state styling
- ❌ **Bad:** Different padding, colors, and icon sizes for empty states across components
- ✅ **Good:** `participantCategoryColors[category]` — category color lookup from central definition
- ❌ **Bad:** Hardcoded `bg-amber-100 text-amber-800` for divine participants in every component
- **Class merging**: Always use `cn()` from `src/utils/cn.ts` when combining conditional or overridden classes (e.g. `cn('base-class', className)`). Use `cva` for variant-based components (see `components/ui/button.tsx`).
- **No raw HTML for layout**: Prefer React components and Tailwind classes. Do not rely on hand-written HTML/CSS files for app layout or styling.

---

## 4. State Management

- **Zustand**: Use for **application and passage state** (e.g. passage data, participants, relations, events, discourse, validation, read-only flag). The main store is in `src/stores/passageStore.ts`. Follow the same pattern: one store per domain, `create` with optional `persist` middleware.
- **React Context**: Use for **auth** (AuthContext: user, login, logout) and **UI state** (SidebarContext: collapsed, etc.). Do not put passage or domain data in Context; use Zustand for that.
- **Local state**: Use `useState` / `useReducer` for component-local UI state (e.g. form fields, modals). Do not lift state to a global store unless it is shared across routes or stages.

---

## 5. API and Data

- **Single API client**: All backend calls go through `src/services/api.ts`. The file uses one Axios instance with interceptors (e.g. JWT). Namespaced methods: `authAPI`, `usersAPI`, `bhsaAPI`, `passagesAPI`, etc.
- **New endpoints**: Add methods to the appropriate namespace in `api.ts`; do not create a second axios client or duplicate auth handling.
- **Types**: Prefer types from `src/types/` or from the API module. Keep request/response types aligned with the backend and with the store (e.g. `ParticipantResponse`, `PassageData`).

---

## 6. Components and UI

- **Functional components**: Only function components; no class components.
- **UI primitives**: Use and extend components in `components/ui/` (Button, Card, Input, Dialog, Select, Badge, Progress, etc.). They use Radix + Tailwind + `cva` + `cn`. Match their API (e.g. `variant`, `size`, `className`).
- **Icons**:
- Use lucide-react only.
- Use outline icons exclusively.
- Do not mix outline and filled icons.
- Keep default stroke width unless explicitly needed.
- **Toasts**: Use **sonner** (`toast.success`, `toast.error`, `toast.warning`, etc.) as in the rest of the app.

---

## 7. Code Style (Frontend-Specific)

- **No comments for "what"**: Code and names should be self-explanatory. Comments only for non-obvious "why" (see root [GENERAL-WEB-APP.md](https://github.com/shemaobt/reference-agents-md/blob/main/GENERAL-WEB-APP.md)).
- **No module-level comments**: Do not add `/** Module description */` or similar at the top of files. The file name and location convey purpose.
- **TypeScript**: Prefer explicit types for props and for API/store types. Avoid `any` where a proper type exists.
- **File names**: PascalCase for components (e.g. `Stage2Participants.tsx`); camelCase for utilities, hooks, stores (e.g. `passageStore.ts`, `useOptions.ts`, `cn.ts`).

---


## 9. Design System Visual Identity (Shema)

All UI, styling, layout, spacing, colors, typography, and visual decisions MUST strictly follow these rules.
Do not override, reinterpret, or invent visual rules. Dark interfaces must be composed only using Shema palette colors.

### 9.1 Typography
- **Montserrat**: Entire interface (UI, buttons, navigation, labels, headings).
- **Merriweather**: Long-form texts, biblical content, and continuous reading.
- **Letter Spacing**: Use `tracking-tight` for normal headings, `tracking-wide` for labels/badges/uppercase.

### 9.2 Color Hierarchy & Palette
The Shema Design System heavily relies on an earthy palette. Do NOT use generic neutral greys.
- **Telha (#BE4A01)**: Exclusive to CTAs, primary actions, and active states. Never use as a neutral decorative color. Use opacity for hover (`hover:bg-telha/90`).
- **Shema White / Cream (#F6F5EB)**: Main app background.
- **White (#FFFFFF)**: Reserved strictly for elevated surfaces (Cards, Inputs, Modals).
- **Shema Black (#0A0703)**: Primary text color.
- **Shema Dark Green (#3F3E20)**: Secondary text, subtitles.
- **Blue (#89AAA3)**: Supporting elements.
- **Light Green (#777D45 / verde-claro)**: Success states, validation.
- **Sand (#C5C29F / areia)**: Borders, muted elements, warnings.

### 9.3 Spacing & Layout
Base unit is **4px** (Tailwind default).
- **Card padding**: `p-6` (24px) recommended for desktop, minimum 16px (`p-4`) on mobile.
- **Section gaps**: `space-y-6` or `space-y-8` for vertical rhythm.
- **Form spacing**: `space-y-4` between form groups, `space-y-2` between label and input.
- **Label spacing**: Default spacing between label and input/select is `mb-2` (8px).
- **Mobile layout**: Use **Elevation** to separate surfaces, generously rounded corners (16px+ for mobile), and large touch areas (min 44px height).

### 9.4 Cards & Surfaces
- **Background**: White (`bg-white`).
- **Borders**: Subtle border with Sand (`border border-areia/30`).
- **Shadows**: Soft elevation (`shadow-sm`, `shadow-md`). Hover states must increase shadow intensity (`hover:shadow-md`) and adjust border opacity (`hover:border-telha/30`).
- **Corner Radius**: 8-12px (`rounded-lg`) on Web, 16px+ (`rounded-2xl`) on Mobile.
- **Card Base Classes**: `bg-white rounded-lg border border-areia/30 shadow-sm`
- **Card Hover Classes**: `transition-all duration-200 hover:shadow-md hover:border-telha/30`

### 9.5 Buttons & Interactive Elements
- **Primary (Tile/Telha)**: Only for main CTAs.
- **States**: Use opacity or scale for hover/focus (`hover:bg-telha/90`, `active:scale-[0.98]`). Never introduce new colors on hover.
- **Focus states**: Ring with telha color (`focus:ring-telha`).
- **Rounded corners**: `rounded-md` or `rounded-lg` (8px+) for Web.
- **Padding**: Default `px-4 py-2`.

### 9.6 Badges & States
- **Shape**: Full rounded (`rounded-full`) for pill-shaped badges.
- **Validation**:
  - Success: `bg-verde-claro/20 text-verde-claro border-verde-claro/30`
  - Pending: `bg-areia/30 text-verde border-areia`
  - Error: `bg-red-100 text-red-800 border-red-200`

### 9.7 Animations & Transitions
- **Hover Transitions**: `transition-all duration-200`
- **Click Effects**: `active:scale-[0.98]`
- **Attention**: `animate-pulse-soft` for new/urgent badges.

### 9.8 Forms
- **Inputs**: White background (`bg-white`) with sand border (`border-areia`).
- **Focus**: `focus:ring-2 focus:ring-telha focus:border-telha`
- **Labels**: Montserrat medium, `text-sm`, `text-preto`, `mb-2`.

## 10. Git Workflow & Pull Requests

When the user says the code is ready, asks to "create a PR", or says "prepare the PR":

1. **Create a new branch** from the current HEAD with a descriptive name (e.g. `feat/restructure-dashboard-books`).
2. **Commit in small, scoped commits** — each commit should cover a single logical change (e.g. "Add BooksPage with book grid", "Rewrite DashboardPage as statistics overview", "Update routes in App.tsx"). Avoid lumping all changes into a single commit. Break them correctly by scope.
3. **Push the branch** to the remote with `-u` to set upstream tracking.
4. **Create a pull request** using `gh pr create` targeting `main` with:
   - A concise title (under 70 characters)
   - A detailed body with a `## Summary` section (bullet points of what changed and why) and a `## Test plan` section (how to verify the changes)
5. **Return the PR URL** to the user.

Use `gh` CLI for all GitHub operations (push, PR creation). Never force-push or amend published commits.

---

## 8. Summary Checklist (Frontend)

- [ ] Use only the stack above: React, TypeScript, Vite, Tailwind, Zustand, Context, Axios, Radix/shadcn-style ui, lucide-react, sonner.
- [ ] **React**: Functional components only; modularize; reuse `components/ui/` primitives.
- [ ] **Component size**: Keep components under 300 lines; split if over 400 lines. Extract sub-components by responsibility.
- [ ] **Styling**: Tailwind only; use `cn()` and design tokens from `tailwind.config.js`; avoid inline styles except when necessary.
- [ ] **Centralized styles**: Use `src/styles/` for reusable patterns (cards, badges, states, layout); avoid repeating the same className strings.
- [ ] **State**: Zustand for passage/app state; Context for auth and UI state; local state for component-only state.
- [ ] **API**: Single `api.ts` client; add new methods to the existing namespaces.
- [ ] No raw HTML/CSS for app layout; no new state or styling libraries.