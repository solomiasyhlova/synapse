"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";

import { CollectionCardMenu } from "@/components/dashboard/CollectionCardMenu";
import { ConfirmDeleteDialog } from "@/components/dashboard/ConfirmDeleteDialog";
import { EditCollectionDialog } from "@/components/dashboard/EditCollectionDialog";
import { TypeIcon } from "@/components/dashboard/TypeIcon";
import { useCollectionActions } from "@/components/dashboard/use-collection-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CollectionWithStats } from "@/lib/db/collections";
import { cn } from "@/lib/utils";

export function CollectionCard({ collection }: { collection: CollectionWithStats }) {
  const router = useRouter();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { isFavorite, toggleFavorite, isDeleting, deleteCollectionAction } = useCollectionActions(
    collection,
    { onDeleted: () => router.refresh() }
  );

  function handleNavigate() {
    router.push(`/collections/${collection.id}`);
  }

  async function handleDelete() {
    const success = await deleteCollectionAction();
    if (success) setDeleteOpen(false);
  }

  return (
    <>
      <div
        role="link"
        tabIndex={0}
        onClick={handleNavigate}
        onKeyDown={(event) => {
          if (event.key === "Enter") handleNavigate();
        }}
        className="cursor-pointer"
      >
        <Card
          className="border-l-2 transition-colors hover:bg-muted/40"
          style={{ borderLeftColor: collection.accentColor ?? undefined }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5 text-base">
              <span className="min-w-0 flex-1 truncate">{collection.name}</span>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                  onClick={(event) => {
                    event.stopPropagation();
                    void toggleFavorite();
                  }}
                >
                  <Star
                    className={cn("size-3.5", isFavorite && "fill-yellow-400 text-yellow-400")}
                  />
                </Button>
                <CollectionCardMenu
                  onEditRequest={() => setEditOpen(true)}
                  onDeleteRequest={() => setDeleteOpen(true)}
                />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">{collection.itemCount} items</p>
            {collection.description && (
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {collection.description}
              </p>
            )}
            {collection.types.length > 0 && (
              <div className="flex items-center gap-1.5">
                {collection.types.map((type) => (
                  <span
                    key={type.id}
                    className={cn(
                      "flex size-6 items-center justify-center rounded-md bg-muted",
                    )}
                  >
                    <TypeIcon
                      name={type.icon}
                      className="size-3.5"
                      style={{ color: type.color }}
                    />
                  </span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
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
