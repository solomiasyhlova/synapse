"use client";

import { Copy, Pin, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TypeIcon } from "@/components/dashboard/TypeIcon";
import { useItemDrawer } from "@/components/dashboard/item-drawer-context";
import { useItemFavorite } from "@/components/dashboard/use-item-favorite";
import { useOpenItemProps } from "@/components/dashboard/use-open-item-props";
import type { ItemDetail, ItemWithType } from "@/lib/db/items";
import { formatShortDate } from "@/lib/format";
import { toastManager } from "@/lib/toast";
import { cn } from "@/lib/utils";

export function ItemCard({ item }: { item: ItemWithType }) {
  const type = item.itemType;
  const { openItem } = useItemDrawer();
  const { isFavorite, toggle: handleToggleFavorite } = useItemFavorite(item.id, item.isFavorite);
  const openItemProps = useOpenItemProps(openItem, item.id);

  async function handleCopy() {
    const res = await fetch(`/api/items/${item.id}`);
    const result = await res.json();
    if (!result.success) {
      toastManager.add({ title: "Failed to copy", description: result.error });
      return;
    }

    const detail = result.data as ItemDetail;
    const value = detail.content ?? detail.url ?? "";
    if (!value) return;

    await navigator.clipboard.writeText(value);
    toastManager.add({ title: "Copied to clipboard" });
  }

  return (
    <div {...openItemProps} className="group w-full cursor-pointer text-left">
      <Card
        className="border-l-2 transition-colors hover:bg-muted/40"
        style={{ borderLeftColor: type.color }}
      >
        <CardHeader>
          <CardTitle className="flex min-w-0 items-center gap-1.5 text-base">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted">
              <TypeIcon name={type.icon} className="size-3.5" style={{ color: type.color }} />
            </span>
            <span className="min-w-0 flex-1 truncate">{item.title}</span>
            {item.isPinned && <Pin className="size-3.5 shrink-0 text-muted-foreground" />}
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              className="shrink-0"
              onClick={(event) => {
                event.stopPropagation();
                void handleToggleFavorite();
              }}
            >
              <Star className={cn("size-3.5", isFavorite && "fill-yellow-400 text-yellow-400")} />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Copy to clipboard"
              className="ml-auto shrink-0 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
              onClick={(event) => {
                event.stopPropagation();
                handleCopy();
              }}
            >
              <Copy className="size-3.5" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="line-clamp-2 min-h-10 text-sm text-muted-foreground">
            {item.description}
          </p>
          <p className="text-xs text-muted-foreground">{formatShortDate(item.updatedAt)}</p>
        </CardContent>
      </Card>
    </div>
  );
}
