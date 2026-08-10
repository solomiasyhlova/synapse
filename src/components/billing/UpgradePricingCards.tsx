"use client";

import { useState } from "react";

import { createCheckoutSession } from "@/actions/billing";
import { Button } from "@/components/ui/button";
import { toastManager } from "@/lib/toast";
import type { BillingInterval } from "@/lib/stripe";
import { cn } from "@/lib/utils";

const FREE_FEATURES = [
  "50 items total",
  "3 collections",
  "All system types except File & Image",
  "Basic search",
];

const PRO_FEATURES = [
  "Unlimited items",
  "Unlimited collections",
  "File & image uploads",
  "Full search",
  "AI auto-tagging, summaries & more",
  "Export (JSON / ZIP)",
  "Priority support",
];

export function UpgradePricingCards() {
  const [isYearly, setIsYearly] = useState(false);
  const [pending, setPending] = useState(false);

  async function upgrade() {
    setPending(true);
    const interval: BillingInterval = isYearly ? "yearly" : "monthly";
    const result = await createCheckoutSession(interval);
    setPending(false);
    if (result && !result.success) {
      toastManager.add({ title: "Couldn't start checkout", description: result.error });
    }
  }

  return (
    <>
      <div className="mt-7 flex items-center justify-center gap-3.5 text-[0.9375rem] text-muted-foreground">
        <span className={cn(isYearly ? "" : "font-semibold text-foreground")}>Monthly</span>
        <button
          type="button"
          role="switch"
          aria-checked={isYearly}
          aria-label="Toggle yearly billing"
          onClick={() => setIsYearly((value) => !value)}
          className={cn(
            "relative h-6.5 w-11.5 rounded-full border border-border transition-colors",
            isYearly ? "bg-[#6366f1]" : "bg-muted",
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform",
              isYearly && "translate-x-5",
            )}
          />
        </button>
        <span className={cn(isYearly ? "font-semibold text-foreground" : "")}>
          Yearly{" "}
          <span className="ml-1.5 rounded-full bg-green-500/15 px-2 py-0.5 text-[0.6875rem] font-bold text-green-500">
            Save 25%
          </span>
        </span>
      </div>

      <div className="mx-auto mt-14 grid max-w-3xl gap-6 sm:grid-cols-2">
        <div className="flex flex-col rounded-3xl border border-border bg-card p-9">
          <h3 className="mb-1.5 text-xl font-bold">Free</h3>
          <p className="mb-6 text-sm text-muted-foreground">
            For getting your knowledge out of the void.
          </p>
          <div className="mb-6 flex items-baseline gap-1">
            <span className="text-[2.75rem] font-extrabold tracking-tight">$0</span>
            <span className="text-[0.9375rem] text-muted-foreground/70">/forever</span>
          </div>
          <ul className="mb-7 flex flex-1 flex-col gap-3">
            {FREE_FEATURES.map((feature) => (
              <li key={feature} className="pl-6.5 relative text-[0.9375rem] text-muted-foreground">
                <span className="absolute top-1.5 left-0 h-4 w-4 rounded-full bg-green-500/20 shadow-[inset_0_0_0_1.5px_#22c55e]" />
                {feature}
              </li>
            ))}
          </ul>
          <Button variant="outline" disabled className="h-auto px-5 py-2.5 text-sm font-semibold">
            Current Plan
          </Button>
        </div>

        <div className="relative flex flex-col rounded-3xl border border-[#6366f1] bg-linear-to-b from-[#6366f1]/8 to-card p-9 shadow-2xl">
          <span className="absolute -top-3.25 left-1/2 -translate-x-1/2 rounded-full bg-linear-to-br from-[#6366f1] to-[#8b5cf6] px-3.5 py-1.5 text-xs font-bold text-white">
            Most Popular
          </span>
          <h3 className="mb-1.5 text-xl font-bold">Pro</h3>
          <p className="mb-6 text-sm text-muted-foreground">For developers who save everything.</p>
          <div className="mb-6 flex items-baseline gap-1">
            <span className="text-[2.75rem] font-extrabold tracking-tight">
              {isYearly ? "$6" : "$8"}
            </span>
            <span className="text-[0.9375rem] text-muted-foreground/70">
              {isYearly ? "/mo, billed yearly" : "/mo"}
            </span>
          </div>
          <ul className="mb-7 flex flex-1 flex-col gap-3">
            {PRO_FEATURES.map((feature) => (
              <li key={feature} className="pl-6.5 relative text-[0.9375rem] text-muted-foreground">
                <span className="absolute top-1.5 left-0 h-4 w-4 rounded-full bg-green-500/20 shadow-[inset_0_0_0_1.5px_#22c55e]" />
                {feature}
              </li>
            ))}
          </ul>
          <Button
            disabled={pending}
            onClick={() => void upgrade()}
            className="h-auto bg-linear-to-br from-[#6366f1] to-[#8b5cf6] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_20px_rgba(99,102,241,0.35)] hover:from-[#7678f5] hover:to-[#9c6bf6]"
          >
            {pending ? "Redirecting…" : isYearly ? "Upgrade — $72/yr" : "Upgrade — $8/mo"}
          </Button>
        </div>
      </div>
    </>
  );
}
