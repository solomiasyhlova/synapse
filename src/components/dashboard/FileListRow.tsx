"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Download,
  File as FileIcon,
  FileCode,
  FileJson,
  FileSpreadsheet,
  FileText,
  Pin,
  Star,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { toggleItemFavorite } from "@/actions/items";
import { Button } from "@/components/ui/button";
import { useItemDrawer } from "@/components/dashboard/item-drawer-context";
import type { ItemWithType } from "@/lib/db/items";
import { toastManager } from "@/lib/toast";
import { formatBytes, getFileExtension } from "@/lib/upload-constraints";
import { cn } from "@/lib/utils";

const EXTENSION_ICONS: Record<string, LucideIcon> = {
  ".pdf": FileText,
  ".txt": FileText,
  ".md": FileText,
  ".json": FileJson,
  ".yaml": FileCode,
  ".yml": FileCode,
  ".xml": FileCode,
  ".toml": FileCode,
  ".ini": FileCode,
  ".csv": FileSpreadsheet,
};

function FileTypeIcon({ fileName, className }: { fileName: string | null; className?: string }) {
  const Icon = fileName ? (EXTENSION_ICONS[getFileExtension(fileName)] ?? FileIcon) : FileIcon;
  return <Icon className={className} />;
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function FileListRow({ item }: { item: ItemWithType }) {
  const { openItem } = useItemDrawer();
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(item.isFavorite);

  async function handleToggleFavorite() {
    const next = !isFavorite;
    setIsFavorite(next);

    const result = await toggleItemFavorite(item.id);

    if (result.success) {
      toastManager.add({ title: next ? "Added to favorites" : "Removed from favorites" });
      router.refresh();
    } else {
      setIsFavorite(!next);
      toastManager.add({ title: "Failed to update favorite", description: result.error });
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => openItem(item.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openItem(item.id);
        }
      }}
      className="flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
        <FileTypeIcon fileName={item.fileName} className="size-4 text-muted-foreground" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-medium">{item.fileName ?? item.title}</span>
          {item.isPinned && <Pin className="size-3.5 shrink-0 text-muted-foreground" />}
        </div>
        <div className="flex flex-col gap-0.5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:gap-3">
          {item.fileSize != null && <span>{formatBytes(item.fileSize)}</span>}
          <span>{formatDate(item.createdAt)}</span>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        onClick={(event) => {
          event.stopPropagation();
          void handleToggleFavorite();
        }}
      >
        <Star className={cn("size-3.5", isFavorite && "fill-yellow-400 text-yellow-400")} />
      </Button>
      <Button
        render={<a href={`/api/items/${item.id}/download`} />}
        nativeButton={false}
        variant="ghost"
        size="icon-sm"
        aria-label="Download"
        onClick={(event) => event.stopPropagation()}
      >
        <Download />
      </Button>
    </div>
  );
}
