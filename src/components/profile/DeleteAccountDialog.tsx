"use client";

import { useId, useState } from "react";

import { deleteAccount } from "@/actions/profile";
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
  DialogTrigger,
} from "@/components/ui/dialog";

const CONFIRM_TEXT = "delete my account";

export function DeleteAccountDialog() {
  const confirmId = useId();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isPending, setIsPending] = useState(false);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) setConfirmText("");
  }

  async function handleDelete() {
    setIsPending(true);
    try {
      await deleteAccount();
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button variant="destructive">Delete account</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete account</DialogTitle>
          <DialogDescription>
            This permanently deletes your account and everything in it — items, collections and
            tags. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1">
          <label htmlFor={confirmId} className="text-sm font-medium">
            Type &ldquo;{CONFIRM_TEXT}&rdquo; to confirm
          </label>
          <Input
            id={confirmId}
            value={confirmText}
            onChange={(event) => setConfirmText(event.target.value)}
            autoComplete="off"
            autoFocus
          />
        </div>
        <DialogFooter>
          <DialogClose render={<Button type="button" variant="ghost" />}>Cancel</DialogClose>
          <Button
            variant="destructive"
            disabled={confirmText.toLowerCase() !== CONFIRM_TEXT || isPending}
            onClick={() => {
              void handleDelete();
            }}
          >
            {isPending ? "Deleting..." : "Delete account"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
