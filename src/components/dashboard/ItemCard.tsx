"use client";

import { Pin, Star } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TypeIcon } from "@/components/dashboard/TypeIcon";
import { useItemDrawer } from "@/components/dashboard/item-drawer-context";
import type { ItemWithType } from "@/lib/db/items";

function formatShortDate(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function ItemCard({ item }: { item: ItemWithType }) {
  const type = item.itemType;
  const { openItem } = useItemDrawer();

  return (
    <button type="button" className="block w-full text-left" onClick={() => openItem(item.id)}>
      <Card
        className="border-l-2 transition-colors hover:bg-muted/40"
        style={{ borderLeftColor: type.color }}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-1.5 text-base">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted">
              <TypeIcon name={type.icon} className="size-3.5" style={{ color: type.color }} />
            </span>
            <span className="truncate">{item.title}</span>
            {item.isPinned && <Pin className="size-3.5 shrink-0 text-muted-foreground" />}
            {item.isFavorite && (
              <Star className="size-3.5 shrink-0 fill-yellow-400 text-yellow-400" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="line-clamp-2 min-h-10 text-sm text-muted-foreground">
            {item.description}
          </p>
          <p className="text-xs text-muted-foreground">{formatShortDate(item.updatedAt)}</p>
        </CardContent>
      </Card>
    </button>
  );
}
