# Current Feature

<!-- Feature Name -->

Seed Data

## Status

<!-- Not Started|In Progress|Completed -->

In Progress

## Goals

<!-- Goals & requirements -->

See @context/features/seed-spec.md for full spec.

- Create a seed script (`prisma/seed.ts`) to populate the database with sample data for development and demos
- Seed a demo user (demo@devstash.io, password hashed with bcryptjs)
- Seed the 7 system item types (snippet, prompt, command, note, file, image, link)
- Seed 5 collections (React Patterns, AI Workflows, DevOps, Terminal Commands, Design Resources) with their items per the spec

## Notes

<!-- Any extra notes -->

Depends on the Prisma + Neon PostgreSQL schema already in place.

## History

<!-- Keep this updated. Earliest to latest -->

- Initial setup of Next.js
- Project setup and boilerplate cleanup
- Dashboard UI Phase 1
- Dashboard UI Phase 2
- Dashboard UI Phase 3
- Prisma + Neon PostgreSQL Setup
