"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown, Clock, Folder, LayoutGrid, Settings, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TypeIcon } from "@/components/dashboard/TypeIcon";
import { UserMenu } from "@/components/dashboard/UserMenu";
import { useSidebar } from "@/components/dashboard/sidebar-context";
import type { CollectionWithStats } from "@/lib/db/collections";
import type { ItemTypeWithCount } from "@/lib/db/items";
import { typeNameToSlug } from "@/lib/item-type-slug";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
  { label: "Collections", href: "/collections", icon: Folder },
  { label: "Favorites", href: "/favorites", icon: Star },
  { label: "Recent", href: "/recent", icon: Clock },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="px-2 pb-1 text-xs font-semibold tracking-wide text-muted-foreground">
      {children}
    </h3>
  );
}

function SectionToggle({
  label,
  isOpen,
  onToggle,
}: {
  label: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={isOpen}
      className="flex w-full items-center justify-between rounded-md px-2 pb-1 text-xs font-semibold tracking-wide text-muted-foreground transition-colors hover:text-foreground"
    >
      <span>{label}</span>
      <ChevronDown className={cn("size-3.5 shrink-0 transition-transform", !isOpen && "-rotate-90")} />
    </button>
  );
}

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
  const [isTypesOpen, setTypesOpen] = useState(true);
  const [isCollectionsOpen, setCollectionsOpen] = useState(true);

  return (
    <div className="flex h-full flex-col justify-between">
      <div className="flex-1 space-y-4 overflow-y-auto p-2">
        <nav className="space-y-0.5">
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

        <div>
          {!collapsed && (
            <SectionToggle
              label="Types"
              isOpen={isTypesOpen}
              onToggle={() => setTypesOpen((open) => !open)}
            />
          )}
          <nav className={cn("space-y-0.5", !collapsed && !isTypesOpen && "hidden")}>
            {itemTypes.map((type) => {
              const isLocked = (type.name === "file" || type.name === "image") && !user.isPro;
              const href = `/items/${typeNameToSlug(type.name)}`;
              const isActive = pathname === href;
              return (
                <Link
                  key={type.id}
                  href={href}
                  title={collapsed ? type.name : undefined}
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
                      <span className="flex-1 truncate">{type.name}</span>
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

        <div>
          {!collapsed && (
            <SectionToggle
              label="Collections"
              isOpen={isCollectionsOpen}
              onToggle={() => setCollectionsOpen((open) => !open)}
            />
          )}
          <div className={cn("space-y-4", !collapsed && !isCollectionsOpen && "hidden")}>
            {favoriteCollections.length > 0 && (
              <div>
                {!collapsed && <SectionLabel>Favorite collections</SectionLabel>}
                <nav className="space-y-0.5">
                  {favoriteCollections.map((collection) => (
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
            )}

            <div>
              {!collapsed && <SectionLabel>Recent collections</SectionLabel>}
              <nav className="space-y-0.5">
                {recentCollections.map((collection) => (
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

        {collapsed ? (
          <>
            <Link
              href="/settings"
              title="Settings"
              className="flex items-center justify-center rounded-md px-0 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Settings className="size-4 shrink-0" />
            </Link>
            <UserMenu user={user} collapsed />
          </>
        ) : (
          <>
            <UserMenu user={user} />
            <Link
              href="/settings"
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Settings className="size-4 shrink-0" />
              <span>Settings</span>
            </Link>
          </>
        )}
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
