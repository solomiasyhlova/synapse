# Current Feature

<!-- Feature Name -->

Prisma + Neon PostgreSQL Setup

## Status

<!-- Not Started|In Progress|Completed -->

In Progress

## Goals

<!-- Goals & requirements -->

See @context/features/database-spec.md for full spec.

- Use Neon PostgreSQL (serverless)
- Create initial schema based on data models in @context/project-overview.md (this will evolve)
- Include NextAuth models (Account, Session, VerificationToken)
- Add appropriate indexes and cascade deletes
- Use Prisma 7 (breaking changes vs. Prisma 6 — read the upgrade guide before scaffolding)
- Always create migrations, never push directly, unless specified — dev branch feeds `DATABASE_URL`, separate production branch

## Notes

<!-- Any extra notes -->

Replaces the mock data in @src/lib/mock-data.ts, which was used for the dashboard UI phases until this is implemented.

## History

<!-- Keep this updated. Earliest to latest -->

- Initial setup of Next.js
- Project setup and boilerplate cleanup
- Dashboard UI Phase 1
- Dashboard UI Phase 2
- Dashboard UI Phase 3
