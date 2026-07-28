"use client";

import Link from "next/link";
import { ChevronsUpDown } from "lucide-react";

import { signOutAction } from "@/actions/auth";
import { UserAvatar } from "@/components/dashboard/UserAvatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserMenuProps {
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
  collapsed?: boolean;
}

export function UserMenu({ user, collapsed = false }: UserMenuProps) {
  if (collapsed) {
    return (
      <Link
        href="/profile"
        title={user.name}
        className="flex items-center justify-center rounded-md px-0 py-1.5 transition-colors hover:bg-muted"
      >
        <UserAvatar name={user.name} image={user.image} size="sm" />
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-md px-2 py-1.5">
      <Link href="/profile" className="shrink-0" title="View profile">
        <UserAvatar name={user.name} image={user.image} size="sm" />
      </Link>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{user.name}</p>
        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="User menu"
          className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ChevronsUpDown className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="end">
          <DropdownMenuItem
            variant="destructive"
            onClick={() => {
              void signOutAction();
            }}
          >
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
