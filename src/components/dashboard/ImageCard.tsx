"use client";

import { ImageOff, Pin, Star } from "lucide-react";

import { useItemDrawer } from "@/components/dashboard/item-drawer-context";
import type { ItemWithType } from "@/lib/db/items";

export function ImageCard({ item }: { item: ItemWithType }) {
  const { openItem } = useItemDrawer();

  return (
    <button
      type="button"
      className="group block w-full overflow-hidden rounded-lg border border-border text-left transition-colors hover:bg-muted/40"
      onClick={() => openItem(item.id)}
    >
      <div className="aspect-video overflow-hidden bg-muted">
        {item.fileUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.fileUrl}
            alt={item.fileName ?? item.title}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <ImageOff className="size-6 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="flex items-center gap-1.5 p-3">
        <span className="truncate text-sm font-medium">{item.title}</span>
        {item.isPinned && <Pin className="size-3.5 shrink-0 text-muted-foreground" />}
        {item.isFavorite && <Star className="size-3.5 shrink-0 fill-yellow-400 text-yellow-400" />}
      </div>
    </button>
  );
}
