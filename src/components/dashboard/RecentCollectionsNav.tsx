"use client";

import Link from "next/link";

import { SectionLabel } from "@/components/dashboard/SidebarSectionControls";
import type { CollectionWithStats } from "@/lib/db/collections";
import { cn } from "@/lib/utils";

interface RecentCollectionsNavProps {
  collapsed: boolean;
  collections: CollectionWithStats[];
}

export function RecentCollectionsNav({ collapsed, collections }: RecentCollectionsNavProps) {
  return (
    <div>
      {!collapsed && <SectionLabel>Recent</SectionLabel>}
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
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: collection.accentColor ?? "var(--color-muted-foreground)" }}
            />
            {!collapsed && <span className="truncate">{collection.name}</span>}
          </Link>
        ))}
      </nav>
      {!collapsed && (
        <Link
          href="/collections"
          className="block px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          View all collections
        </Link>
      )}
    </div>
  );
}
