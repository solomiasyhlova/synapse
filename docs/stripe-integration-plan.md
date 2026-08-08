# Stripe Subscription Integration Plan

DevStash Pro — $8/mo or $72/yr, gating file/image uploads, AI features, custom types, export, and free-tier item/collection limits (per [project-overview.md §9](../context/project-overview.md)).

This is a plan to build against. Nothing under "Files to create" exists yet. "Files to modify" lists exact call sites found in the current codebase.

---

## 1. Current State Analysis

### User model (`prisma/schema.prisma`)

Billing fields already exist and need **no migration** for the baseline flow:

```prisma
model User {
  // ...
  isPro                Boolean @default(false)
  stripeCustomerId     String? @unique
  stripeSubscriptionId String? @unique
}
```

An **optional enhancement** (see §4) adds two more columns to distinguish "canceled, but still paid through period end" from "actually expired" — the two existing fields can't express that on their own.

### Auth (Auth.js v5, JWT sessions)

- `src/auth.config.ts` — edge-safe config (GitHub + a `Credentials` stub with `authorize: () => null`), consumed by `src/proxy.ts` middleware.
- `src/auth.ts` — real config: `PrismaAdapter`, `session: { strategy: "jwt" }`, overrides the Credentials provider with real bcrypt/Prisma logic, and defines **one** callback:
  ```ts
  callbacks: {
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
  ```
  There is **no `jwt` callback today** — `token.sub` is populated by NextAuth's default behavior from the adapter user at sign-in. `isPro` never enters the token or session.
- `src/types/next-auth.d.ts` only augments `Session.user` with `id`. No `isPro`.

This matters because a Stripe webhook updates `User.isPro` in the database out-of-band from any request the signed-in browser makes — the JWT won't pick that up on its own. Per the brief in `context/research/stripe-integration-research.md`, the fix is a `jwt` callback that re-reads `isPro` from the DB on every session validation (cheap: one indexed `findUnique` by primary key), rather than relying on `trigger === "update"` (which requires the client to explicitly call `update()`, which nothing in this app does today).

### How user data reaches components

- Server Components call `auth()` directly (e.g. `src/app/settings/page.tsx:14`, `src/app/(app)/layout.tsx:28`) and pass a derived `user` object as props down to client components — there's no client-side `useSession()` anywhere in the app.
- `src/app/(app)/layout.tsx:49-53` builds the `user` object handed to `Sidebar`/`MobileSidebar` today:
  ```ts
  const user = {
    name: session.user.name ?? "Unknown user",
    email: session.user.email ?? "",
    image: session.user.image,
  };
  ```
  **No `isPro` field.** Confirmed by grep: `src/components/dashboard/Sidebar.tsx` imports `currentUser` from `src/lib/mock-data.ts` (hardcoded `isPro: false`) instead of reading real session data — this is a pre-existing bug, not by design. It drives the "PRO" lock badges on file/image nav items (`Sidebar.tsx:119`) and the "Upgrade to Pro" sidebar card (`Sidebar.tsx:229`). `MobileSidebar.tsx` doesn't reference `isPro`/`currentUser` at all — it has no lock indicator or upgrade prompt on mobile today. Both need fixing as part of this work, since the whole point of wiring Stripe is for these to reflect a real subscription.

### Existing subscription/payment code

None. `grep -r "stripe"` across `src/` only matches Prisma-generated model files (the `isPro`/`stripeCustomerId`/`stripeSubscriptionId` columns). `package.json` has no `stripe` dependency. `.env.example` already has the five Stripe variables stubbed in (currently an **uncommitted** working-tree change — `git status` shows `M .env.example`), but nothing reads them yet.

---

## 2. Feature Gating Analysis

**Nothing is enforced server-side today.** This matches project-overview.md §9's explicit instruction to feature-flag everything during development — but it means every gate below is new work, not a bug fix (aside from the Sidebar mock-data issue above).

| Gate | Free limit | Where it would need to live | Current state |
|---|---|---|---|
| Item count | 50 total | `createItem` (`src/actions/items.ts` → `src/lib/db/items.ts`) | Unchecked — `createItem` writes unconditionally |
| Collection count | 3 | `createCollection` (`src/actions/collections.ts` → `src/lib/db/collections.ts`) | Unchecked |
| File/Image item types | Pro only | `createItemSchema` (`src/lib/validations/items.ts`) allows `"file"`/`"image"` in `CREATABLE_TYPE_NAMES` for anyone; `CreateItemDialog.tsx` has zero `isPro` references | Unchecked — any free user can create file/image items today via the UI or by calling the action directly |
| AI features (auto-tag, summaries, explain, prompt optimizer) | Pro only | N/A | Not built yet — out of scope for this plan, note as future gate |
| Custom item types | Pro only | N/A | Not built yet ("later" per §9) — out of scope |
| Export (JSON/ZIP) | Pro only | N/A | Not built yet — out of scope |

Recommended enforcement point: the **query layer** (`src/lib/db/items.ts` / `collections.ts`), not the Zod schema — schemas don't have access to `isPro` or live counts, and the query layer is already where `createItem`/`createCollection` do their one Prisma round-trip. Return `null` (existing "not found/denied" convention used by `updateItem`/`deleteItem`) or a new typed rejection reason the action layer turns into a user-facing error string, matching the `{ success, data, error }` pattern from `coding-standards.md`.

### Settings page structure

`src/app/settings/page.tsx` is a stacked-`Card` layout (`Account`, `Editor Preferences`), each card populated by a small server-fetched slice (`getProfileUser`, `getEditorPreferences`) and a client dialog/form for mutations. `/billing` (already reserved in the routing map, project-overview.md §7, but not yet built) should follow the exact same shape: a new protected page, its own `Card`, a small `getUserBilling` query, and client components for the mutating parts (checkout / manage-subscription buttons). Simplest to make it its own route (as spec'd) rather than a card bolted onto `/settings`, since checkout/portal are redirect flows, not inline forms.

---

## 3. API & Webhook Patterns

### Route handlers vs. Server Actions

`coding-standards.md` is explicit: Server Actions for "form submissions and simple mutations," API routes for "webhooks," "specific HTTP status codes," etc. The existing API routes (`src/app/api/upload/route.ts`, `src/app/api/items/[id]/route.ts`, `src/app/api/items/[id]/download/route.ts`) all follow the same shape:

```ts
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  // ...
}
```

Only the **webhook** needs a route handler (Stripe requires the raw request body for signature verification, which Server Actions can't expose). Starting checkout and opening the billing portal are both "redirect the user to a URL," which fits Server Actions cleanly — call `redirect()` (Next.js throws `NEXT_REDIRECT` internally) instead of returning `{ url }` for the client to navigate to manually.

### Server Action error pattern

Every existing action (`src/actions/items.ts`, `collections.ts`, `settings.ts`, `auth.ts`) follows:
```ts
try {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Not signed in" };
  const validData = await someSchema.parseAsync(data);
  // ... one query-layer call ...
  return { success: true, data };
} catch (error) {
  if (error instanceof ZodError) return { success: false, error: error.issues[0]?.message ?? "Invalid input" };
  console.error("Failed to X:", error);
  return { success: false, error: "Something went wrong. Please try again." };
}
```
Billing actions should match this, with one difference: on success they `redirect()` rather than return `data` (redirect must be called outside the `try/catch`, since Next.js's redirect mechanism throws — catching it would swallow the redirect).

### Environment variable pattern

`.env.example` groups vars by service with a comment header (`# CLOUDFLARE R2 STORAGE`, `# Stripe`) and every var is read via `process.env.X` directly at the point of use (no central env schema/validation layer exists in this codebase — `src/lib/r2.ts:3-11` and `src/lib/resend.ts` both read `process.env` inline). Follow that pattern for `src/lib/stripe.ts` rather than introducing a new validation layer.

---

## 4. Deliverable

### 4.1 Optional schema enhancement (recommended, needs a migration)

The existing `isPro` boolean can't distinguish "subscription canceled, still entitled until period end" from "actually lapsed" — a `customer.subscription.updated` event with `cancel_at_period_end: true` should **not** immediately flip `isPro` to `false`. Recommend adding:

```prisma
model User {
  // ... existing fields ...
  stripePriceId          String?   // which price (monthly/yearly) they're on
  stripeCurrentPeriodEnd DateTime? // used to keep isPro true through a canceled-but-paid period
}
```

Run via `npm run db:migrate` (dev branch) per `coding-standards.md` — **never** `db push`. If you'd rather ship the simplest possible version first, skip this and treat `isPro` as the sole source of truth (webhook sets it directly off subscription status); the "canceled but still paid" nuance can be a fast-follow.

### 4.2 Files to create

**`src/lib/stripe.ts`** — Stripe SDK singleton, mirrors `src/lib/prisma.ts`'s pattern:
```ts
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2025-XX-XX.XXX", // pin to whatever `stripe` package version resolves
});

export const STRIPE_PRICES = {
  monthly: process.env.STRIPE_PRICE_ID_MONTHLY ?? "",
  yearly: process.env.STRIPE_PRICE_ID_YEARLY ?? "",
} as const;

export type BillingInterval = keyof typeof STRIPE_PRICES;
```
*(Fetch the current `stripe` npm package's exact `apiVersion` string via context7/Stripe docs before pinning — don't guess a version.)*

**`src/lib/db/billing.ts`** — Prisma helpers, same shape as `src/lib/db/profile.ts`:
```ts
import { prisma } from "@/lib/prisma";

export interface UserBilling {
  isPro: boolean;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
}

export async function getUserBilling(userId: string): Promise<UserBilling | null> {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { isPro: true, stripeCustomerId: true, stripeSubscriptionId: true },
  });
}

export async function getUserByStripeCustomerId(customerId: string) {
  return prisma.user.findUnique({ where: { stripeCustomerId: customerId } });
}

export async function setUserSubscription(
  userId: string,
  data: { isPro: boolean; stripeCustomerId?: string; stripeSubscriptionId?: string | null },
) {
  return prisma.user.update({ where: { id: userId }, data });
}
```

**`src/actions/billing.ts`** — Server Actions, `"use server"`, following the `try/catch` convention from §3:
```ts
"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getUserBilling } from "@/lib/db/billing";
import { prisma } from "@/lib/prisma";
import { stripe, STRIPE_PRICES, type BillingInterval } from "@/lib/stripe";

export async function createCheckoutSession(interval: BillingInterval) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Not signed in" };

  const billing = await getUserBilling(session.user.id);
  if (!billing) return { success: false, error: "User not found" };

  let customerId = billing.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.user.email ?? undefined,
      metadata: { userId: session.user.id },
    });
    customerId = customer.id;
    await prisma.user.update({
      where: { id: session.user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: STRIPE_PRICES[interval], quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
    metadata: { userId: session.user.id },
  });

  if (!checkoutSession.url) return { success: false, error: "Could not start checkout" };
  redirect(checkoutSession.url);
}

export async function createPortalSession() {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Not signed in" };

  const billing = await getUserBilling(session.user.id);
  if (!billing?.stripeCustomerId) return { success: false, error: "No billing account found" };

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: billing.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
  });

  redirect(portalSession.url);
}
```
Note: `redirect()` throws, so nothing here needs a `try/catch` around the redirect calls themselves — only the Stripe API calls preceding them are worth wrapping if you want a friendlier error than an unhandled rejection; keep it consistent with existing actions by wrapping the whole body and letting `redirect`'s special `NEXT_REDIRECT` error propagate (Next.js's own machinery re-throws it — don't catch-and-swallow with a generic `catch`, or use a `try/finally` with no catch for the redirect-only path).

**`src/app/api/webhooks/stripe/route.ts`** — the one true route handler:
```ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { getUserByStripeCustomerId, setUserSubscription } from "@/lib/db/billing";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET ?? "");
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      if (userId && session.customer && session.subscription) {
        await setUserSubscription(userId, {
          isPro: true,
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
        });
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const user = await getUserByStripeCustomerId(subscription.customer as string);
      if (user) {
        const isActive = subscription.status === "active" || subscription.status === "trialing";
        await setUserSubscription(user.id, {
          isPro: isActive,
          stripeSubscriptionId: isActive ? subscription.id : null,
        });
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
```
This route must be excluded from any body-parsing middleware (Next.js route handlers get the raw `Request` by default, so no config needed here — unlike the old Pages API `bodyParser: false` requirement).

**`src/app/billing/page.tsx`** — protected page, mirrors `src/app/settings/page.tsx`'s `auth()` + redirect + `Card` shape:
```tsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlanCard } from "@/components/billing/PlanCard";
import { getUserBilling } from "@/lib/db/billing";

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const billing = await getUserBilling(session.user.id);
  if (!billing) redirect("/sign-in");

  return (
    <div className="flex min-h-full flex-1 justify-center overflow-y-auto p-6">
      <div className="w-full max-w-sm space-y-4">
        <Card>
          <CardHeader><CardTitle className="text-xl">Billing</CardTitle></CardHeader>
        </Card>
        <PlanCard isPro={billing.isPro} />
      </div>
    </div>
  );
}
```

**`src/components/billing/PlanCard.tsx`** — client component, checkout/portal buttons calling the Server Actions above (reuses the existing monthly/yearly toggle pattern already built for the homepage — `src/components/homepage/PricingToggle.tsx` — rather than inventing a new one).

### 4.3 Files to modify

- **`package.json`** — add `"stripe": "^<latest>"` to `dependencies` (fetch the current version before pinning; don't add `@stripe/stripe-js` — Checkout/Portal are both server-redirect flows here, no client-side Stripe.js needed).
- **`src/auth.ts`** — add a `jwt` callback per the research brief's workaround, syncing `isPro` from the DB on every token refresh, and copy it into the session:
  ```ts
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.sub = user.id;
      if (token.sub) {
        const dbUser = await prisma.user.findUnique({ where: { id: token.sub }, select: { isPro: true } });
        token.isPro = dbUser?.isPro ?? false;
      }
      return token;
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      if (typeof token.isPro === "boolean") session.user.isPro = token.isPro;
      return session;
    },
  },
  ```
- **`src/types/next-auth.d.ts`** — add `isPro: boolean` to both the `Session.user` and `JWT` augmentations (the `JWT` interface lives in the `"next-auth/jwt"` module, not `"next-auth"`):
  ```ts
  declare module "next-auth" {
    interface Session {
      user: { id: string; isPro: boolean } & DefaultSession["user"];
    }
  }
  declare module "next-auth/jwt" {
    interface JWT {
      isPro?: boolean;
    }
  }
  ```
- **`src/app/(app)/layout.tsx:49-53`** — add `isPro: session.user.isPro` to the `user` object passed to `Sidebar`/`MobileSidebar`.
- **`src/components/dashboard/Sidebar.tsx`** — remove `import { currentUser } from "@/lib/mock-data"`, accept `isPro` via the existing `user` prop instead, replace both `currentUser.isPro` references (lines 119, 229) with `user.isPro`.
- **`src/components/dashboard/MobileSidebar.tsx`** — same lock-badge + upgrade-card treatment as `Sidebar.tsx`, currently entirely missing; add `isPro` to whatever prop it already receives for `user`.
- **`src/lib/constants.ts`** — add:
  ```ts
  export const FREE_ITEM_LIMIT = 50;
  export const FREE_COLLECTION_LIMIT = 3;
  export const PRO_ONLY_TYPE_NAMES = ["file", "image"];
  ```
- **`src/lib/db/items.ts`** (`createItem`) — before the `prisma.item.create` call, check `PRO_ONLY_TYPE_NAMES.includes(typeName)` and item count against `FREE_ITEM_LIMIT` for non-Pro users (needs `isPro` passed in from the action, which gets it from `session.user.isPro`); return `null` on rejection, matching the existing "type not found" `null`-return convention, or introduce a small discriminated result if the caller needs to distinguish "at limit" from "pro required" for a specific toast message.
- **`src/actions/items.ts`** (`createItem`) — pass `session.user.isPro` through to the query layer; surface the query's rejection as a specific error string ("You've hit the free plan's 50-item limit — upgrade to Pro for unlimited items." / "File and image uploads are a Pro feature.").
- **`src/lib/db/collections.ts`** (`createCollection`) + **`src/actions/collections.ts`** — same pattern for the 3-collection free limit.
- **`src/proxy.ts`** — add `"/billing"` to the `matcher` array (every other protected top-level route is listed there; `/billing` is currently missing since the page doesn't exist yet).
- **`.env.example`** — already done (uncommitted `M .env.example` in the working tree adds all five `STRIPE_*` vars); nothing further needed here.

---

## 5. Stripe Dashboard Setup Steps

1. Create a Stripe account (or use an existing one) in **test mode**.
2. **Products & Prices**: create one product ("DevStash Pro") with two recurring prices — `$8.00/month` and `$72.00/year`. Copy both price IDs into `STRIPE_PRICE_ID_MONTHLY` / `STRIPE_PRICE_ID_YEARLY`.
3. **API keys**: copy the test **Secret key** → `STRIPE_SECRET_KEY`, **Publishable key** → `STRIPE_PUBLISHABLE_KEY` (kept for parity with `.env.example` / future client-side use, even though this plan's Checkout/Portal flow doesn't require it yet).
4. **Customer Portal**: enable it (Dashboard → Settings → Billing → Customer portal) and configure allowed actions (cancel subscription, update payment method, switch monthly ↔ yearly).
5. **Webhook endpoint**: add `https://<your-domain>/api/webhooks/stripe` listening for `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`. Copy the **Signing secret** → `STRIPE_WEBHOOK_SECRET`.
6. For local dev, use the Stripe CLI instead of a public webhook URL: `stripe listen --forward-to localhost:3000/api/webhooks/stripe` — this prints a local-only signing secret to use in `.env` while developing.

---

## 6. Testing Checklist

- [ ] `npm run test` and `npm run build` both pass after adding the `stripe` dependency and new files.
- [ ] `npm run db:migrate` applied cleanly on the `development` Neon branch if the optional schema enhancement (§4.1) is included; `npm run db:status` shows no drift.
- [ ] Sign in as a free user → `/billing` shows "Upgrade" with monthly/yearly toggle; Sidebar shows locked file/image types + upgrade card (now reading real `session.user.isPro`, not mock data).
- [ ] Click "Upgrade" (monthly) → redirected to Stripe Checkout → pay with test card `4242 4242 4242 4242` → redirected back to `/billing?success=true`.
- [ ] `stripe listen` shows `checkout.session.completed` delivered and 200'd; `User.isPro`/`stripeCustomerId`/`stripeSubscriptionId` updated in the `development` Neon branch (check via Neon MCP `run_sql` — never against `production`).
- [ ] Reload any app page (no explicit `signOut`/`signIn`) → Sidebar immediately reflects Pro (confirms the `jwt` callback's DB sync actually works without a manual `update()` call).
- [ ] As the now-Pro user: create a file and an image item successfully; create a 51st item and a 4th collection successfully (limits lifted).
- [ ] Open the Customer Portal from `/billing`, cancel the subscription. `stripe trigger customer.subscription.updated` (with `cancel_at_period_end: true`, if the optional §4.1 fields are in place) — confirm `isPro` stays `true` until period end, not immediately.
- [ ] `stripe trigger customer.subscription.deleted` → `isPro` flips to `false`; Sidebar re-locks file/image; creating a new file/image item is rejected with the Pro-required error message.
- [ ] As a free user again: attempt to create a 51st item and a 4th collection → rejected with the limit-reached error message; attempt to create a file item directly via the `createItem` server action (bypassing the UI) → still rejected (confirms the gate is server-side, not just hidden in the dialog).
- [ ] Webhook signature check: POST to `/api/webhooks/stripe` with a garbage/missing `stripe-signature` header → 400, no DB write.
- [ ] Two browser sessions (or incognito) signed in as two different users, both starting checkout — confirm no cross-user Stripe customer collisions (each gets/reuses their own `stripeCustomerId`).

---

## 7. Implementation Order

1. `npm install stripe`; add `.env` values from a Stripe test-mode dashboard (locally — `.env.example` is already updated).
2. (Optional) Prisma migration for `stripePriceId`/`stripeCurrentPeriodEnd` on the `development` Neon branch — decide up front whether to include this, since it changes the shape of `setUserSubscription`/the webhook handler below.
3. `src/lib/stripe.ts`, `src/lib/db/billing.ts` — no UI dependency, testable in isolation.
4. `src/app/api/webhooks/stripe/route.ts` — verify with `stripe trigger` events before wiring any UI to it.
5. `src/auth.ts` `jwt` callback + `src/types/next-auth.d.ts` — verify `session.user.isPro` is populated (e.g. temporarily log it) before touching the Sidebar.
6. Fix `src/app/(app)/layout.tsx`, `Sidebar.tsx`, `MobileSidebar.tsx` to use real `isPro` — this alone is a visible, testable bug fix even before Checkout exists (flip `isPro` by hand via Neon MCP `run_sql` on the `development` branch to confirm the UI reacts correctly).
7. `src/actions/billing.ts` + `/billing` page + `PlanCard.tsx` — wire up Checkout and Portal redirects end-to-end against Stripe test mode.
8. `src/lib/constants.ts` limits + `createItem`/`createCollection` gating in the query and action layers.
9. `src/proxy.ts` matcher update for `/billing`.
10. Full pass through the Testing Checklist (§6) before commit, per `context/ai-interaction.md`'s workflow (build + tests must pass before asking to commit).
