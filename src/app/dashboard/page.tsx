import { CollectionsSection } from "@/components/dashboard/CollectionsSection";
import { PinnedItemsSection } from "@/components/dashboard/PinnedItemsSection";
import { RecentItemsSection } from "@/components/dashboard/RecentItemsSection";
import { StatsCards } from "@/components/dashboard/StatsCards";

export default function DashboardPage() {
  return (
    <main className="flex-1 space-y-8 overflow-y-auto p-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Everything you&apos;ve saved, in one searchable hub.
        </p>
      </div>
      <StatsCards />
      <CollectionsSection />
      <PinnedItemsSection />
      <RecentItemsSection />
    </main>
  );
}
