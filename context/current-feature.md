# Current Feature: Auth Credentials - Email/Password Provider

<!-- Feature Name -->

## Status

In Progress

## Goals

- Add Credentials provider for email/password authentication with registration
- Add password field to User model via migration (if not already there)
- Update `auth.config.ts` with Credentials provider placeholder (`authorize: () => null`)
- Update `auth.ts` to override Credentials provider with real bcrypt validation logic
- Create registration API route at `/api/auth/register` (name, email, password, confirmPassword)
  - Validate passwords match
  - Check if user already exists
  - Hash password with bcryptjs
  - Create user in database
  - Return success/error response
- Verify GitHub OAuth still works alongside the new Credentials provider

## Notes

- Use bcryptjs for hashing (already installed)
- Split-pattern approach: `auth.config.ts` gets a Credentials provider placeholder (`authorize: () => null`); `auth.ts` overrides it with actual bcrypt validation logic
- **Implementation done, awaiting manual test + build/lint verification:**
  - `passwordHash` field already existed on `User` from Phase 1's init migration — no new migration needed
  - Added `src/lib/validations/auth.ts` with `signInSchema` / `registerSchema` (zod)
  - `auth.config.ts`: added Credentials placeholder (`authorize: () => null`) alongside GitHub
  - `auth.ts`: overrides the placeholder — filters out the `id: "credentials"` provider from `authConfig.providers` and re-adds a real one doing zod validation + `prisma.user.findUnique` + `bcrypt.compare`
  - `src/app/api/auth/register/route.ts`: validates body with `registerSchema`, 409 if email taken, hashes with bcrypt (10 rounds), creates user, returns `{ success, data|error }`
- Testing plan:
  1. `curl -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d '{"name":"Test","email":"test@test.com","password":"password123","confirmPassword":"password123"}'`
  2. Go to `/api/auth/signin`
  3. Sign in with email/password
  4. Verify redirect to `/dashboard`
  5. Verify GitHub OAuth still works
- Reference: Credentials provider — https://authjs.dev/getting-started/authentication/credentials

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
