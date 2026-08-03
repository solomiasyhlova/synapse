"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { TypeIcon } from "@/components/dashboard/TypeIcon";
import { useGlobalSearch } from "@/components/dashboard/global-search-context";
import { useItemDrawer } from "@/components/dashboard/item-drawer-context";
import type { CollectionWithStats } from "@/lib/db/collections";
import type { SearchableItem } from "@/lib/db/items";

interface GlobalSearchProps {
  items: SearchableItem[];
  collections: CollectionWithStats[];
}

export function GlobalSearch({ items, collections }: GlobalSearchProps) {
  const { isOpen, setOpen } = useGlobalSearch();
  const { openItem } = useItemDrawer();
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen(!isOpen);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, setOpen]);

  function handleSelectItem(item: SearchableItem) {
    setOpen(false);
    openItem(item.id);
  }

  function handleSelectCollection(collection: CollectionWithStats) {
    setOpen(false);
    router.push(`/collections/${collection.id}`);
  }

  return (
    <CommandDialog open={isOpen} onOpenChange={setOpen} className="max-w-lg">
      <CommandInput placeholder="Search items and collections..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Items">
          {items.map((item) => (
            <CommandItem
              key={item.id}
              value={`${item.title} ${item.contentPreview ?? ""} ${item.id}`}
              onSelect={() => handleSelectItem(item)}
            >
              <TypeIcon
                name={item.itemType.icon}
                className="size-4 shrink-0"
                style={{ color: item.itemType.color }}
              />
              <div className="min-w-0 flex-1">
                <div className="truncate">{item.title}</div>
                {item.contentPreview && (
                  <div className="truncate text-xs text-muted-foreground">
                    {item.contentPreview}
                  </div>
                )}
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Collections">
          {collections.map((collection) => (
            <CommandItem
              key={collection.id}
              value={`${collection.name} ${collection.id}`}
              onSelect={() => handleSelectCollection(collection)}
            >
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: collection.accentColor ?? "var(--color-muted-foreground)" }}
              />
              <span className="min-w-0 flex-1 truncate">{collection.name}</span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {collection.itemCount} {collection.itemCount === 1 ? "item" : "items"}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
