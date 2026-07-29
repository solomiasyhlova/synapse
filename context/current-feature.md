# Current Feature: Email Verification Toggle

## Status

In Progress

## Goals

- Add an env-based flag (e.g. `EMAIL_VERIFICATION_ENABLED`) that can turn the email verification requirement on/off without a code change.
- When disabled:
  - Registration (`src/app/api/auth/register/route.ts`) skips creating a verification token and skips sending the email via Resend.
  - New users are treated as verified immediately (e.g. set `emailVerified` on creation, or bypass the check) so they can sign in right away.
  - `authorize()` in `src/auth.ts` does not throw `EmailNotVerifiedError` for unverified users.
  - UI tied to verification (`ResendVerificationButton`, any "check your email" messaging in `SignInForm`, `/verify-email` page) doesn't strand users.
- When enabled (default, current behavior): no change to existing flow.

## Notes

- Motivation: no domain is linked to Resend yet, so Resend can currently only send to the account's own verified email — blocks registering with arbitrary addresses. Need a way to disable verification until a domain is set up.
- User is open to alternatives to an env var if something else fits better, but env var is the default suggested approach.
- Relevant existing files: `src/lib/resend.ts`, `src/lib/auth/verification-token.ts`, `src/lib/auth/errors.ts`, `src/lib/email/send-verification-email.ts`, `src/app/api/auth/register/route.ts`, `src/auth.ts`, `src/app/verify-email/page.tsx`, `src/actions/auth.ts`, `src/components/auth/SignInForm.tsx`, `src/components/auth/ResendVerificationButton.tsx`.

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
- Email Verification on Register: Resend integration (src/lib/resend.ts), verification tokens reusing the Auth.js VerificationToken model (src/lib/auth/verification-token.ts), send-on-register (src/app/api/auth/register/route.ts), /verify-email page handling the link click, Credentials authorize() blocks unverified sign-in via custom EmailNotVerifiedError (src/lib/auth/errors.ts), resendVerificationEmail server action wired into SignInForm and a new ResendVerificationButton
