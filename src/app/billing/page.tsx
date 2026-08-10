import { redirect } from "next/navigation";

import { PlanCard } from "@/components/billing/PlanCard";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/auth";
import { getUserBilling } from "@/lib/db/billing";
import { STRIPE_PRICES, type BillingInterval } from "@/lib/stripe";

function resolveInterval(priceId: string | null): BillingInterval | null {
  if (priceId === STRIPE_PRICES.monthly) return "monthly";
  if (priceId === STRIPE_PRICES.yearly) return "yearly";
  return null;
}

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const billing = await getUserBilling(session.user.id);
  if (!billing) redirect("/sign-in");

  return (
    <div className="flex min-h-full flex-1 justify-center overflow-y-auto p-6">
      <div className="w-full max-w-sm space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Billing</CardTitle>
          </CardHeader>
        </Card>

        <PlanCard
          isPro={billing.isPro}
          interval={resolveInterval(billing.stripePriceId)}
          currentPeriodEnd={billing.stripeCurrentPeriodEnd}
        />
      </div>
    </div>
  );
}
