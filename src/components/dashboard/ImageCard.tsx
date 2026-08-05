"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageOff, Pin, Star } from "lucide-react";

import { toggleItemFavorite } from "@/actions/items";
import { Button } from "@/components/ui/button";
import { useItemDrawer } from "@/components/dashboard/item-drawer-context";
import type { ItemWithType } from "@/lib/db/items";
import { toastManager } from "@/lib/toast";
import { cn } from "@/lib/utils";

export function ImageCard({ item }: { item: ItemWithType }) {
  const { openItem } = useItemDrawer();
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(item.isFavorite);

  async function handleToggleFavorite() {
    const next = !isFavorite;
    setIsFavorite(next);

    const result = await toggleItemFavorite(item.id);

    if (result.success) {
      toastManager.add({ title: next ? "Added to favorites" : "Removed from favorites" });
      router.refresh();
    } else {
      setIsFavorite(!next);
      toastManager.add({ title: "Failed to update favorite", description: result.error });
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => openItem(item.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openItem(item.id);
        }
      }}
      className="group block w-full cursor-pointer overflow-hidden rounded-lg border border-border text-left transition-colors hover:bg-muted/40"
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
        <span className="min-w-0 flex-1 truncate text-sm font-medium">{item.title}</span>
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
      </div>
    </div>
  );
}
