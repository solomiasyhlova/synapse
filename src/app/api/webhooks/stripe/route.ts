import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { getUserByStripeCustomerId, setUserSubscription } from "@/lib/db/billing";
import { getStripe } from "@/lib/stripe";

function subscriptionUpdate(subscription: Stripe.Subscription) {
  const isActive = subscription.status === "active" || subscription.status === "trialing";
  const item = subscription.items.data[0];

  if (!isActive) {
    return {
      isPro: false,
      stripeSubscriptionId: null,
      stripePriceId: null,
      stripeCurrentPeriodEnd: null,
    };
  }

  return {
    isPro: true,
    stripeSubscriptionId: subscription.id,
    stripePriceId: item?.price.id ?? null,
    stripeCurrentPeriodEnd: item ? new Date(item.current_period_end * 1000) : null,
  };
}

export async function POST(request: Request) {
  const stripe = getStripe();
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
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        await setUserSubscription(userId, {
          stripeCustomerId: session.customer as string,
          ...subscriptionUpdate(subscription),
        });
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const user = await getUserByStripeCustomerId(subscription.customer as string);
      if (user) {
        await setUserSubscription(user.id, subscriptionUpdate(subscription));
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
