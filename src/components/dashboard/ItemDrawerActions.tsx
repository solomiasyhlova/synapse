"use client";

import { Copy, Pencil, Pin, Star, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ItemDetail } from "@/lib/db/items";
import { cn } from "@/lib/utils";

interface ItemDrawerActionsProps {
  item: ItemDetail | null;
  isEditing: boolean;
  isSaving: boolean;
  canSave: boolean;
  onCancel: () => void;
  onSave: () => void;
  onCopy: () => void;
  onEdit: () => void;
  onDeleteRequest: () => void;
  onToggleFavorite: () => void;
}

export function ItemDrawerActions({
  item,
  isEditing,
  isSaving,
  canSave,
  onCancel,
  onSave,
  onCopy,
  onEdit,
  onDeleteRequest,
  onToggleFavorite,
}: ItemDrawerActionsProps) {
  if (isEditing) {
    return (
      <div className="ml-auto flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button size="sm" onClick={onSave} disabled={isSaving || !canSave}>
          Save
        </Button>
      </div>
    );
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className={cn(item?.isFavorite && "text-yellow-400")}
        onClick={onToggleFavorite}
        disabled={!item}
      >
        <Star className={cn("size-4", item?.isFavorite && "fill-yellow-400")} />
        Favorite
      </Button>
      <Button variant="ghost" size="sm">
        <Pin className="size-4" />
        Pin
      </Button>
      <Button variant="ghost" size="sm" onClick={onCopy} disabled={!item}>
        <Copy className="size-4" />
        Copy
      </Button>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={onEdit} disabled={!item}>
          <Pencil className="size-4" />
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={onDeleteRequest}
          disabled={!item}
        >
          <Trash2 className="size-4" />
          Delete
        </Button>
      </div>
    </>
  );
}
