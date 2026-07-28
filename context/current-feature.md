# Current Feature: Auth UI - Sign In, Register & Sign Out

## Status

In Progress

## Goals

- Custom Sign In page (`/sign-in`): email/password fields, "Sign in with GitHub" button, link to register page, form validation and error display
- Custom Register page (`/register`): name, email, password, confirm password fields; validation (passwords match, email format); submit to `/api/auth/register`; redirect to sign-in on success
- Bottom of sidebar: user avatar (GitHub image or initials fallback), user name, dropdown/up on avatar click with "Sign out" link, clicking icon goes to `/profile`

## Notes

- Avatar logic: use `image` from GitHub if present, otherwise generate initials from name (e.g., "Brad Traversy" → "BT")
- Create a reusable avatar component handling both cases
- Replaces NextAuth default pages with custom UI
- Testing checklist:
  1. `/sign-in` renders custom page
  2. GitHub sign-in flow works
  3. Email/password sign-in flow works
  4. Avatar shows in top bar/sidebar (GitHub image or initials)
  5. Clicking avatar shows dropdown
  6. "Sign out" logs out and redirects
  7. `/register` creates new account and redirects to sign-in

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
- Code Quality Quick Wins (Code Scan Cleanup): explicit TypeIcon icon map, zod/vitest devDependencies, root redirect to /dashboard
- Auth Setup - NextAuth + GitHub Provider (Phase 1): split auth.config.ts/auth.ts for edge compatibility, PrismaAdapter with JWT strategy, GitHub OAuth, /dashboard/* route protection via proxy.ts, Session.user.id type augmentation
- Auth Credentials - Email/Password Provider (Phase 2): Credentials provider placeholder in auth.config.ts overridden with real bcrypt + Prisma validation in auth.ts, zod schemas (signInSchema/registerSchema) in src/lib/validations/auth.ts, registration API route at /api/auth/register
