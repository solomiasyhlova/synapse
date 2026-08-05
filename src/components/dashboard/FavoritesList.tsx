"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Folder } from "lucide-react";

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

function formatShortDate(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
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

function FavoriteRow({
  icon,
  iconColor,
  title,
  typeLabel,
  date,
  onClick,
}: {
  icon: React.ReactNode;
  iconColor?: string;
  title: string;
  typeLabel: string;
  date: Date;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 px-2 py-1.5 text-left font-mono text-sm transition-colors hover:bg-muted/40"
    >
      <span className="flex size-4 shrink-0 items-center justify-center" style={{ color: iconColor }}>
        {icon}
      </span>
      <span className="min-w-0 flex-1 truncate">{title}</span>
      <span className="shrink-0 text-xs text-muted-foreground uppercase tracking-wide">
        {typeLabel}
      </span>
      <span className="w-14 shrink-0 text-right text-xs text-muted-foreground">
        {formatShortDate(date)}
      </span>
    </button>
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
      <section>
        <div className="mb-1 flex items-center justify-between gap-4">
          <h2 className="font-mono text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Items ({items.length})
          </h2>
          {items.length > 0 && (
            <SortSelect value={itemSort} labels={ITEM_SORT_LABELS} onValueChange={setItemSort} />
          )}
        </div>
        {items.length > 0 ? (
          <div className="divide-y divide-border">
            {sortedItems.map((item) => (
              <FavoriteRow
                key={item.id}
                icon={<TypeIcon name={item.itemType.icon} className="size-3.5" />}
                iconColor={item.itemType.color}
                title={item.title}
                typeLabel={item.itemType.name}
                date={item.updatedAt}
                onClick={() => openItem(item.id)}
              />
            ))}
          </div>
        ) : (
          <p className="font-mono text-sm text-muted-foreground">No favorite items.</p>
        )}
      </section>

      <section>
        <div className="mb-1 flex items-center justify-between gap-4">
          <h2 className="font-mono text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Collections ({collections.length})
          </h2>
          {collections.length > 0 && (
            <SortSelect
              value={collectionSort}
              labels={COLLECTION_SORT_LABELS}
              onValueChange={setCollectionSort}
            />
          )}
        </div>
        {collections.length > 0 ? (
          <div className="divide-y divide-border">
            {sortedCollections.map((collection) => (
              <FavoriteRow
                key={collection.id}
                icon={<Folder className="size-3.5" />}
                iconColor={collection.accentColor ?? undefined}
                title={collection.name}
                typeLabel="collection"
                date={collection.updatedAt}
                onClick={() => router.push(`/collections/${collection.id}`)}
              />
            ))}
          </div>
        ) : (
          <p className="font-mono text-sm text-muted-foreground">No favorite collections.</p>
        )}
      </section>
    </div>
  );
}
