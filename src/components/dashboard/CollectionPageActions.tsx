"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Star, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/dashboard/ConfirmDeleteDialog";
import { EditCollectionDialog } from "@/components/dashboard/EditCollectionDialog";
import { useCollectionActions } from "@/components/dashboard/use-collection-actions";
import type { CollectionDetail } from "@/lib/db/collections";
import { cn } from "@/lib/utils";

export function CollectionPageActions({ collection }: { collection: CollectionDetail }) {
  const router = useRouter();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { isFavorite, toggleFavorite, isDeleting, deleteCollectionAction } = useCollectionActions(
    collection,
    { onDeleted: () => router.push("/collections") }
  );

  async function handleDelete() {
    const success = await deleteCollectionAction();
    if (success) setDeleteOpen(false);
  }

  return (
    <>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className={cn(isFavorite && "text-yellow-400")}
          onClick={() => void toggleFavorite()}
        >
          <Star className={cn("size-4", isFavorite && "fill-yellow-400")} />
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
      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete collection"
        description={
          <>
            This permanently deletes &ldquo;{collection.name}&rdquo;. Items in this collection are
            not deleted — they&apos;ll just no longer belong to it. This cannot be undone.
          </>
        }
        isDeleting={isDeleting}
        onConfirm={handleDelete}
      />
    </>
  );
}
