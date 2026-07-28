# Current Feature: Email Verification on Register

## Status

In Progress

## Goals

- New users who register with email/password receive a verification email (via Resend) containing a link
- Clicking the link verifies the user's email (sets `User.emailVerified`)
- Unverified users are prevented from signing in / are prompted to verify, until they click the link
- Users can request the verification email be resent

## Notes

- Email provider is **Resend**. `RESEND_API_KEY` already exists in `.env`, but the `resend` npm package is not yet installed.
- `User.emailVerified DateTime?` already exists on the Prisma schema and is currently unused.
- The `VerificationToken` model (`identifier`, `token`, `expires`, `@@unique([identifier, token])`) already exists (standard Auth.js model) and can likely be reused for verification tokens instead of adding a new model.
- Registration currently happens in `src/app/api/auth/register/route.ts` — creates the user with `passwordHash`, no email is sent today.
- Credentials `authorize()` in `src/auth.ts` currently does not check `emailVerified` — need to decide whether/how unverified users are blocked at sign-in.
- Will need a new route/page to handle the verification link click (e.g. `/api/auth/verify` or `/verify-email?token=...`).
- Any schema changes (if the `VerificationToken` model needs adjustment) must go through `prisma migrate dev`, never `db push`, per project rules.

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
- Auth UI - Sign In, Register & Sign Out (Phase 3): custom /sign-in and /register pages replacing NextAuth defaults (pages.signIn, proxy callbackUrl preserved), signInWithCredentials/signInWithGitHub/signOutAction server actions, sidebar UserMenu/UserAvatar reflecting real session (avatar with initials fallback, name, email), dropdown-menu and toast base-ui primitives added, minimal /profile page, registration success toast
