import Stripe from "stripe";

// Constructing a Stripe client throws immediately if the key is empty, which would crash
// `next build` at import time (Next evaluates route modules while collecting page data,
// even for routes that never execute). Deferring construction to first use means the build
// only fails for real once a webhook/checkout request actually needs Stripe.
let stripeClient: Stripe | undefined;

export function getStripe(): Stripe {
  stripeClient ??= new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
    apiVersion: "2026-07-29.dahlia",
  });
  return stripeClient;
}

export const STRIPE_PRICES = {
  monthly: process.env.STRIPE_PRICE_ID_MONTHLY ?? "",
  yearly: process.env.STRIPE_PRICE_ID_YEARLY ?? "",
} as const;

export type BillingInterval = keyof typeof STRIPE_PRICES;
