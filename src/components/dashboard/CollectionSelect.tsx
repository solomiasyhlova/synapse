"use client";

import type { CollectionOption } from "@/lib/db/collections";
import { cn } from "@/lib/utils";

export type { CollectionOption };

interface CollectionSelectProps {
  collections: CollectionOption[];
  value: string[];
  onChange: (ids: string[]) => void;
}

export function CollectionSelect({ collections, value, onChange }: CollectionSelectProps) {
  function toggle(id: string) {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  }

  if (collections.length === 0) {
    return <p className="text-sm text-muted-foreground">No collections yet.</p>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {collections.map((collection) => {
        const isSelected = value.includes(collection.id);
        return (
          <button
            key={collection.id}
            type="button"
            onClick={() => toggle(collection.id)}
            className={cn(
              "rounded-md border px-2.5 py-1.5 text-sm transition-colors",
              isSelected
                ? "border-transparent bg-muted text-foreground"
                : "border-border text-muted-foreground hover:bg-muted/50",
            )}
          >
            {collection.name}
          </button>
        );
      })}
    </div>
  );
}
