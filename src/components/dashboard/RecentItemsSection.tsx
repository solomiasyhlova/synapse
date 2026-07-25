import { Clock } from "lucide-react";

import { ItemRow } from "@/components/dashboard/ItemRow";
import { items } from "@/lib/mock-data";

const RECENT_ITEMS_LIMIT = 10;

export function RecentItemsSection() {
  const recentItems = [...items]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, RECENT_ITEMS_LIMIT);

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
