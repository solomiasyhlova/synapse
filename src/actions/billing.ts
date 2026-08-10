"use server";

import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getUserBilling } from "@/lib/db/billing";
import { prisma } from "@/lib/prisma";
import { getStripe, STRIPE_PRICES, type BillingInterval } from "@/lib/stripe";

interface ActionError {
  success: false;
  error: string;
}

export async function createCheckoutSession(interval: BillingInterval): Promise<ActionError | void> {
  let checkoutUrl: string;

  try {
    const stripe = getStripe();
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
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
      metadata: { userId: session.user.id },
    });

    if (!checkoutSession.url) return { success: false, error: "Could not start checkout" };
    checkoutUrl = checkoutSession.url;
  } catch (error) {
    console.error("Failed to create checkout session:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }

  redirect(checkoutUrl);
}

export async function createPortalSession(): Promise<ActionError | void> {
  let portalUrl: string;

  try {
    const stripe = getStripe();
    const session = await auth();
    if (!session?.user) return { success: false, error: "Not signed in" };

    const billing = await getUserBilling(session.user.id);
    if (!billing?.stripeCustomerId) return { success: false, error: "No billing account found" };

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: billing.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
    });

    portalUrl = portalSession.url;
  } catch (error) {
    console.error("Failed to create portal session:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }

  redirect(portalUrl);
}
