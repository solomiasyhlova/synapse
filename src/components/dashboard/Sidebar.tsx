"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock, Folder, LayoutGrid, Lock, Settings, Star } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { TypeIcon } from "@/components/dashboard/TypeIcon";
import { useSidebar } from "@/components/dashboard/sidebar-context";
import { collections, currentUser, itemTypes } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
  { label: "Collections", href: "/collections", icon: Folder },
  { label: "Favorites", href: "/favorites", icon: Star },
  { label: "Recent", href: "/recent", icon: Clock },
];

const RECENT_COLLECTIONS_LIMIT = 5;

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="px-2 pb-1 text-xs font-semibold tracking-wide text-muted-foreground">
      {children}
    </h3>
  );
}

interface SidebarContentProps {
  collapsed?: boolean;
}

export function SidebarContent({ collapsed = false }: SidebarContentProps) {
  const pathname = usePathname();

  const favoriteCollections = collections.filter((collection) => collection.isFavorite);
  const recentCollections = [...collections]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, RECENT_COLLECTIONS_LIMIT);

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
          {!collapsed && <SectionLabel>Types</SectionLabel>}
          <nav className="space-y-0.5">
            {itemTypes.map((type) => {
              const isLocked = (type.name === "file" || type.name === "image") && !currentUser.isPro;
              const href = `/items/${type.name}`;
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
                      {isLocked && (
                        <Lock className="size-3 shrink-0 text-muted-foreground" />
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

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
                <Clock className="size-4 shrink-0" />
                {!collapsed && <span className="truncate">{collection.name}</span>}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className="space-y-2 border-t border-border p-2">
        {!currentUser.isPro && !collapsed && (
          <div className="rounded-lg border border-border bg-muted/40 p-3">
            <p className="text-sm font-medium">Upgrade to Pro</p>
            <p className="text-xs text-muted-foreground">
              Unlock files, AI features and unlimited items.
            </p>
          </div>
        )}

        <Link
          href="/settings"
          title={collapsed ? "Settings" : undefined}
          className={cn(
            "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
            collapsed && "justify-center px-0",
          )}
        >
          <Settings className="size-4 shrink-0" />
          {!collapsed && <span>Settings</span>}
        </Link>

        <div
          className={cn(
            "flex items-center gap-2 rounded-md px-2 py-1.5",
            collapsed && "justify-center px-0",
          )}
        >
          <Avatar size="sm">
            <AvatarFallback>{getInitials(currentUser.name)}</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{currentUser.name}</p>
              <p className="truncate text-xs text-muted-foreground">{currentUser.email}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  const { isCollapsed } = useSidebar();

  return (
    <aside
      className={cn(
        "hidden shrink-0 border-r border-border transition-[width] duration-150 md:flex md:flex-col",
        isCollapsed ? "md:w-16" : "md:w-64",
      )}
    >
      <SidebarContent collapsed={isCollapsed} />
    </aside>
  );
}
