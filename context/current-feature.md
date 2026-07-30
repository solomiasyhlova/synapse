# Current Feature

## Status

<!-- Not Started | In Progress | Complete -->

## Goals

<!-- Bullet points of what success looks like -->

## Notes

<!-- Additional context, constraints, or details from spec -->

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
- Rate Limiting for Auth: Upstash Redis + @upstash/ratelimit sliding-window utility (src/lib/rate-limit.ts, fails open if Upstash unconfigured/unavailable), applied to register (API route, 429 + Retry-After header) and to login/forgot-password/reset-password/resend-verification (Server Actions in src/actions/auth.ts, surfaced via existing success/error result pattern since Server Actions can't set HTTP status codes), fixed a pre-existing bug where SignInForm/ResendVerificationButton always showed "email sent" regardless of the action result
- Items List View: dynamic route /items/[type] (src/app/(app)/items/[type]/page.tsx) fetching items filtered by type via new getItemTypeByName/getItemsByType (src/lib/db/items.ts), responsive 2-col ItemCard grid (src/components/dashboard/ItemCard.tsx) reusing ItemRow's border-color+TypeIcon pattern, plural-to-singular slug mapping (src/lib/item-type-slug.ts), moved dashboard layout/page into a new (app) route group so /items/[type] shares the sidebar/topbar (no URL changes), fixed pre-existing Sidebar.tsx/ItemRow.tsx links that pointed at singular type names, added /items/* to proxy.ts's protected matcher
- Vitest Setup: vitest.config.ts (node environment, @/* alias, src/**/*.test.ts only so component tests aren't picked up), test/test:watch scripts in package.json, example unit test for src/lib/item-type-slug.ts as a pattern for future server-action/utility tests
- Three-Column Items Grid: added `lg:grid-cols-3` breakpoint to the items grid (src/app/(app)/items/[type]/page.tsx), keeping the existing 1/2-column responsive breakpoints below it; no ItemCard changes needed since it's already width-fluid
- Item Drawer: right-side shadcn Sheet opens on item click showing full detail (content, language, tags, collections, created/updated) fetched via new auth-checked `/api/items/[id]` route calling `getItemById` (src/lib/db/items.ts); `ItemDrawerProvider` context (src/components/dashboard/item-drawer-context.tsx) shared app-wide via the `(app)` layout so both the dashboard and `/items/[type]` pages open the same drawer instance; `ItemCard`/`ItemRow` converted from `<Link>` (to a `/items/[type]/[id]` route that never had a page) to buttons that open the drawer instead; action bar (Favorite/Pin/Copy/Edit/Delete) renders per the screenshot but only Copy is wired (clipboard) — Favorite/Pin/Edit/Delete have no mutations yet; unit tests for `getItemById` in src/lib/db/items.test.ts
