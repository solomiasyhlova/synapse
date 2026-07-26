# Current Feature

<!-- Feature Name -->

Dashboard Items

## Status

<!-- Not Started|In Progress|Completed -->

Completed

## Goals

<!-- Goals & requirements -->

See @context/features/dashboard-items-spec.md for full spec.

- Replace the dummy item data displayed in the main area of the dashboard (right side) with real data from the database, for both pinned and recent items
- If there are no pinned items, nothing should display there
- Create `src/lib/db/items.ts` with data fetching functions
- Fetch items directly in the server component
- Item card icon/border derived from the item type
- Display item type tags and anything else currently there — reference the screenshot if needed
- Update collection stats display

## Notes

<!-- Any extra notes -->

Depends on the Prisma + Neon PostgreSQL schema and seed data already in place. Reference `@context/screenshots/dashboard-ui-main.png` for layout/design, though it doesn't need to be exact.

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
