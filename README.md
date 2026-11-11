# User Management Dashboard

A responsive admin dashboard for browsing users, built as a technical assessment. It has a mock login, an overview page with summary cards and charts, and a users table with search, filters, sorting, and pagination. Data comes from [JSONPlaceholder](https://jsonplaceholder.typicode.com/users).

**Live demo:** https://user-management-dashboard-gamma-flax.vercel.app/dashboard

## Screenshots

_Add screenshots here._

| Login  | Dashboard | Users  | Mobile |
| ------ | --------- | ------ | ------ |
| _todo_ | _todo_    | _todo_ | _todo_ |

## Features

- **Login with mock auth.** Email and password are validated with Zod, with inline errors and a loading button.
- **Protected routes.** `/dashboard` and everything under it redirect to `/login` when signed out. `/` redirects based on auth state.
- **Dashboard overview.** A time-based greeting, four stat cards (Total, Active, Inactive, Companies), a Users by City bar chart, an Active vs Inactive split, and a Recent Users panel.
- **Users table.** Name, Email, Company, City, and a Status badge, with sorting by name and pagination.
- **Search and filters.** Debounced search (300ms) across name and email, plus Status and City filters that combine. Any change returns to page 1.
- **API status indicator.** The header shows Idle, Loading, Refreshing, Success (with last updated time), or Error (with Retry).
- **Loading, empty, and error states.** Skeletons while loading, an empty state when nothing matches, and an error message with a retry button.
- **Responsive layout.** A sidebar on desktop becomes a slide-out drawer on mobile. The table becomes stacked cards on small screens.
- **Accessible.** Keyboard-operable throughout, with labelled controls, a skip link, visible focus, live status updates, and reduced-motion support.
- **Light and dark mode**, following the system setting.

## Tech stack

| Area          | Choice                                  |
| ------------- | --------------------------------------- |
| Framework     | Next.js 16 (App Router), React 19       |
| Language      | TypeScript (strict, no `any`)           |
| Styling       | Tailwind CSS 4, no UI component library |
| Data fetching | TanStack Query 5                        |
| Validation    | Zod 4                                   |
| Testing       | Vitest 5, React Testing Library, jsdom  |
| Code quality  | ESLint 9, Prettier 3                    |

## Getting started

Requires Node.js 22 or later.

```bash
git clone https://github.com/Cloudcrackamara/user-management-dashboard.git
cd user-management-dashboard
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command                | What it does                                  |
| ---------------------- | --------------------------------------------- |
| `npm run dev`          | Start the development server                  |
| `npm run build`        | Create a production build                     |
| `npm run start`        | Serve the production build                    |
| `npm test`             | Run all tests once                            |
| `npm run test:watch`   | Run tests in watch mode                       |
| `npm run lint`         | Run ESLint                                    |
| `npm run typecheck`    | Generate route types, then run `tsc --noEmit` |
| `npm run format`       | Format all files with Prettier                |
| `npm run format:check` | Check formatting without writing              |

## Mock login

There is no real backend. **Any valid email and any password of 6 or more characters will sign you in.**

On success, a fake token and the email are saved to `localStorage`. The part of the email before the `@` becomes your display name, so `jane.doe@example.com` is greeted as "Jane Doe". Signing out clears both.

This is a demonstration of the flow only. It is not secure and must not be used as a pattern for real authentication.

## Triggering the error state

Add `?fail=true` to any dashboard URL:

```
http://localhost:3000/dashboard?fail=true
http://localhost:3000/dashboard/users?fail=true
```

The users request then fails after its simulated delay. The header indicator turns to Error and the page shows an error message. Retry keeps failing while the parameter is present; remove it and retry to recover.

The request also has about 800ms of simulated latency so that loading states are visible.

## Folder structure

```
app/                    Routes (App Router)
  layout.tsx            Root layout, fonts, query provider
  page.tsx              "/" - redirects by auth state
  login/                "/login"
  dashboard/            "/dashboard" - guarded layout and overview
    users/              "/dashboard/users"
    settings/           "/dashboard/settings" (placeholder)
components/
  ui/                   Generic, reusable building blocks
                        (Button, TextField, SelectField, Card, Badge, DataTable,
                        Pagination, Skeleton, EmptyState, ErrorMessage, icons)
  auth/                 Login form, route guards, sign-out button
  layout/               Shell, sidebar nav, mobile drawer, header, user menu
  dashboard/            Greeting, stat cards, charts, recent users
  users/                Users table, toolbar, status badge
  status/               API status indicator
  providers/            TanStack Query provider
hooks/                  useUsers, useDebounce, useAuthStatus, useAuthRedirect,
                        useAuthEmail
lib/
  api/                  fetchUsers
  schemas/              Zod schemas and derived types
  test/                 Test fixtures and render helpers
  *.ts                  Pure logic: auth, filters, sorting, pagination, stats,
                        greeting, routes
```

Tests sit next to the code they cover as `*.test.ts(x)`.

## Architecture decisions and trade-offs

**Pure logic lives in `lib/`, components stay thin.** Filtering, sorting, pagination, and statistics are plain functions with no React in them. They are easy to unit test, and components only wire state to them. The cost is a few more small files.

**One shared users query.** Every consumer calls `useUsers`, so the header indicator, the cards, the charts, and the table share one cached request. The status indicator itself subscribes to the query, which means users are fetched on every dashboard page, including Settings. That is one small request, and it keeps the indicator meaningful everywhere.

**Validate at the boundary.** The API response is parsed with Zod before it enters the app, and the app's `User` type is derived from that schema. A malformed response becomes a clear error instead of a crash deep in a component.

**Client-side auth guard.** The token is in `localStorage`, which the server cannot read, so protection happens in the browser. Auth state is read through `useSyncExternalStore` and reports "loading" until storage has been read, which avoids a flash of the wrong page and keeps tabs in sync. The trade-off is that this protects the UI only. Real auth would use an HTTP-only cookie checked on the server.

**Client-side search, sort, and pagination.** The API returns ten users and supports none of these operations, so they run in the browser. This would not scale to large datasets, where they belong on the server.

**Derived mock data.** JSONPlaceholder has no status or creation date. Status is derived from the id (every third user is Inactive) so it is stable across requests, and "recent" users are those with the highest ids.

**Page size of 5.** With ten users, a page size of 10 would give a single page and hide pagination. It is one constant, `USERS_PAGE_SIZE`.

**No automatic retries.** Queries are configured with `retry: false` so that a failure shows immediately and the manual Retry button is the way to recover. A production app would likely retry transient failures first.

**Native `<dialog>` for the drawer.** The browser provides the focus trap, makes the page behind inert, handles Escape, and restores focus on close. That is less code and fewer bugs than a hand-written focus trap.

**Two layouts for the table.** The table renders both a real `<table>` and a stacked card list, and CSS shows one. This keeps proper table semantics on desktop and a readable layout on mobile, at the cost of rendering rows twice. That is fine at this size and would need revisiting for very long lists.

**No UI or chart library.** All components and charts are built with Tailwind, as the brief required. The charts are simple div-based bars with text labels, which suits this data but would not replace a charting library for anything complex.

## What I'd improve with more time

- **Real authentication** with server-side sessions and route protection in middleware.
- **End-to-end tests** with Playwright covering the login flow, navigation, and responsive behaviour in a real browser. The current tests run in jsdom, which cannot check layout or the native dialog's focus trap.
- **Automated accessibility checks** (axe) in the test suite, plus a manual screen reader pass.
- **Filter state in the URL** so that searches and pages can be shared and survive a refresh.
- **Sorting on every column**, not only name.
- **User detail and edit screens**, with optimistic updates.
- **A real Settings page**, including a manual theme switch.
- **Server-side pagination and search** against an API that supports them.
- **Error monitoring and CI**, running lint, typecheck, and tests on every pull request.
