# Current Feature

<!-- Feature Name -->
Code Quality Quick Wins (Code Scan Cleanup)

## Status

In Progress

## Goals

- Replace `TypeIcon.tsx`'s `import * as LucideIcons` + dynamic `Record` lookup/cast with an explicit icon-name → component map (fixes tree-shaking, restores type safety)
- Add `zod` and `vitest` as explicit devDependencies in `package.json` (currently only pulled in transitively; both are required by coding-standards.md)
- Redirect the root `/` route to `/dashboard` instead of rendering a placeholder `<h1>`

## Notes

Sourced from the code-scanner findings (2026-07-27). Deliberately excludes anything auth-related — auth isn't implemented yet, so `DEMO_USER_EMAIL` stays as-is. Also excludes items with more risk/process overhead: composite DB indexes (needs a Prisma migration), splitting up `Sidebar.tsx`, and wiring `NewCollectionDialog` to a real write path.

## History

<!-- Keep this updated. Earliest to latest -->

- Initial setup of Next.js
- Project setup and boilerplate cleanup
- Dashboard UI Phase 1
- Dashboard UI Phase 2
- Dashboard UI Phase 3
- Prisma + Neon PostgreSQL Setup
- Seed Data
- Dashboard Collections
- Dashboard Items
- Stats & Sidebar
- Add Pro Badge to Sidebar
