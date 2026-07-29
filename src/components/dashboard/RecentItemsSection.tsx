import { Clock } from "lucide-react";

import { ItemRow } from "@/components/dashboard/ItemRow";
import { getRecentItems } from "@/lib/db/items";

export async function RecentItemsSection({ userId }: { userId: string }) {
  const recentItems = await getRecentItems(userId);

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Clock className="size-4 text-muted-foreground" />
        <h2 className="text-lg font-semibold">Recent items</h2>
      </div>
      <div className="space-y-2">
        {recentItems.map((item) => (
          <ItemRow key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
