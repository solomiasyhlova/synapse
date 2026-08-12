"use client";

import { Download, File as FileIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { CodeEditor } from "@/components/dashboard/CodeEditor";
import { useExplainCode } from "@/components/dashboard/ExplainCode";
import { MarkdownEditor } from "@/components/dashboard/MarkdownEditor";
import type { ItemDetail } from "@/lib/db/items";
import { formatDate } from "@/lib/format";
import { LANGUAGE_TYPES, MARKDOWN_TYPES } from "@/lib/item-type-kinds";
import { formatBytes } from "@/lib/upload-constraints";

interface ItemDrawerViewProps {
  item: ItemDetail;
  isPro: boolean;
}

export function ItemDrawerView({ item, isPro }: ItemDrawerViewProps) {
  const isExplainable = LANGUAGE_TYPES.includes(item.itemType.name);
  const explainState = useExplainCode({
    itemId: item.id,
    title: item.title,
    content: item.content ?? "",
    language: item.language,
  });

  return (
    <div className="flex flex-col gap-5 px-4 pb-4">
      {item.description && (
        <section className="space-y-1.5">
          <h3 className="text-xs font-medium text-muted-foreground">Description</h3>
          <p className="text-sm">{item.description}</p>
        </section>
      )}

      {item.content && (
        <section className="space-y-1.5">
          <h3 className="text-xs font-medium text-muted-foreground">Content</h3>
          {isExplainable ? (
            <CodeEditor
              value={item.content}
              language={item.language}
              readOnly
              explain={{ isPro, ...explainState }}
            />
          ) : MARKDOWN_TYPES.includes(item.itemType.name) ? (
            <MarkdownEditor value={item.content} readOnly />
          ) : (
            <pre className="overflow-x-auto rounded-lg bg-muted p-3 font-mono text-xs whitespace-pre-wrap">
              {item.content}
            </pre>
          )}
        </section>
      )}

      {item.url && (
        <section className="space-y-1.5">
          <h3 className="text-xs font-medium text-muted-foreground">Link</h3>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block truncate text-sm text-primary underline-offset-4 hover:underline"
          >
            {item.url}
          </a>
        </section>
      )}

      {item.fileUrl && (
        <section className="space-y-1.5">
          <h3 className="text-xs font-medium text-muted-foreground">
            {item.itemType.name === "image" ? "Image" : "File"}
          </h3>
          {item.itemType.name === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.fileUrl}
              alt={item.fileName ?? item.title}
              className="max-h-64 w-full rounded-lg border border-border object-contain"
            />
          ) : (
            <div className="flex items-center gap-3 rounded-lg border border-border p-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
                <FileIcon className="size-4 text-muted-foreground" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.fileName ?? "File"}</p>
                {item.fileSize != null && (
                  <p className="text-xs text-muted-foreground">{formatBytes(item.fileSize)}</p>
                )}
              </div>
            </div>
          )}
          <a
            href={`/api/items/${item.id}/download`}
            className="inline-flex items-center gap-1.5 text-sm text-primary underline-offset-4 hover:underline"
          >
            <Download className="size-3.5" />
            Download
          </a>
        </section>
      )}

      {item.tags.length > 0 && (
        <section className="space-y-1.5">
          <h3 className="text-xs font-medium text-muted-foreground">Tags</h3>
          <div className="flex flex-wrap gap-1.5">
            {item.tags.map((tag) => (
              <Badge key={tag.id} variant="secondary">
                {tag.name}
              </Badge>
            ))}
          </div>
        </section>
      )}

      {item.collections.length > 0 && (
        <section className="space-y-1.5">
          <h3 className="text-xs font-medium text-muted-foreground">Collections</h3>
          <div className="flex flex-wrap gap-1.5">
            {item.collections.map((collection) => (
              <Badge key={collection.id} variant="secondary">
                {collection.name}
              </Badge>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-1.5">
        <h3 className="text-xs font-medium text-muted-foreground">Details</h3>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Created</span>
          <span>{formatDate(item.createdAt)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Updated</span>
          <span>{formatDate(item.updatedAt)}</span>
        </div>
      </section>
    </div>
  );
}
