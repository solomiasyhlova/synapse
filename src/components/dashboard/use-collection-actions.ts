"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { deleteCollection, toggleCollectionFavorite } from "@/actions/collections";
import { toastManager } from "@/lib/toast";

interface CollectionActionsTarget {
  id: string;
  isFavorite: boolean;
}

export function useCollectionActions(
  collection: CollectionActionsTarget,
  options?: { onDeleted?: () => void }
) {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(collection.isFavorite);
  const [isDeleting, setIsDeleting] = useState(false);

  async function toggleFavorite() {
    const next = !isFavorite;
    setIsFavorite(next);

    const result = await toggleCollectionFavorite(collection.id);

    if (result.success) {
      toastManager.add({ title: next ? "Added to favorites" : "Removed from favorites" });
      router.refresh();
    } else {
      setIsFavorite(!next);
      toastManager.add({ title: "Failed to update favorite", description: result.error });
    }
  }

  async function deleteCollectionAction() {
    setIsDeleting(true);
    const result = await deleteCollection(collection.id);
    setIsDeleting(false);

    if (result.success) {
      toastManager.add({ title: "Collection deleted" });
      options?.onDeleted?.();
      return true;
    }

    toastManager.add({ title: "Failed to delete collection", description: result.error });
    return false;
  }

  return { isFavorite, toggleFavorite, isDeleting, deleteCollectionAction };
}
