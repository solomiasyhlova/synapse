"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical, Pencil, Star, Trash2 } from "lucide-react";

import { deleteCollection, toggleCollectionFavorite } from "@/actions/collections";
import { DeleteCollectionDialog } from "@/components/dashboard/DeleteCollectionDialog";
import { EditCollectionDialog } from "@/components/dashboard/EditCollectionDialog";
import { TypeIcon } from "@/components/dashboard/TypeIcon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CollectionWithStats } from "@/lib/db/collections";
import { toastManager } from "@/lib/toast";
import { cn } from "@/lib/utils";

export function CollectionCard({ collection }: { collection: CollectionWithStats }) {
  const router = useRouter();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFavorite, setIsFavorite] = useState(collection.isFavorite);

  function handleNavigate() {
    router.push(`/collections/${collection.id}`);
  }

  async function handleToggleFavorite() {
    const next = !isFavorite;
    setIsFavorite(next);

    const result = await toggleCollectionFavorite(collection.id);

    if (result.success) {
      router.refresh();
    } else {
      setIsFavorite(!next);
      toastManager.add({ title: "Failed to update favorite", description: result.error });
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    const result = await deleteCollection(collection.id);
    setIsDeleting(false);

    if (result.success) {
      toastManager.add({ title: "Collection deleted" });
      setDeleteOpen(false);
      router.refresh();
    } else {
      toastManager.add({ title: "Failed to delete collection", description: result.error });
    }
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
                {isFavorite && (
                  <Star className="size-3.5 shrink-0 fill-yellow-400 text-yellow-400" />
                )}
                <div onClick={(event) => event.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      aria-label="Collection actions"
                      className="flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <MoreVertical className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setEditOpen(true)}>
                        <Pencil className="size-3.5" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => void handleToggleFavorite()}>
                        <Star className="size-3.5" />
                        Favorite
                      </DropdownMenuItem>
                      <DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>
                        <Trash2 className="size-3.5" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
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
