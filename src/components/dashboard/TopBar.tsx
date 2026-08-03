"use client";

import { Bell, Menu, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CreateItemDialog } from "@/components/dashboard/CreateItemDialog";
import { NewCollectionDialog } from "@/components/dashboard/NewCollectionDialog";
import { useGlobalSearch } from "@/components/dashboard/global-search-context";
import { useSidebar } from "@/components/dashboard/sidebar-context";
import type { CollectionOption } from "@/lib/db/collections";
import type { ItemTypeWithCount } from "@/lib/db/items";

interface TopBarProps {
  itemTypes: ItemTypeWithCount[];
  collections: CollectionOption[];
}

export function TopBar({ itemTypes, collections }: TopBarProps) {
  const { setMobileOpen } = useSidebar();
  const { setOpen: setSearchOpen } = useGlobalSearch();

  return (
    <div className="flex flex-1 items-center gap-4 px-4">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Open sidebar"
        className="md:hidden"
        onClick={() => setMobileOpen(true)}
      >
        <Menu />
      </Button>
      <button
        type="button"
        onClick={() => setSearchOpen(true)}
        className="relative h-8 max-w-md flex-1 rounded-lg border border-input bg-transparent pr-12 pl-8 text-left text-sm text-muted-foreground transition-colors hover:bg-input/30 dark:bg-input/30 dark:hover:bg-input/50"
      >
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        Search content, tags, titles...
        <kbd className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
          ⌘K
        </kbd>
      </button>
      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell />
        </Button>
        <NewCollectionDialog />
        <CreateItemDialog itemTypes={itemTypes} collections={collections} />
      </div>
    </div>
  );
}
