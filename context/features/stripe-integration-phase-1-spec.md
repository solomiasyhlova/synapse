# Stripe Integration Phase 1 - Core Infrastructure

## Overview

Lay the Stripe plumbing and fix the pre-existing `isPro` bug, without touching checkout, webhooks, or any UI. Everything here is testable without the Stripe CLI or a real Stripe account — Pro status is flipped by hand via Neon MCP `run_sql` on the `development` branch. Phase 2 builds checkout/webhooks/gating on top of this.

Full context and code samples: `docs/stripe-integration-plan.md`.

## Requirements

- Stripe SDK singleton, ready for Phase 2 to import
- DB helpers for reading/writing a user's billing fields
- `isPro` synced onto the JWT/session on every token refresh (today it never enters the token at all)
- Sidebar and MobileSidebar read real `session.user.isPro` instead of hardcoded mock data
- A standalone, pure `usage-limits` module encoding the free-tier rules (item limit, collection limit, pro-only types) with full unit test coverage — no Prisma/DB/session imports, so it's testable in isolation and reusable by Phase 2's gating

## Files to Create

1. `src/lib/stripe.ts` - Stripe SDK singleton + `STRIPE_PRICES` (monthly/yearly price IDs from env), mirrors `src/lib/prisma.ts`'s singleton pattern. Fetch the current `stripe` npm package's `apiVersion` string via context7 before pinning.
2. `src/lib/db/billing.ts` - `getUserBilling(userId)`, `getUserByStripeCustomerId(customerId)`, `setUserSubscription(userId, data)`, same shape as `src/lib/db/profile.ts`.
3. `src/lib/usage-limits.ts` (NEW module, not part of the original plan doc's `src/lib/constants.ts` suggestion — kept separate and dependency-free specifically so it's unit-testable):
   - `FREE_ITEM_LIMIT = 50`, `FREE_COLLECTION_LIMIT = 3`, `PRO_ONLY_TYPE_NAMES = ["file", "image"]`
   - `isProOnlyType(typeName: string): boolean`
   - `canCreateItem(isPro: boolean, currentItemCount: number, typeName: string): { allowed: boolean; reason?: string }`
   - `canCreateCollection(isPro: boolean, currentCollectionCount: number): { allowed: boolean; reason?: string }`
   - Pure functions only — no Prisma import, no `auth()` call. Phase 2 wires these into `createItem`/`createCollection`.
4. `src/lib/usage-limits.test.ts`:
   - `isProOnlyType`: true for `"file"`/`"image"`, false for `"snippet"`/`"prompt"`/`"command"`/`"note"`/`"link"`
   - `canCreateItem`: free user under limit (49) → allowed; free user at limit (50) → rejected with reason; pro user at/over 50 → allowed; free user under limit but pro-only type → rejected regardless of count; pro user + pro-only type → allowed
   - `canCreateCollection`: free user under limit (2) → allowed; free user at limit (3) → rejected with reason; pro user at/over 3 → allowed
   - Assert on both `allowed` and the presence/content of `reason` where rejected, since Phase 2's action layer surfaces `reason` directly to the user

## Files to Modify

- `package.json` - add `"stripe"` to dependencies (fetch latest version first; do **not** add `@stripe/stripe-js`, Phase 2's checkout/portal are server-redirect flows with no client-side Stripe.js).
- `src/auth.ts` - add a `jwt` callback that re-reads `isPro` from the DB (`prisma.user.findUnique` by `token.sub`) on every token refresh, and copies it into the session in the existing `session` callback. See plan doc §4.3 for the exact callback shape.
- `src/types/next-auth.d.ts` - add `isPro: boolean` to the `Session.user` augmentation (module `"next-auth"`) and `isPro?: boolean` to the `JWT` augmentation (module `"next-auth/jwt"`).
- `src/app/(app)/layout.tsx` - add `isPro: session.user.isPro` to the `user` object built at lines ~49-53 and passed to `Sidebar`/`MobileSidebar`.
- `src/components/dashboard/Sidebar.tsx` - remove `import { currentUser } from "@/lib/mock-data"`, read `isPro` from the existing `user` prop instead, replace both `currentUser.isPro` references (lock badges on file/image nav items, "Upgrade to Pro" card).
- `src/components/dashboard/MobileSidebar.tsx` - currently has no lock badge or upgrade card at all; add the same treatment as `Sidebar.tsx` using the `isPro` prop.
- `.env.example` - already has all five `STRIPE_*` vars stubbed (uncommitted working-tree change); no further edits needed here, but this phase's commit should include it since `src/lib/stripe.ts` now reads two of them.

## Key Gotchas

- The JWT won't pick up a DB-side `isPro` change on its own — there's no `trigger === "update"` call anywhere in the app, so the `jwt` callback must unconditionally re-fetch on every refresh, not just on sign-in.
- `usage-limits.ts` must stay framework-free (no Prisma types, no `next-auth` imports) — that's what makes it testable with plain Vitest, matching the "utilities only" testing convention in `coding-standards.md`.
- Don't wire `usage-limits.ts` into `createItem`/`createCollection` in this phase — that's explicitly Phase 2 (feature gating), since it needs live `isPro` + item/collection counts from the session and DB.

## Environment Variables

```
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_PRICE_ID_MONTHLY=
STRIPE_PRICE_ID_YEARLY=
```

`STRIPE_WEBHOOK_SECRET` is stubbed in `.env.example` already but unused until Phase 2.

## Testing

1. `npm run test` - `usage-limits.test.ts` covers every boundary case above.
2. `npm run build` - passes with the new `stripe` dependency and `isPro` type augmentations.
3. Via Neon MCP `run_sql` on the `development` branch (never `production`), flip a test user's `isPro` to `true`.
4. Reload any app page (no explicit sign-out/sign-in) - Sidebar/MobileSidebar should immediately reflect Pro (unlocked file/image types, no upgrade card). Confirms the `jwt` callback's DB sync works without a manual `update()` call.
5. Flip `isPro` back to `false` via Neon MCP, reload - lock badges and upgrade card return.

## References

- `docs/stripe-integration-plan.md` §1, §3 (env var pattern), §4.1-4.3 (schema note, `stripe.ts`/`db/billing.ts`/`auth.ts` code samples)
- `context/research/stripe-integration-research.md` - JWT sync rationale
- Auth.js `jwt`/`session` callbacks: https://authjs.dev/guides/extending-the-session
