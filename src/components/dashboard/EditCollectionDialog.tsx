"use client";

import { useId, useState, type FormEvent } from "react";

import { updateCollection } from "@/actions/collections";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CollectionDetail } from "@/lib/db/collections";
import { toastManager } from "@/lib/toast";
import { cn } from "@/lib/utils";

interface EditCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collection: Pick<CollectionDetail, "id" | "name" | "description">;
  onUpdated?: (updated: CollectionDetail) => void;
}

export function EditCollectionDialog({
  open,
  onOpenChange,
  collection,
  onUpdated,
}: EditCollectionDialogProps) {
  const nameId = useId();
  const descriptionId = useId();

  const [name, setName] = useState(collection.name);
  const [description, setDescription] = useState(collection.description ?? "");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);

    const result = await updateCollection(collection.id, {
      name,
      description: description.trim() ? description : null,
    });

    setIsSaving(false);

    if (result.success && result.data) {
      toastManager.add({ title: "Collection updated" });
      onOpenChange(false);
      onUpdated?.(result.data);
    } else {
      toastManager.add({ title: "Failed to update collection", description: result.error });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit collection</DialogTitle>
          <DialogDescription>Update this collection&apos;s name and description.</DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <label htmlFor={nameId} className="text-sm font-medium">
              Name
            </label>
            <Input
              id={nameId}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. React Patterns"
              required
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor={descriptionId} className="text-sm font-medium">
              Description
              <span className="ml-1 font-normal text-muted-foreground">(optional)</span>
            </label>
            <textarea
              id={descriptionId}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What's this collection for?"
              rows={3}
              className={cn(
                "w-full min-w-0 resize-none rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30",
              )}
            />
          </div>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="ghost" />}>Cancel</DialogClose>
            <Button type="submit" disabled={!name.trim() || isSaving}>
              {isSaving ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
