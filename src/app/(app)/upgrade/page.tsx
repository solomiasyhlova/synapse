import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { UpgradePricingCards } from "@/components/billing/UpgradePricingCards";
import { getUserBilling } from "@/lib/db/billing";

export default async function UpgradePage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const billing = await getUserBilling(session.user.id);
  if (billing?.isPro) redirect("/settings");

  return (
    <main className="flex-1 overflow-y-auto p-6">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-bold">Upgrade to Pro</h1>
        <p className="mt-2 text-muted-foreground">
          Unlock unlimited items, file & image uploads, AI features, and more.
        </p>
        <UpgradePricingCards />
      </div>
    </main>
  );
}
