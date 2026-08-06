"use client";

import Link from "next/link";
import { Bell, Menu, Search, Star } from "lucide-react";

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
        aria-label="Search content, tags, titles"
        className="relative h-8 w-8 shrink-0 rounded-lg border border-input bg-transparent text-left text-sm text-muted-foreground transition-colors hover:bg-input/30 sm:w-auto sm:max-w-md sm:flex-1 sm:pr-12 sm:pl-8 dark:bg-input/30 dark:hover:bg-input/50"
      >
        <Search className="pointer-events-none absolute top-1/2 left-1/2 size-4 -translate-x-1/2 -translate-y-1/2 text-muted-foreground sm:left-2.5 sm:translate-x-0" />
        <span className="hidden sm:inline">Search content, tags, titles...</span>
        <kbd className="pointer-events-none absolute top-1/2 right-2.5 hidden -translate-y-1/2 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground sm:block">
          ⌘K
        </kbd>
      </button>
      <div className="ml-auto flex items-center gap-2">
        <Button
          render={<Link href="/favorites" />}
          nativeButton={false}
          variant="ghost"
          size="icon"
          aria-label="Favorites"
        >
          <Star />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          title="Notifications coming soon"
          disabled
        >
          <Bell />
        </Button>
        <NewCollectionDialog />
        <CreateItemDialog itemTypes={itemTypes} collections={collections} />
      </div>
    </div>
  );
}
