"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { toggleItemFavorite } from "@/actions/items";
import { toastManager } from "@/lib/toast";

export function useItemFavorite(itemId: string, initialIsFavorite: boolean) {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);

  async function toggle() {
    const next = !isFavorite;
    setIsFavorite(next);

    const result = await toggleItemFavorite(itemId);

    if (result.success) {
      toastManager.add({ title: next ? "Added to favorites" : "Removed from favorites" });
      router.refresh();
    } else {
      setIsFavorite(!next);
      toastManager.add({ title: "Failed to update favorite", description: result.error });
    }
  }

  return { isFavorite, toggle };
}
