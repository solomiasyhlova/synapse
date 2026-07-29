# Current Feature: Rate Limiting for Auth

## Status

In Progress

## Goals

- Add rate limiting to auth-related API routes to prevent brute force, credential stuffing, and abuse of email-sending endpoints
- Use Upstash Redis with `@upstash/ratelimit` (sliding window algorithm) for serverless-compatible limiting
- Create a reusable rate limiting utility at `src/lib/rate-limit.ts`
- Protect these endpoints:
  - `/api/auth/callback/credentials` (login) — 5 attempts / 15 min, keyed by IP + email
  - `/api/auth/register` — 3 attempts / 1 hour, keyed by IP
  - `/api/auth/forgot-password` — 3 attempts / 1 hour, keyed by IP
  - `/api/auth/reset-password` — 5 attempts / 15 min, keyed by IP
  - `/api/auth/resend-verification` — 3 attempts / 15 min, keyed by IP + email
- Return 429 Too Many Requests with `{ error: "Too many attempts. Please try again in X minutes." }` and a `Retry-After` header
- Display user-friendly rate limit errors on the frontend via toast

## Notes

- Extract IP from `x-forwarded-for` header (Vercel) or request
- Combine IP + identifier (email) where applicable for tighter limits
- Rate limit checks should return `{ success, remaining, reset }`
- Env vars needed: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- Upstash free tier allows 10k requests/day (sufficient for auth limiting)
- Rate limiting should fail open (allow request) if Upstash is unavailable
- Login limiting is tricky with NextAuth credentials — may need a custom sign-in handler since `/api/auth/callback/credentials` is handled internally by NextAuth
- Consider rate limiting middleware for a cleaner implementation later
- Source spec: `context/features/rate-limiting-spec.md`

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
- Email Verification Toggle: EMAIL_VERIFICATION_ENABLED env flag (src/lib/auth/email-verification.ts, default enabled, "false" disables) — register route skips token/email and marks users verified immediately, auth.ts authorize() skips the unverified check, RegisterForm and /verify-email route around it so no UI dead-ends when disabled
- Forgot Password: /forgot-password and /reset-password pages, requestPasswordReset/resetPassword server actions (src/actions/auth.ts), password reset tokens reuse the VerificationToken model via a namespaced identifier (src/lib/auth/password-reset-token.ts) to avoid colliding with email-verification tokens, sendPasswordResetEmail via Resend (src/lib/email/send-password-reset-email.ts), 1-hour token TTL, GitHub-only accounts silently skipped (no passwordHash), "Forgot password?" link added to SignInForm, also fixed a pre-existing Base UI nativeButton warning on Button+Link usages across auth pages
- Profile Page: expanded /profile with real per-user data (src/lib/db/profile.ts using session.user.id instead of the demo-user pattern) — member-since date, usage stats and item-type breakdown (ProfileStats.tsx), ChangePasswordDialog (email/password accounts only, gated on passwordHash) and DeleteAccountDialog (type-to-confirm, cascading delete) via src/actions/profile.ts, changePasswordSchema added to src/lib/validations/auth.ts
