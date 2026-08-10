"use client";

import { useState } from "react";
import { CreditCard } from "lucide-react";

import { createCheckoutSession, createPortalSession } from "@/actions/billing";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import type { BillingInterval } from "@/lib/stripe";
import { FREE_COLLECTION_LIMIT, FREE_ITEM_LIMIT } from "@/lib/usage-limits";
import { toastManager } from "@/lib/toast";

interface PlanCardProps {
  isPro: boolean;
  interval: BillingInterval | null;
  currentPeriodEnd: Date | null;
  itemCount?: number;
  collectionCount?: number;
  showUsage?: boolean;
}

const INTERVAL_LABELS: Record<BillingInterval, string> = {
  monthly: "Monthly",
  yearly: "Yearly",
};

export function PlanCard({
  isPro,
  interval,
  currentPeriodEnd,
  itemCount = 0,
  collectionCount = 0,
  showUsage = true,
}: PlanCardProps) {
  const [pendingInterval, setPendingInterval] = useState<BillingInterval | null>(null);
  const [pendingPortal, setPendingPortal] = useState(false);

  async function upgrade(nextInterval: BillingInterval) {
    setPendingInterval(nextInterval);
    const result = await createCheckoutSession(nextInterval);
    setPendingInterval(null);
    if (result && !result.success) {
      toastManager.add({ title: "Couldn't start checkout", description: result.error });
    }
  }

  async function manage() {
    setPendingPortal(true);
    const result = await createPortalSession();
    setPendingPortal(false);
    if (result && !result.success) {
      toastManager.add({ title: "Couldn't open billing portal", description: result.error });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CreditCard className="size-4" />
          Billing
        </CardTitle>
        <CardDescription>Manage your subscription and billing</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Current plan:</span>
          <Badge variant={isPro ? "default" : "secondary"}>{isPro ? "Pro" : "Free"}</Badge>
        </div>

        {isPro ? (
          <>
            {(interval || currentPeriodEnd) && (
              <p className="text-sm text-muted-foreground">
                {interval ? `${INTERVAL_LABELS[interval]} billing. ` : ""}
                {currentPeriodEnd ? `Current period ends ${formatDate(currentPeriodEnd)}.` : ""}
              </p>
            )}
            <Button variant="outline" disabled={pendingPortal} onClick={() => void manage()}>
              Manage subscription
            </Button>
          </>
        ) : (
          <>
            {showUsage && (
              <div className="space-y-0.5 text-sm text-muted-foreground">
                <p>
                  {itemCount}/{FREE_ITEM_LIMIT} items
                </p>
                <p>
                  {collectionCount}/{FREE_COLLECTION_LIMIT} collections
                </p>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                disabled={pendingInterval !== null}
                onClick={() => void upgrade("monthly")}
              >
                Upgrade $8/mo
              </Button>
              <Button disabled={pendingInterval !== null} onClick={() => void upgrade("yearly")}>
                Upgrade $72/yr (save 25%)
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
