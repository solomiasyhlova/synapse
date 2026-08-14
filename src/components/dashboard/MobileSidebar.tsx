"use client";

import { Folder } from "lucide-react";

import { SidebarContent, type SidebarUser } from "@/components/dashboard/Sidebar";
import { useSidebar } from "@/components/dashboard/sidebar-context";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { CollectionWithStats } from "@/lib/db/collections";
import type { ItemTypeWithCount } from "@/lib/db/items";

interface MobileSidebarProps {
  itemTypes: ItemTypeWithCount[];
  favoriteCollections: CollectionWithStats[];
  recentCollections: CollectionWithStats[];
  user: SidebarUser;
}

export function MobileSidebar({
  itemTypes,
  favoriteCollections,
  recentCollections,
  user,
}: MobileSidebarProps) {
  const { isMobileOpen, setMobileOpen } = useSidebar();

  return (
    <Sheet open={isMobileOpen} onOpenChange={setMobileOpen}>
      <SheetContent side="left" className="w-72 gap-0 p-0">
        <SheetHeader className="flex-row items-center gap-2 border-b border-border">
          <Folder className="size-5 text-[#6366f1]" aria-hidden="true" />
          <SheetTitle>Synapse</SheetTitle>
        </SheetHeader>
        <div className="min-h-0 flex-1">
          <SidebarContent
            itemTypes={itemTypes}
            favoriteCollections={favoriteCollections}
            recentCollections={recentCollections}
            user={user}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
