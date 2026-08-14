"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Folder } from "lucide-react";

import { EntityListSection, EntityRow } from "@/components/dashboard/EntityListSection";
import { TypeIcon } from "@/components/dashboard/TypeIcon";
import { useItemDrawer } from "@/components/dashboard/item-drawer-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CollectionWithStats } from "@/lib/db/collections";
import type { ItemWithType } from "@/lib/db/items";

interface FavoritesListProps {
  items: ItemWithType[];
  collections: CollectionWithStats[];
}

type ItemSortKey = "date" | "name" | "type";
type CollectionSortKey = "date" | "name";

const ITEM_SORT_LABELS: Record<ItemSortKey, string> = {
  date: "Date",
  name: "Name",
  type: "Type",
};

const COLLECTION_SORT_LABELS: Record<CollectionSortKey, string> = {
  date: "Date",
  name: "Name",
};

function sortItems(items: ItemWithType[], sortKey: ItemSortKey) {
  return [...items].sort((a, b) => {
    switch (sortKey) {
      case "name":
        return a.title.localeCompare(b.title);
      case "type":
        return a.itemType.name.localeCompare(b.itemType.name) || a.title.localeCompare(b.title);
      case "date":
      default:
        return b.updatedAt.getTime() - a.updatedAt.getTime();
    }
  });
}

function sortCollections(collections: CollectionWithStats[], sortKey: CollectionSortKey) {
  return [...collections].sort((a, b) => {
    switch (sortKey) {
      case "name":
        return a.name.localeCompare(b.name);
      case "date":
      default:
        return b.updatedAt.getTime() - a.updatedAt.getTime();
    }
  });
}

function SortSelect<T extends string>({
  value,
  labels,
  onValueChange,
}: {
  value: T;
  labels: Record<T, string>;
  onValueChange: (value: T) => void;
}) {
  return (
    <Select items={labels} value={value} onValueChange={(next) => onValueChange(next as T)}>
      <SelectTrigger size="sm" className="w-28 font-mono text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {(Object.keys(labels) as T[]).map((key) => (
          <SelectItem key={key} value={key} className="font-mono text-xs">
            {labels[key]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function FavoritesList({ items, collections }: FavoritesListProps) {
  const { openItem } = useItemDrawer();
  const router = useRouter();
  const [itemSort, setItemSort] = useState<ItemSortKey>("date");
  const [collectionSort, setCollectionSort] = useState<CollectionSortKey>("date");

  const sortedItems = useMemo(() => sortItems(items, itemSort), [items, itemSort]);
  const sortedCollections = useMemo(
    () => sortCollections(collections, collectionSort),
    [collections, collectionSort]
  );

  if (items.length === 0 && collections.length === 0) {
    return (
      <p className="font-mono text-sm text-muted-foreground">
        No favorites yet. Star an item or collection to see it here.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <EntityListSection
        title="Items"
        count={items.length}
        emptyLabel="No favorite items."
        headerExtra={
          items.length > 0 && (
            <SortSelect value={itemSort} labels={ITEM_SORT_LABELS} onValueChange={setItemSort} />
          )
        }
      >
        {sortedItems.map((item) => (
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
        emptyLabel="No favorite collections."
        headerExtra={
          collections.length > 0 && (
            <SortSelect
              value={collectionSort}
              labels={COLLECTION_SORT_LABELS}
              onValueChange={setCollectionSort}
            />
          )
        }
      >
        {sortedCollections.map((collection) => (
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
