# Auth Security Review

**Last audited:** 2026-07-29

## Summary

Reviewed the credentials provider, registration + email verification, forgot/reset password, and
profile (change password / delete account) flows. Token generation, expiry enforcement, single-use
consumption, and password hashing are all implemented correctly. Found no auth-bypass or
token-forgery issues. The most impactful real findings are: (1) no rate limiting anywhere in the
app, which makes brute force and email-bombing trivial, and (2) JWT sessions are never invalidated
after a password change/reset, so a session obtained before the reset stays valid. One warning
around client-only confirmation on account deletion. Everything else is hardening-level.

## 🔴 Critical

None found. No auth bypass, token forgery, or account-takeover path was identified.

## 🟡 Warnings

- **File:** `src/actions/auth.ts` (all exported actions), `src/app/api/auth/register/route.ts`,
  `src/actions/profile.ts::changePassword`
- **Issue:** There is no rate limiting anywhere in the app (confirmed via repo-wide search — no
  middleware, no in-memory/Redis limiter, no Upstash/`@upstash/ratelimit` usage). This affects
  multiple endpoints simultaneously:
  - `signInWithCredentials` — unlimited password guesses against the bcrypt-backed credentials
    provider (brute force).
  - `resendVerificationEmail` and `requestPasswordReset` — both accept a raw, unauthenticated
    email address and unconditionally attempt to send mail. An attacker can call either action
    (or `POST /api/auth/register` repeatedly) in a loop with a victim's email to flood their inbox
    ("email bombing"), and can also run up the app's Resend usage/cost.
  - `POST /api/auth/register` — unlimited account-creation attempts, useful for automated
    enumeration (see below) or resource exhaustion.
- **Fix:** Add a rate limiter (e.g. Upstash Redis + `@upstash/ratelimit`, or an in-memory limiter
  keyed by IP/email with a short TTL, given Redis is already in the planned stack) in front of
  `signInWithCredentials`, `resendVerificationEmail`, `requestPasswordReset`, and the register route
  handler. Auth.js does not provide this out of the box, so it must be added at the application
  layer.

- **File:** `src/actions/auth.ts:110-139` (`resetPassword`), `src/actions/profile.ts:15-50`
  (`changePassword`), `src/auth.ts:12-14` (`session: { strategy: "jwt" }`)
- **Issue:** Sessions use the JWT strategy with no `jwt` callback that ties the token to a
  server-side value (e.g. a password-changed timestamp or token version). Neither
  `consumePasswordResetToken` (`src/lib/auth/password-reset-token.ts:39-64`) nor `changePassword`
  invalidates existing sessions — they only update `passwordHash` in the database. Concretely: if
  an attacker has an active session (stolen cookie, shared/compromised device, XSS) for a victim
  account, and the victim later changes their password via "Change password" or resets it via the
  "Forgot password" flow specifically *because* they suspect compromise, the attacker's existing
  JWT session cookie remains valid and fully authenticated until it naturally expires — the
  password change does not revoke it.
- **Fix:** On password change/reset, invalidate outstanding sessions. Options: switch to the
  database session strategy (`session: { strategy: "database" }`) so `prisma.session.deleteMany({
  where: { userId } })` can be called after `changePassword`/`consumePasswordResetToken`; or, if
  staying on JWT, add a `passwordChangedAt` field to `User`, stamp it on every password
  change/reset, and check it in the `jwt`/`session` callback, rejecting tokens issued before that
  timestamp.

- **File:** `src/actions/profile.ts:52-58` (`deleteAccount`), `src/components/profile/DeleteAccountDialog.tsx`
- **Issue:** `deleteAccount()` performs an irreversible, cascading delete of the user and all their
  data based solely on having a valid session — no password or re-authentication is required
  server-side. The "type `delete my account` to confirm" safeguard in
  `DeleteAccountDialog.tsx:19,68` is purely a client-side UI gate; the exported server action itself
  has no equivalent check. Anyone able to invoke the server action directly with a valid session
  (e.g. via dev tools, a malicious script on the page, or simply because the confirm text is
  trivially satisfiable) triggers immediate deletion with no further proof of intent.
- **Fix:** Require re-verification server-side before deleting — e.g. have `deleteAccount(password:
  string)` re-check `bcrypt.compare` against `passwordHash` for password accounts (mirroring
  `changePassword`), or at minimum pass and verify the confirmation string server-side so the
  safeguard can't be skipped by calling the action directly.

## 🟢 Suggestions

- **File:** `src/auth.ts:34-38`
- **Issue:** `authorize()` returns immediately (`return null`) when no user/passwordHash is found,
  skipping the `bcrypt.compare` call, but runs a full bcrypt comparison when the user *does* exist.
  This creates a measurable timing difference between "no such account" and "wrong password" that
  could theoretically be used for user enumeration via timing analysis.
- **Fix:** Run a dummy `bcrypt.compare` against a fixed placeholder hash when the user doesn't
  exist, so both paths take comparable time.

- **File:** `src/app/api/auth/register/route.ts:16-21`
- **Issue:** Registration returns a distinct 409 "A user with this email already exists" for
  already-registered emails, which allows enumerating registered accounts (unlike the
  forgot-password flow, which deliberately avoids this in `src/actions/auth.ts:93-98`). This is a
  common, generally-accepted tradeoff for registration UX, but worth a deliberate decision.
- **Fix:** If enumeration resistance is a priority, consider a generic response plus a
  "confirm your email" step, though this is a UX tradeoff rather than a must-fix.

- **File:** `src/lib/auth/verification-token.ts:25-47`, `src/app/verify-email/page.tsx:35`
- **Issue:** Email verification is consumed as a side effect of a plain `GET` page render
  (`consumeVerificationToken(token)` runs directly in the server component). Link-scanning proxies
  used by some corporate email/security gateways (e.g. Safe Links) prefetch URLs in emails, which
  would consume the single-use token before the real user clicks it, forcing them to request a new
  link. Not exploitable for account takeover (the underlying token security is fine), but a
  reliability/UX gap worth noting since it's easy to fix.
- **Fix:** Consider requiring an explicit user action (e.g. a "Confirm" button that POSTs) rather
  than consuming on GET, or accept the tradeoff as-is since impact is limited to needing a resend.

- **File:** `src/app/api/auth/register/route.ts:25`, `src/actions/profile.ts:39`,
  `src/lib/auth/password-reset-token.ts:60`
- **Issue:** `bcrypt.hash(password, 10)` uses a cost factor of 10 everywhere. This is an acceptable
  bcrypt default but on the lower end of current OWASP guidance (12+) for new applications.
- **Fix:** Consider bumping the cost factor to 12 (verify acceptable latency in your environment
  first).

- **File:** `src/lib/validations/auth.ts:24-32`
- **Issue:** `resetPasswordSchema`/`registerSchema`/`changePasswordSchema` only enforce a minimum
  length of 8 characters, no complexity or breached-password checks.
- **Fix:** Optional hardening — consider a max length guard (to bound bcrypt input cost) and/or a
  breached-password check (e.g. HaveIBeenPwned k-anonymity API) if stronger password policy is
  desired.

## ✅ Passed Checks

- **Password hashing:** bcrypt via `bcryptjs` is used consistently for storage and comparison —
  registration (`src/app/api/auth/register/route.ts:25`), sign-in (`src/auth.ts:37`), password
  reset (`src/lib/auth/password-reset-token.ts:60`), and change password
  (`src/actions/profile.ts:34,39`). No plaintext comparison or storage anywhere.
- **Token randomness:** Both email-verification and password-reset tokens use
  `crypto.randomBytes(32).toString("hex")` (`src/lib/auth/verification-token.ts:8`,
  `src/lib/auth/password-reset-token.ts:13`) — a CSPRNG, not `Math.random()` or anything
  predictable.
- **Token expiry enforced on use:** Both flows check `expires < new Date()` at consumption time,
  not just at creation — `src/lib/auth/verification-token.ts:39` and
  `src/lib/auth/password-reset-token.ts:31,55`.
- **Tokens are single-use:** Both `consumeVerificationToken` (`src/lib/auth/verification-token.ts:35-37`)
  and `consumePasswordResetToken` (`src/lib/auth/password-reset-token.ts:51-53`) delete the token
  row immediately after lookup, before returning a result, so a captured link/token cannot be
  replayed.
- **No namespace collision between verification and reset tokens:** Password-reset tokens are
  stored with a `"password-reset:"`-prefixed identifier
  (`src/lib/auth/password-reset-token.ts:10,15`) while verification tokens use the bare email as
  identifier. Verified this can't be spoofed by registering an email containing the prefix: Zod's
  `z.email()` (the "practical" regex used by this codebase's zod version) disallows `:` in the
  local part, so no email can collide with the `password-reset:` namespace.
- **Password reset does not leak account existence:** `requestPasswordReset`
  (`src/actions/auth.ts:89-108`) always returns `{ success: true }` regardless of whether the email
  exists, and only sends an email/creates a token when a `passwordHash` is present — GitHub-only
  accounts are silently skipped with no distinguishing response, and `checkPasswordResetToken`
  never reveals which case it was.
- **Profile actions are session-scoped, not client-trusted:** `changePassword` and `deleteAccount`
  both call `auth()` server-side and use `session.user.id` (never a client-supplied id) for the
  Prisma lookup/update/delete — `src/actions/profile.ts:21,29,53,56`. `ProfileStats`'s `userId` prop
  is likewise derived server-side from the session in `src/app/profile/page.tsx:21,43`, not from
  client input. No IDOR path found.
- **Change password requires current password:** `changePassword` verifies
  `bcrypt.compare(currentPassword, user.passwordHash)` before allowing a new password to be set,
  and rejects accounts with no `passwordHash` (GitHub-only) — `src/actions/profile.ts:30-37`.
- **Delete account is correctly scoped and matches schema cascades:** `prisma.user.delete({ where:
  { id: session.user.id } })` (`src/actions/profile.ts:56`) only ever targets the authenticated
  user's own row; `prisma/schema.prisma` has `onDelete: Cascade` on `Item`, `Collection`, `Tag`,
  `Account`, and `Session` relations to `User`, so deletion cleans up owned data as expected. (See
  the Warning above about the confirmation step being client-only.)
- **No secrets/hashes leak to the client or JWT:** Auth.js's default `jwt` callback (used here,
  since only a `session` callback is defined in `src/auth.ts:16-21`) builds the token from an
  explicit `{ name, email, picture, sub }` shape — it does not spread the full user object returned
  by `authorize()`, so `passwordHash` never ends up in the session cookie. `getProfileUser`
  (`src/lib/db/profile.ts:28-43`) also returns a hand-built object that omits `passwordHash`.
- **OAuth account linking is safe:** GitHub provider is used with default options (no
  `allowDangerousEmailAccountLinking`), so an attacker cannot take over an existing
  email/password account by signing in with GitHub using the same email.
- **Open redirect on `callbackUrl`:** `signInWithCredentials` passes a client-supplied
  `callbackUrl` straight to `redirectTo` (`src/actions/auth.ts:36-40`), but Auth.js's default
  `redirect` callback (no custom override present) restricts redirects to same-origin URLs, so this
  is not exploitable as an open redirect.
