"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { deleteItem, toggleItemFavorite, toggleItemPin, updateItem } from "@/actions/items";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { DeleteItemDialog } from "@/components/dashboard/DeleteItemDialog";
import { ItemDrawerActions } from "@/components/dashboard/ItemDrawerActions";
import { ItemDrawerEditForm, toEditState, type EditState } from "@/components/dashboard/ItemDrawerEditForm";
import { ItemDrawerView } from "@/components/dashboard/ItemDrawerView";
import { TypeIcon } from "@/components/dashboard/TypeIcon";
import { useItemDrawer } from "@/components/dashboard/item-drawer-context";
import type { CollectionOption } from "@/lib/db/collections";
import type { ItemDetail } from "@/lib/db/items";
import { CONTENT_TYPES, LANGUAGE_TYPES } from "@/lib/item-type-kinds";
import { parseTagsInput } from "@/lib/tags";
import { toastManager } from "@/lib/toast";

interface ItemDrawerProps {
  collections: CollectionOption[];
  isPro: boolean;
}

export function ItemDrawer({ collections, isPro }: ItemDrawerProps) {
  const router = useRouter();
  const { openItemId, isOpen, close } = useItemDrawer();
  const [item, setItem] = useState<ItemDetail | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [edit, setEdit] = useState<EditState | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!openItemId) return;

    let cancelled = false;
    setItem(null);
    setIsEditing(false);
    setEdit(null);
    setIsDeleteDialogOpen(false);

    fetch(`/api/items/${openItemId}`)
      .then((res) => res.json())
      .then((result) => {
        if (!cancelled && result.success) {
          setItem(result.data as ItemDetail);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [openItemId]);

  async function handleCopy() {
    const value = item?.content ?? item?.url ?? "";
    if (!value) return;
    await navigator.clipboard.writeText(value);
    toastManager.add({ title: "Copied to clipboard" });
  }

  function handleEdit() {
    if (!item) return;
    setEdit(toEditState(item));
    setIsEditing(true);
  }

  function handleCancel() {
    setIsEditing(false);
    setEdit(null);
  }

  async function handleSave() {
    if (!item || !edit) return;

    setIsSaving(true);

    const isContentType = CONTENT_TYPES.includes(item.itemType.name);
    const isLanguageType = LANGUAGE_TYPES.includes(item.itemType.name);
    const isUrlType = item.itemType.name === "link";

    const result = await updateItem(item.id, {
      title: edit.title,
      description: edit.description.trim() ? edit.description : null,
      content: isContentType ? edit.content : null,
      language: isLanguageType ? edit.language.trim() || null : null,
      url: isUrlType ? edit.url.trim() || null : null,
      tags: parseTagsInput(edit.tags),
      collectionIds: edit.collectionIds,
    });

    setIsSaving(false);

    if (result.success && result.data) {
      setItem(result.data);
      setIsEditing(false);
      setEdit(null);
      toastManager.add({ title: "Item updated" });
      router.refresh();
    } else {
      toastManager.add({ title: "Failed to update item", description: result.error });
    }
  }

  async function handleToggleFavorite() {
    if (!item) return;

    const wasFavorite = item.isFavorite;
    const result = await toggleItemFavorite(item.id);

    if (result.success && result.data) {
      setItem(result.data);
      toastManager.add({ title: wasFavorite ? "Removed from favorites" : "Added to favorites" });
      router.refresh();
    } else {
      toastManager.add({ title: "Failed to update favorite", description: result.error });
    }
  }

  async function handleTogglePin() {
    if (!item) return;

    const wasPinned = item.isPinned;
    const result = await toggleItemPin(item.id);

    if (result.success && result.data) {
      setItem(result.data);
      toastManager.add({ title: wasPinned ? "Unpinned" : "Pinned" });
      router.refresh();
    } else {
      toastManager.add({ title: "Failed to update pin", description: result.error });
    }
  }

  async function handleDelete() {
    if (!item) return;

    setIsDeleting(true);
    const result = await deleteItem(item.id);
    setIsDeleting(false);

    if (result.success) {
      setIsDeleteDialogOpen(false);
      close();
      toastManager.add({ title: "Item deleted" });
      router.refresh();
    } else {
      toastManager.add({ title: "Failed to delete item", description: result.error });
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && close()}>
      <SheetContent className="w-full overflow-y-auto data-[side=right]:sm:max-w-120">
        <SheetHeader>
          <div className="flex items-center gap-2">
            {item ? (
              <>
                <span
                  className="flex size-9 shrink-0 items-center justify-center rounded-md"
                  style={{ backgroundColor: `${item.itemType.color}1a` }}
                >
                  <TypeIcon
                    name={item.itemType.icon}
                    className="size-4"
                    style={{ color: item.itemType.color }}
                  />
                </span>
                <SheetTitle className="min-w-0 flex-1 truncate text-lg">{item.title}</SheetTitle>
              </>
            ) : (
              <>
                <Skeleton className="size-9 shrink-0 rounded-md" />
                <SheetTitle className="sr-only">Loading item</SheetTitle>
                <Skeleton className="h-5 w-40" />
              </>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {item ? (
              <>
                <Badge variant="outline" className="capitalize">
                  {item.itemType.name}
                </Badge>
                {item.language && <Badge variant="outline">{item.language}</Badge>}
              </>
            ) : (
              <Skeleton className="h-5 w-16 rounded-full" />
            )}
          </div>
        </SheetHeader>

        <div className="flex flex-wrap items-center gap-1 border-b border-border px-4 pb-4">
          <ItemDrawerActions
            item={item}
            isEditing={isEditing}
            isSaving={isSaving}
            canSave={Boolean(edit?.title.trim())}
            onCancel={handleCancel}
            onSave={handleSave}
            onCopy={handleCopy}
            onEdit={handleEdit}
            onDeleteRequest={() => setIsDeleteDialogOpen(true)}
            onToggleFavorite={() => void handleToggleFavorite()}
            onTogglePin={() => void handleTogglePin()}
          />
        </div>

        {isEditing && item && edit ? (
          <ItemDrawerEditForm
            item={item}
            edit={edit}
            onChange={setEdit}
            collections={collections}
            isPro={isPro}
          />
        ) : item ? (
          <ItemDrawerView item={item} isPro={isPro} />
        ) : (
          <div className="flex flex-col gap-5 px-4 pb-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        )}
      </SheetContent>

      <DeleteItemDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        itemTitle={item?.title}
        isDeleting={isDeleting}
        onConfirm={() => void handleDelete()}
      />
    </Sheet>
  );
}
