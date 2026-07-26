# Current Feature

<!-- Feature Name -->

Dashboard Collections

## Status

<!-- Not Started|In Progress|Completed -->

Completed

## Goals

<!-- Goals & requirements -->

See @context/features/dashboard-collections-spec.md for full spec.

- Replace the dummy collection data on the dashboard's main area with real data from the database (via `src/lib/mock-data.ts` today)
- Create `src/lib/db/collections.ts` with data fetching functions
- Fetch collections directly in the server component
- Collection card border color derived from the most-used content type in that collection
- Show small icons of all types present in that collection
- Keep the current design/layout (6 recent collection cards) — reference the screenshot if needed
- Update collection stats display
- Do not add the items underneath collections yet — that's a later feature

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
