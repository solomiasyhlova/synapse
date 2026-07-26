import Link from "next/link";
import { Pin, Star } from "lucide-react";

import { Card } from "@/components/ui/card";
import { TypeIcon } from "@/components/dashboard/TypeIcon";
import type { ItemWithType } from "@/lib/db/items";

function formatShortDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function ItemRow({ item }: { item: ItemWithType }) {
  const type = item.itemType;
  const href = `/items/${type.name}/${item.id}`;

  return (
    <Link href={href} className="block">
      <Card
        className="flex-row items-center gap-3 border-l-2 px-4 transition-colors hover:bg-muted/40"
        style={{ borderLeftColor: type.color }}
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
          <TypeIcon name={type.icon} className="size-4" style={{ color: type.color }} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-sm font-medium">{item.title}</span>
            {item.isPinned && (
              <Pin className="size-3.5 shrink-0 text-muted-foreground" />
            )}
            {item.isFavorite && (
              <Star className="size-3.5 shrink-0 fill-yellow-400 text-yellow-400" />
            )}
          </div>
          {item.description && (
            <p className="truncate text-sm text-muted-foreground">{item.description}</p>
          )}
        </div>
        <span className="shrink-0 text-xs text-muted-foreground">
          {formatShortDate(item.updatedAt)}
        </span>
      </Card>
    </Link>
  );
}
