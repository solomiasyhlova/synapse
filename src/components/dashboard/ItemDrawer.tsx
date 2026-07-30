"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Pencil, Pin, Star, Trash2 } from "lucide-react";

import { deleteItem, updateItem } from "@/actions/items";
import { Badge } from "@/components/ui/badge";
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
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { CodeEditor } from "@/components/dashboard/CodeEditor";
import { MarkdownEditor } from "@/components/dashboard/MarkdownEditor";
import { TypeIcon } from "@/components/dashboard/TypeIcon";
import { useItemDrawer } from "@/components/dashboard/item-drawer-context";
import type { ItemDetail } from "@/lib/db/items";
import { toastManager } from "@/lib/toast";
import { cn } from "@/lib/utils";

const CONTENT_TYPES = ["snippet", "prompt", "command", "note"];
const LANGUAGE_TYPES = ["snippet", "command"];
const MARKDOWN_TYPES = ["note", "prompt"];

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

interface EditState {
  title: string;
  description: string;
  content: string;
  language: string;
  url: string;
  tags: string;
}

function toEditState(item: ItemDetail): EditState {
  return {
    title: item.title,
    description: item.description ?? "",
    content: item.content ?? "",
    language: item.language ?? "",
    url: item.url ?? "",
    tags: item.tags.map((tag) => tag.name).join(", "),
  };
}

export function ItemDrawer() {
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
      tags: edit.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
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
                <SheetTitle className="text-lg">{item.title}</SheetTitle>
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
          {isEditing ? (
            <div className="ml-auto flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={handleCancel} disabled={isSaving}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving || !edit?.title.trim()}>
                Save
              </Button>
            </div>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                className={cn(item?.isFavorite && "text-yellow-400")}
              >
                <Star className={cn("size-4", item?.isFavorite && "fill-yellow-400")} />
                Favorite
              </Button>
              <Button variant="ghost" size="sm">
                <Pin className="size-4" />
                Pin
              </Button>
              <Button variant="ghost" size="sm" onClick={handleCopy} disabled={!item}>
                <Copy className="size-4" />
                Copy
              </Button>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={handleEdit} disabled={!item}>
                  <Pencil className="size-4" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  disabled={!item}
                >
                  <Trash2 className="size-4" />
                  Delete
                </Button>
              </div>
            </>
          )}
        </div>

        {isEditing && item && edit ? (
          <div className="flex flex-col gap-5 px-4 pb-4">
            <section className="space-y-1.5">
              <label htmlFor="item-title" className="text-xs font-medium text-muted-foreground">
                Title
              </label>
              <Input
                id="item-title"
                value={edit.title}
                onChange={(e) => setEdit({ ...edit, title: e.target.value })}
              />
            </section>

            <section className="space-y-1.5">
              <label
                htmlFor="item-description"
                className="text-xs font-medium text-muted-foreground"
              >
                Description
              </label>
              <Textarea
                id="item-description"
                value={edit.description}
                onChange={(e) => setEdit({ ...edit, description: e.target.value })}
              />
            </section>

            {CONTENT_TYPES.includes(item.itemType.name) && (
              <section className="space-y-1.5">
                <label
                  htmlFor="item-content"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Content
                </label>
                {LANGUAGE_TYPES.includes(item.itemType.name) ? (
                  <CodeEditor
                    value={edit.content}
                    language={edit.language}
                    onChange={(value) => setEdit({ ...edit, content: value })}
                  />
                ) : MARKDOWN_TYPES.includes(item.itemType.name) ? (
                  <MarkdownEditor
                    value={edit.content}
                    onChange={(value) => setEdit({ ...edit, content: value })}
                  />
                ) : (
                  <Textarea
                    id="item-content"
                    className="min-h-32 font-mono text-xs"
                    value={edit.content}
                    onChange={(e) => setEdit({ ...edit, content: e.target.value })}
                  />
                )}
              </section>
            )}

            {LANGUAGE_TYPES.includes(item.itemType.name) && (
              <section className="space-y-1.5">
                <label
                  htmlFor="item-language"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Language
                </label>
                <Input
                  id="item-language"
                  value={edit.language}
                  onChange={(e) => setEdit({ ...edit, language: e.target.value })}
                />
              </section>
            )}

            {item.itemType.name === "link" && (
              <section className="space-y-1.5">
                <label htmlFor="item-url" className="text-xs font-medium text-muted-foreground">
                  URL
                </label>
                <Input
                  id="item-url"
                  value={edit.url}
                  onChange={(e) => setEdit({ ...edit, url: e.target.value })}
                />
              </section>
            )}

            <section className="space-y-1.5">
              <label htmlFor="item-tags" className="text-xs font-medium text-muted-foreground">
                Tags
              </label>
              <Input
                id="item-tags"
                placeholder="comma, separated, tags"
                value={edit.tags}
                onChange={(e) => setEdit({ ...edit, tags: e.target.value })}
              />
            </section>

            <section className="space-y-1.5">
              <h3 className="text-xs font-medium text-muted-foreground">Details</h3>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Type</span>
                <Badge variant="outline" className="capitalize">
                  {item.itemType.name}
                </Badge>
              </div>
              {item.collections.length > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Collections</span>
                  <div className="flex flex-wrap justify-end gap-1.5">
                    {item.collections.map((collection) => (
                      <Badge key={collection.id} variant="secondary">
                        {collection.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Created</span>
                <span>{formatDate(item.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Updated</span>
                <span>{formatDate(item.updatedAt)}</span>
              </div>
            </section>
          </div>
        ) : item ? (
          <div className="flex flex-col gap-5 px-4 pb-4">
            {item.description && (
              <section className="space-y-1.5">
                <h3 className="text-xs font-medium text-muted-foreground">Description</h3>
                <p className="text-sm">{item.description}</p>
              </section>
            )}

            {item.content && (
              <section className="space-y-1.5">
                <h3 className="text-xs font-medium text-muted-foreground">Content</h3>
                {LANGUAGE_TYPES.includes(item.itemType.name) ? (
                  <CodeEditor value={item.content} language={item.language} readOnly />
                ) : MARKDOWN_TYPES.includes(item.itemType.name) ? (
                  <MarkdownEditor value={item.content} readOnly />
                ) : (
                  <pre className="overflow-x-auto rounded-lg bg-muted p-3 font-mono text-xs whitespace-pre-wrap">
                    {item.content}
                  </pre>
                )}
              </section>
            )}

            {item.url && (
              <section className="space-y-1.5">
                <h3 className="text-xs font-medium text-muted-foreground">Link</h3>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block truncate text-sm text-primary underline-offset-4 hover:underline"
                >
                  {item.url}
                </a>
              </section>
            )}

            {item.fileUrl && (
              <section className="space-y-1.5">
                <h3 className="text-xs font-medium text-muted-foreground">File</h3>
                <a
                  href={item.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block truncate text-sm text-primary underline-offset-4 hover:underline"
                >
                  {item.fileName ?? item.fileUrl}
                </a>
              </section>
            )}

            {item.tags.length > 0 && (
              <section className="space-y-1.5">
                <h3 className="text-xs font-medium text-muted-foreground">Tags</h3>
                <div className="flex flex-wrap gap-1.5">
                  {item.tags.map((tag) => (
                    <Badge key={tag.id} variant="secondary">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </section>
            )}

            {item.collections.length > 0 && (
              <section className="space-y-1.5">
                <h3 className="text-xs font-medium text-muted-foreground">Collections</h3>
                <div className="flex flex-wrap gap-1.5">
                  {item.collections.map((collection) => (
                    <Badge key={collection.id} variant="secondary">
                      {collection.name}
                    </Badge>
                  ))}
                </div>
              </section>
            )}

            <section className="space-y-1.5">
              <h3 className="text-xs font-medium text-muted-foreground">Details</h3>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Created</span>
                <span>{formatDate(item.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Updated</span>
                <span>{formatDate(item.updatedAt)}</span>
              </div>
            </section>
          </div>
        ) : (
          <div className="flex flex-col gap-5 px-4 pb-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        )}
      </SheetContent>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete item</DialogTitle>
            <DialogDescription>
              This permanently deletes &ldquo;{item?.title}&rdquo;. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="ghost" />}>Cancel</DialogClose>
            <Button variant="destructive" disabled={isDeleting} onClick={() => void handleDelete()}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sheet>
  );
}
