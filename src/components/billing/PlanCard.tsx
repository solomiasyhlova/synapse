"use client";

import { useState } from "react";

import { createCheckoutSession, createPortalSession } from "@/actions/billing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import type { BillingInterval } from "@/lib/stripe";
import { toastManager } from "@/lib/toast";
import { cn } from "@/lib/utils";

interface PlanCardProps {
  isPro: boolean;
  interval: BillingInterval | null;
  currentPeriodEnd: Date | null;
}

const INTERVAL_LABELS: Record<BillingInterval, string> = {
  monthly: "Monthly",
  yearly: "Yearly",
};

export function PlanCard({ isPro, interval, currentPeriodEnd }: PlanCardProps) {
  const [selectedInterval, setSelectedInterval] = useState<BillingInterval>("monthly");
  const [pending, setPending] = useState(false);

  async function upgrade() {
    setPending(true);
    const result = await createCheckoutSession(selectedInterval);
    setPending(false);
    if (result && !result.success) {
      toastManager.add({ title: "Couldn't start checkout", description: result.error });
    }
  }

  async function manage() {
    setPending(true);
    const result = await createPortalSession();
    setPending(false);
    if (result && !result.success) {
      toastManager.add({ title: "Couldn't open billing portal", description: result.error });
    }
  }

  if (isPro) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Current Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Pro{interval ? ` (${INTERVAL_LABELS[interval]})` : ""}</span>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              Active
            </span>
          </div>
          {currentPeriodEnd && (
            <p className="text-sm text-muted-foreground">
              Current period ends {formatDate(currentPeriodEnd)}.
            </p>
          )}
          <Button variant="outline" className="w-full" disabled={pending} onClick={() => void manage()}>
            Manage subscription
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Upgrade to Pro</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center gap-3.5 text-sm text-muted-foreground">
          <span className={cn(selectedInterval === "yearly" ? "" : "font-semibold text-foreground")}>
            Monthly
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={selectedInterval === "yearly"}
            aria-label="Toggle yearly billing"
            onClick={() => setSelectedInterval((value) => (value === "monthly" ? "yearly" : "monthly"))}
            className={cn(
              "relative h-6 w-11 rounded-full border border-border transition-colors",
              selectedInterval === "yearly" ? "bg-primary" : "bg-muted",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform",
                selectedInterval === "yearly" && "translate-x-5",
              )}
            />
          </button>
          <span className={cn(selectedInterval === "yearly" ? "font-semibold text-foreground" : "")}>
            Yearly{" "}
            <span className="ml-1.5 rounded-full bg-green-500/15 px-2 py-0.5 text-[0.6875rem] font-bold text-green-500">
              Save 25%
            </span>
          </span>
        </div>

        <div className="flex items-baseline justify-center gap-1">
          <span className="text-3xl font-extrabold tracking-tight">
            {selectedInterval === "yearly" ? "$6" : "$8"}
          </span>
          <span className="text-sm text-muted-foreground">
            {selectedInterval === "yearly" ? "/mo, billed yearly" : "/mo"}
          </span>
        </div>

        <Button className="w-full" disabled={pending} onClick={() => void upgrade()}>
          Upgrade to Pro
        </Button>
      </CardContent>
    </Card>
  );
}
