"use client";

import { Bell, Menu, Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSidebar } from "@/components/dashboard/sidebar-context";

export function TopBar() {
  const { setMobileOpen } = useSidebar();

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
      <div className="relative max-w-md flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search content, tags, titles..."
          className="pl-8"
        />
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell />
        </Button>
        <Button>
          <Plus />
          New item
        </Button>
      </div>
    </div>
  );
}
