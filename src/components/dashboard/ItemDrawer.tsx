"use client";

import { useEffect, useState } from "react";
import { Copy, Pencil, Pin, Star, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { TypeIcon } from "@/components/dashboard/TypeIcon";
import { useItemDrawer } from "@/components/dashboard/item-drawer-context";
import type { ItemDetail } from "@/lib/db/items";
import { toastManager } from "@/lib/toast";
import { cn } from "@/lib/utils";

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function ItemDrawer() {
  const { openItemId, isOpen, close } = useItemDrawer();
  const [item, setItem] = useState<ItemDetail | null>(null);

  useEffect(() => {
    if (!openItemId) return;

    let cancelled = false;
    setItem(null);

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

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && close()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
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

        <div className="flex items-center gap-1 border-b border-border px-4 pb-4">
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
          <div className="ml-auto flex items-center gap-1">
            <Button variant="ghost" size="sm">
              <Pencil className="size-4" />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="size-4" />
              Delete
            </Button>
          </div>
        </div>

        {item ? (
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
                <pre className="overflow-x-auto rounded-lg bg-muted p-3 font-mono text-xs whitespace-pre-wrap">
                  {item.content}
                </pre>
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
    </Sheet>
  );
}
