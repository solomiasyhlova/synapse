"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { SectionToggle } from "@/components/dashboard/SidebarSectionControls";
import { TypeIcon } from "@/components/dashboard/TypeIcon";
import type { ItemTypeWithCount } from "@/lib/db/items";
import { typeNameToSlug } from "@/lib/item-type-slug";
import { cn } from "@/lib/utils";

interface TypesNavListProps {
  collapsed: boolean;
  itemTypes: ItemTypeWithCount[];
  isPro: boolean;
}

export function TypesNavList({ collapsed, itemTypes, isPro }: TypesNavListProps) {
  const pathname = usePathname();
  const [isOpen, setOpen] = useState(true);

  return (
    <div>
      {!collapsed && (
        <SectionToggle label="Types" isOpen={isOpen} onToggle={() => setOpen((open) => !open)} />
      )}
      <nav className={cn("space-y-1", !collapsed && !isOpen && "hidden")}>
        {itemTypes.map((type) => {
          const isLocked = (type.name === "file" || type.name === "image") && !isPro;
          const href = `/items/${typeNameToSlug(type.name)}`;
          const isActive = pathname === href;
          return (
            <Link
              key={type.id}
              href={href}
              title={collapsed ? typeNameToSlug(type.name) : undefined}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm capitalize transition-colors",
                isActive
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                collapsed && "justify-center px-0",
              )}
            >
              <TypeIcon
                name={type.icon}
                className="size-4 shrink-0"
                style={{ color: type.color }}
              />
              {!collapsed && (
                <>
                  <span className="flex-1 truncate">{typeNameToSlug(type.name)}</span>
                  {isLocked ? (
                    <Badge
                      variant="outline"
                      className="h-4 shrink-0 px-1.5 text-[10px] font-semibold tracking-wide text-muted-foreground"
                    >
                      PRO
                    </Badge>
                  ) : (
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {type.itemCount}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
