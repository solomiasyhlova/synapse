"use client";

import { useRouter } from "next/navigation";
import { Folder } from "lucide-react";

import { EntityListSection, EntityRow } from "@/components/dashboard/EntityListSection";
import { TypeIcon } from "@/components/dashboard/TypeIcon";
import { useItemDrawer } from "@/components/dashboard/item-drawer-context";
import type { CollectionWithStats } from "@/lib/db/collections";
import type { ItemWithType } from "@/lib/db/items";

interface RecentListProps {
  items: ItemWithType[];
  collections: CollectionWithStats[];
}

export function RecentList({ items, collections }: RecentListProps) {
  const { openItem } = useItemDrawer();
  const router = useRouter();

  if (items.length === 0 && collections.length === 0) {
    return (
      <p className="font-mono text-sm text-muted-foreground">
        Nothing yet. Items and collections you touch will show up here.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <EntityListSection title="Items" count={items.length} emptyLabel="No recent items.">
        {items.map((item) => (
          <EntityRow
            key={item.id}
            icon={<TypeIcon name={item.itemType.icon} className="size-3.5" />}
            iconColor={item.itemType.color}
            title={item.title}
            typeLabel={item.itemType.name}
            date={item.updatedAt}
            onClick={() => openItem(item.id)}
          />
        ))}
      </EntityListSection>

      <EntityListSection
        title="Collections"
        count={collections.length}
        emptyLabel="No recent collections."
      >
        {collections.map((collection) => (
          <EntityRow
            key={collection.id}
            icon={<Folder className="size-3.5" />}
            iconColor={collection.accentColor ?? undefined}
            title={collection.name}
            typeLabel="collection"
            date={collection.updatedAt}
            onClick={() => router.push(`/collections/${collection.id}`)}
          />
        ))}
      </EntityListSection>
    </div>
  );
}
