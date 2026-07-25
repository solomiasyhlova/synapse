import { Bell, Plus, Search } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { currentUser } from "@/lib/mock-data";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function TopBar() {
  return (
    <div className="flex flex-1 items-center gap-4 px-4">
      <div className="relative max-w-md flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search content, tags, titles..."
          className="pl-8"
        />
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell />
        </Button>
        <Button>
          <Plus />
          New item
        </Button>
        <Avatar>
          <AvatarFallback>{getInitials(currentUser.name)}</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}
