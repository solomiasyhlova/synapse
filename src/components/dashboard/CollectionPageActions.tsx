"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Star, Trash2 } from "lucide-react";

import { deleteCollection } from "@/actions/collections";
import { Button } from "@/components/ui/button";
import { DeleteCollectionDialog } from "@/components/dashboard/DeleteCollectionDialog";
import { EditCollectionDialog } from "@/components/dashboard/EditCollectionDialog";
import type { CollectionDetail } from "@/lib/db/collections";
import { toastManager } from "@/lib/toast";
import { cn } from "@/lib/utils";

export function CollectionPageActions({ collection }: { collection: CollectionDetail }) {
  const router = useRouter();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    const result = await deleteCollection(collection.id);
    setIsDeleting(false);

    if (result.success) {
      setDeleteOpen(false);
      toastManager.add({ title: "Collection deleted" });
      router.push("/collections");
    } else {
      toastManager.add({ title: "Failed to delete collection", description: result.error });
    }
  }

  return (
    <>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" className={cn(collection.isFavorite && "text-yellow-400")}>
          <Star className={cn("size-4", collection.isFavorite && "fill-yellow-400")} />
          Favorite
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setEditOpen(true)}>
          <Pencil className="size-4" />
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 className="size-4" />
          Delete
        </Button>
      </div>

      <EditCollectionDialog
        key={editOpen ? `open-${collection.id}` : `closed-${collection.id}`}
        open={editOpen}
        onOpenChange={setEditOpen}
        collection={collection}
        onUpdated={() => router.refresh()}
      />
      <DeleteCollectionDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        collectionName={collection.name}
        isDeleting={isDeleting}
        onConfirm={handleDelete}
      />
    </>
  );
}
