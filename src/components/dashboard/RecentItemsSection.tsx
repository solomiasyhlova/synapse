import { Clock } from "lucide-react";

import { CollapsibleSection } from "@/components/dashboard/CollapsibleSection";
import { ItemRow } from "@/components/dashboard/ItemRow";
import { getRecentItems } from "@/lib/db/items";

export async function RecentItemsSection({ userId }: { userId: string }) {
  const recentItems = await getRecentItems(userId);

  return (
    <CollapsibleSection icon={<Clock className="size-4 text-muted-foreground" />} title="Recent items">
      {recentItems.map((item) => (
        <ItemRow key={item.id} item={item} />
      ))}
    </CollapsibleSection>
  );
}
