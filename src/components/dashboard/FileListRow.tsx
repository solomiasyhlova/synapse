"use client";

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

import { Button } from "@/components/ui/button";
import { useItemDrawer } from "@/components/dashboard/item-drawer-context";
import { useItemFavorite } from "@/components/dashboard/use-item-favorite";
import { useOpenItemProps } from "@/components/dashboard/use-open-item-props";
import type { ItemWithType } from "@/lib/db/items";
import { formatShortDate } from "@/lib/format";
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

export function FileListRow({ item }: { item: ItemWithType }) {
  const { openItem } = useItemDrawer();
  const { isFavorite, toggle: handleToggleFavorite } = useItemFavorite(item.id, item.isFavorite);
  const openItemProps = useOpenItemProps(openItem, item.id);

  return (
    <div
      {...openItemProps}
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
          <span>{formatShortDate(item.createdAt, { includeYear: true })}</span>
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
