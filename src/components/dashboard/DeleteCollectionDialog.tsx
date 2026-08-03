"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DeleteCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collectionName?: string;
  isDeleting: boolean;
  onConfirm: () => void;
}

export function DeleteCollectionDialog({
  open,
  onOpenChange,
  collectionName,
  isDeleting,
  onConfirm,
}: DeleteCollectionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete collection</DialogTitle>
          <DialogDescription>
            This permanently deletes &ldquo;{collectionName}&rdquo;. Items in this collection are
            not deleted — they&apos;ll just no longer belong to it. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button type="button" variant="ghost" />}>Cancel</DialogClose>
          <Button variant="destructive" disabled={isDeleting} onClick={onConfirm}>
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
