"use client";

import { useRouter } from "next/navigation";
import { Folder } from "lucide-react";

import { TypeIcon } from "@/components/dashboard/TypeIcon";
import { useItemDrawer } from "@/components/dashboard/item-drawer-context";
import type { CollectionWithStats } from "@/lib/db/collections";
import type { ItemWithType } from "@/lib/db/items";

interface FavoritesListProps {
  items: ItemWithType[];
  collections: CollectionWithStats[];
}

function formatShortDate(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
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
        <h2 className="mb-1 font-mono text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Items ({items.length})
        </h2>
        {items.length > 0 ? (
          <div className="divide-y divide-border">
            {items.map((item) => (
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
        <h2 className="mb-1 font-mono text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Collections ({collections.length})
        </h2>
        {collections.length > 0 ? (
          <div className="divide-y divide-border">
            {collections.map((collection) => (
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
