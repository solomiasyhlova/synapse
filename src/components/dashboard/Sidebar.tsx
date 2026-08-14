"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Clock, Folder, LayoutGrid, Star } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { FavoriteCollectionsNav } from "@/components/dashboard/FavoriteCollectionsNav";
import { RecentCollectionsNav } from "@/components/dashboard/RecentCollectionsNav";
import { SectionToggle } from "@/components/dashboard/SidebarSectionControls";
import { TypesNavList } from "@/components/dashboard/TypesNavList";
import { UserMenu } from "@/components/dashboard/UserMenu";
import { useSidebar } from "@/components/dashboard/sidebar-context";
import type { CollectionWithStats } from "@/lib/db/collections";
import type { ItemTypeWithCount } from "@/lib/db/items";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
  { label: "Collections", href: "/collections", icon: Folder },
  { label: "Favorites", href: "/favorites", icon: Star },
  { label: "Recent", href: "/recent", icon: Clock },
];

export interface SidebarUser {
  name: string;
  email: string;
  image?: string | null;
  isPro: boolean;
}

interface SidebarContentProps {
  collapsed?: boolean;
  itemTypes: ItemTypeWithCount[];
  favoriteCollections: CollectionWithStats[];
  recentCollections: CollectionWithStats[];
  user: SidebarUser;
}

export function SidebarContent({
  collapsed = false,
  itemTypes,
  favoriteCollections,
  recentCollections,
  user,
}: SidebarContentProps) {
  const pathname = usePathname();
  const [isCollectionsOpen, setCollectionsOpen] = useState(true);

  return (
    <div className="flex h-full flex-col justify-between">
      <div className="flex-1 space-y-4 overflow-y-auto p-2">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  collapsed && "justify-center px-0",
                )}
              >
                <item.icon className="size-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <Separator />

        <TypesNavList collapsed={collapsed} itemTypes={itemTypes} isPro={user.isPro} />

        <div>
          {!collapsed && (
            <SectionToggle
              label="Collections"
              isOpen={isCollectionsOpen}
              onToggle={() => setCollectionsOpen((open) => !open)}
            />
          )}
          <div className={cn("space-y-3", !collapsed && !isCollectionsOpen && "hidden")}>
            <FavoriteCollectionsNav collapsed={collapsed} collections={favoriteCollections} />
            <RecentCollectionsNav collapsed={collapsed} collections={recentCollections} />
          </div>
        </div>
      </div>

      <div className="space-y-2 border-t border-border p-2">
        {!user.isPro && !collapsed && (
          <div className="rounded-lg border border-border bg-muted/40 p-3">
            <p className="text-sm font-medium">Upgrade to Pro</p>
            <p className="text-xs text-muted-foreground">
              Unlock files, AI features and unlimited items.
            </p>
          </div>
        )}

        <UserMenu user={user} collapsed={collapsed} />
      </div>
    </div>
  );
}

interface SidebarProps {
  itemTypes: ItemTypeWithCount[];
  favoriteCollections: CollectionWithStats[];
  recentCollections: CollectionWithStats[];
  user: SidebarUser;
}

export function Sidebar({ itemTypes, favoriteCollections, recentCollections, user }: SidebarProps) {
  const { isCollapsed } = useSidebar();

  return (
    <aside
      className={cn(
        "hidden h-full shrink-0 border-r border-border transition-[width] duration-150 md:flex md:flex-col",
        isCollapsed ? "md:w-16" : "md:w-64",
      )}
    >
      <SidebarContent
        collapsed={isCollapsed}
        itemTypes={itemTypes}
        favoriteCollections={favoriteCollections}
        recentCollections={recentCollections}
        user={user}
      />
    </aside>
  );
}
