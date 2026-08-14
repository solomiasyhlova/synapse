"use client";

import Link from "next/link";
import { Star } from "lucide-react";

import { SectionLabel } from "@/components/dashboard/SidebarSectionControls";
import type { CollectionWithStats } from "@/lib/db/collections";
import { cn } from "@/lib/utils";

interface FavoriteCollectionsNavProps {
  collapsed: boolean;
  collections: CollectionWithStats[];
}

export function FavoriteCollectionsNav({ collapsed, collections }: FavoriteCollectionsNavProps) {
  if (collections.length === 0) return null;

  return (
    <div>
      {!collapsed && <SectionLabel>Favorites</SectionLabel>}
      <nav className="space-y-1">
        {collections.map((collection) => (
          <Link
            key={collection.id}
            href={`/collections/${collection.id}`}
            title={collapsed ? collection.name : undefined}
            className={cn(
              "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
              collapsed && "justify-center px-0",
            )}
          >
            <Star className="size-4 shrink-0 fill-yellow-400 text-yellow-400" />
            {!collapsed && <span className="truncate">{collection.name}</span>}
          </Link>
        ))}
      </nav>
    </div>
  );
}
