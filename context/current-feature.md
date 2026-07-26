# Current Feature

<!-- Feature Name -->

Stats & Sidebar

## Status

<!-- Not Started|In Progress|Completed -->

Completed

## Goals

<!-- Goals & requirements -->

See @context/features/stats-sidebar-spec.md for full spec.

- Display stats in the main area from database data instead of `src/lib/mock-data.ts`, keeping the current design/layout
- Display item types in the sidebar with their icons, linking to `/items/[typename]`
- Add a "View all collections" link under the collections list that goes to `/collections`
- Keep star icons for favorite collections; for recents, show a colored circle per collection based on its most-used item type
- Create `src/lib/db/items.ts` and add the database functions (reference `src/lib/db/collections.ts` if needed)

## Notes

<!-- Any extra notes -->

Depends on the Prisma + Neon PostgreSQL schema and seed data already in place. Reference `@src/lib/db/collections.ts` for data fetching patterns.

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
