"use client";

import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/dashboard/sidebar-context";
import { cn } from "@/lib/utils";

export function Logo() {
  const { isCollapsed, toggleCollapsed } = useSidebar();

  return (
    <div
      className={cn(
        "hidden shrink-0 items-center gap-2 border-r border-border px-4 transition-[width] duration-150 md:flex",
        isCollapsed ? "md:w-16 md:justify-center md:px-2" : "md:w-64",
      )}
    >
      {!isCollapsed && (
        <>
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
            <Plus className="size-4" />
          </span>
          <span className="flex-1 font-semibold">Synapse</span>
        </>
      )}
      <Button
        variant="ghost"
        size="icon"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        onClick={toggleCollapsed}
      >
        {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
      </Button>
    </div>
  );
}
