# Stripe Integration Phase 2 - Integration & UI

## Overview

Builds the real subscription flow on top of Phase 1's plumbing: the webhook that keeps `isPro` in sync with Stripe, Checkout/Portal Server Actions, the `/billing` page, and server-side enforcement of the free-tier limits using Phase 1's `usage-limits.ts`. Requires **Phase 1 merged first**, plus a Stripe test-mode account and the Stripe CLI running locally (`stripe listen`) for webhook testing — nothing here is fully testable without it.

Full context and code samples: `docs/stripe-integration-plan.md`.

## Requirements

- Stripe webhook route handling `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, verified via signature
- Checkout and Billing Portal Server Actions that redirect the user to Stripe-hosted pages
- `/billing` page showing current plan + upgrade (monthly/yearly toggle) or manage-subscription entry point
- `createItem`/`createCollection` reject over-limit or Pro-only requests server-side, using Phase 1's `usage-limits.ts` (`canCreateItem`, `canCreateCollection`, `isProOnlyType`) — not duplicated logic
- Gate must hold even when the Server Action is called directly (not just hidden in the UI)

## Stripe Dashboard Setup (prerequisite, one-time, manual)

1. Stripe account in **test mode**.
2. One product ("DevStash Pro") with two recurring prices: $8.00/month, $72.00/year. Copy both price IDs into `STRIPE_PRICE_ID_MONTHLY`/`STRIPE_PRICE_ID_YEARLY`.
3. Copy test **Secret key** → `STRIPE_SECRET_KEY`, **Publishable key** → `STRIPE_PUBLISHABLE_KEY`.
4. Enable the **Customer Portal** (Settings → Billing → Customer portal); allow cancel, payment method update, monthly ↔ yearly switch.
5. Local dev webhook: `stripe listen --forward-to localhost:3000/api/webhooks/stripe` - copy the printed signing secret into `STRIPE_WEBHOOK_SECRET`. (A public webhook endpoint + dashboard-issued secret is only needed for a deployed environment.)

## Files to Create

1. `src/app/api/webhooks/stripe/route.ts` - the one true route handler (Server Actions can't expose the raw body Stripe signature verification needs). Verifies `stripe-signature`, dispatches on `event.type`, calls `setUserSubscription`/`getUserByStripeCustomerId` from Phase 1's `src/lib/db/billing.ts`. Missing/invalid signature → 400, no DB write.
2. `src/actions/billing.ts` - `createCheckoutSession(interval)` and `createPortalSession()`. Creates a Stripe customer on first checkout if `stripeCustomerId` is null and persists it. Both `redirect()` on success rather than returning `{ url }` (Server Action redirect convention). Follows the existing try/catch action pattern, but `redirect()`'s `NEXT_REDIRECT` throw must propagate uncaught.
3. `src/app/billing/page.tsx` - protected page (`auth()` + redirect, same shape as `src/app/settings/page.tsx`), fetches `getUserBilling` from Phase 1, renders `PlanCard`.
4. `src/components/billing/PlanCard.tsx` - client component with the checkout/portal buttons. Reuses the existing monthly/yearly toggle pattern from `src/components/homepage/PricingToggle.tsx` rather than building a new one.

## Files to Modify

- `src/lib/db/items.ts` (`createItem`) - before the `prisma.item.create` call, call `canCreateItem`/`isProOnlyType` from `src/lib/usage-limits.ts` with the caller's `isPro` + current item count + type name; return `null` on rejection (existing "not found/denied" convention) or thread the `reason` string through if the caller needs the specific message.
- `src/actions/items.ts` (`createItem`) - pass `session.user.isPro` (now populated by Phase 1's jwt callback) and a fresh item count into the query layer; surface the rejection as a specific error string (limit reached vs. Pro-only type need different copy).
- `src/lib/db/collections.ts` (`createCollection`) - same pattern via `canCreateCollection`.
- `src/actions/collections.ts` (`createCollection`) - same pattern.
- `src/proxy.ts` - add `"/billing"` to the protected route `matcher` array (currently missing since the page doesn't exist yet).
- `prisma/schema.prisma` - **optional**: `stripePriceId String?` and `stripeCurrentPeriodEnd DateTime?` on `User`, only if implementing the "canceled but still paid through period end" nuance (see plan doc §4.1). Decide before starting this phase, since it changes `setUserSubscription`'s signature and the webhook handler's `customer.subscription.updated` branch. If skipped, `isPro` is set directly off `subscription.status` and cancellation is immediate. Run via `npm run db:migrate` on the `development` branch if included — never `db push`.

## Key Gotchas

- Only the webhook route is a route handler; checkout/portal are Server Actions per `coding-standards.md` (both are "redirect to a URL" flows).
- The webhook must be reachable at `/api/webhooks/stripe` with no auth check — Stripe calls it directly, not a signed-in browser. Signature verification via `STRIPE_WEBHOOK_SECRET` is the only guard.
- `canCreateItem`/`canCreateCollection` need a live count, not just `isPro` — call them with a fresh Prisma count in the query layer, don't cache counts across requests.
- Enforce in the query layer (`src/lib/db/items.ts`/`collections.ts`), not in the Zod schema — schemas have no access to `isPro` or live counts.

## Testing

Requires `stripe listen --forward-to localhost:3000/api/webhooks/stripe` running throughout.

1. `npm run test` and `npm run build` pass.
2. If the optional schema change was included: `npm run db:migrate` applied cleanly on `development`, `npm run db:status` shows no drift.
3. Sign in as a free user → `/billing` shows "Upgrade" with monthly/yearly toggle.
4. Click "Upgrade" (monthly) → Stripe Checkout → pay with test card `4242 4242 4242 4242` → redirected back to `/billing?success=true`.
5. `stripe listen` output shows `checkout.session.completed` delivered and 200'd; confirm via Neon MCP `run_sql` on `development` that `isPro`/`stripeCustomerId`/`stripeSubscriptionId` updated.
6. Reload any app page (no manual sign-out/in) → Sidebar reflects Pro immediately (Phase 1's jwt sync + this phase's webhook working together).
7. As the now-Pro user: create a file item, an image item, a 51st item, and a 4th collection — all succeed (limits lifted).
8. Open Customer Portal from `/billing`, cancel the subscription. `stripe trigger customer.subscription.updated` (with `cancel_at_period_end: true` if the optional fields are in place) — confirm `isPro` stays `true` until period end, not immediately.
9. `stripe trigger customer.subscription.deleted` → `isPro` flips `false`; Sidebar re-locks file/image; creating a new file/image item is rejected with the Pro-required message.
10. As a free user again: 51st item and 4th collection rejected with the limit-reached message; call the `createItem` Server Action directly (bypassing the UI) for a file item → still rejected (confirms server-side, not just hidden in the dialog).
11. POST to `/api/webhooks/stripe` with a garbage/missing `stripe-signature` header → 400, no DB write.
12. Two browser sessions as two different users, both starting checkout — confirm no cross-user Stripe customer collisions (each gets/reuses their own `stripeCustomerId`).

## References

- `docs/stripe-integration-plan.md` §2 (feature gating table), §3 (webhook/action code samples), §5 (dashboard setup), §6 (full testing checklist), §7 (implementation order)
- [stripe-integration-phase-1-spec.md](stripe-integration-phase-1-spec.md) - `usage-limits.ts`, `isPro` session wiring this phase depends on
- Stripe webhooks: https://docs.stripe.com/webhooks
- Stripe Checkout: https://docs.stripe.com/checkout/quickstart
