"use client";

import { Plus } from "lucide-react";

import { SidebarContent } from "@/components/dashboard/Sidebar";
import { useSidebar } from "@/components/dashboard/sidebar-context";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export function MobileSidebar() {
  const { isMobileOpen, setMobileOpen } = useSidebar();

  return (
    <Sheet open={isMobileOpen} onOpenChange={setMobileOpen}>
      <SheetContent side="left" className="w-72 gap-0 p-0">
        <SheetHeader className="flex-row items-center gap-2 border-b border-border">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
            <Plus className="size-4" />
          </span>
          <SheetTitle>Synapse</SheetTitle>
        </SheetHeader>
        <div className="min-h-0 flex-1">
          <SidebarContent />
        </div>
      </SheetContent>
    </Sheet>
  );
}
