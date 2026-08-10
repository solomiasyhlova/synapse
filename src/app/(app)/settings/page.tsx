import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { PlanCard } from "@/components/billing/PlanCard";
import { ProUpgradeToast } from "@/components/billing/ProUpgradeToast";
import { ChangePasswordDialog } from "@/components/profile/ChangePasswordDialog";
import { DeleteAccountDialog } from "@/components/profile/DeleteAccountDialog";
import { SetPasswordDialog } from "@/components/profile/SetPasswordDialog";
import { EditorPreferencesForm } from "@/components/settings/EditorPreferencesForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getUsageCounts, getUserBilling } from "@/lib/db/billing";
import { getProfileUser } from "@/lib/db/profile";
import { getEditorPreferences } from "@/lib/db/settings";
import { STRIPE_PRICES, type BillingInterval } from "@/lib/stripe";

interface SettingsPageProps {
  searchParams: Promise<{ success?: string }>;
}

function resolveInterval(priceId: string | null): BillingInterval | null {
  if (priceId === STRIPE_PRICES.monthly) return "monthly";
  if (priceId === STRIPE_PRICES.yearly) return "yearly";
  return null;
}

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const [user, editorPreferences, billing, usage, { success }] = await Promise.all([
    getProfileUser(session.user.id),
    getEditorPreferences(session.user.id),
    getUserBilling(session.user.id),
    getUsageCounts(session.user.id),
    searchParams,
  ]);
  if (!user || !billing) notFound();

  return (
    <main className="flex-1 space-y-6 overflow-y-auto p-6">
      <ProUpgradeToast success={success === "true"} />

      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Editor</CardTitle>
          <CardDescription>Customize your code editor appearance and behavior</CardDescription>
        </CardHeader>
        <CardContent>
          <EditorPreferencesForm initialPreferences={editorPreferences} />
        </CardContent>
      </Card>

      <PlanCard
        isPro={billing.isPro}
        interval={resolveInterval(billing.stripePriceId)}
        currentPeriodEnd={billing.stripeCurrentPeriodEnd}
        itemCount={usage.itemCount}
        collectionCount={usage.collectionCount}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
          <CardDescription>Manage your account security and preferences</CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          <div className="flex items-center justify-between gap-4 py-4 first:pt-0">
            <div>
              <p className="text-sm font-medium">Password</p>
              <p className="text-sm text-muted-foreground">
                Update your password to keep your account secure
              </p>
            </div>
            {user.hasPassword ? <ChangePasswordDialog /> : <SetPasswordDialog />}
          </div>
          <div className="flex items-center justify-between gap-4 py-4 last:pb-0">
            <div>
              <p className="text-sm font-medium text-destructive">Delete Account</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data
              </p>
            </div>
            <DeleteAccountDialog />
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
