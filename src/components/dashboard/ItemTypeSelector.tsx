"use client";

import { TypeIcon } from "@/components/dashboard/TypeIcon";
import type { ItemTypeWithCount } from "@/lib/db/items";
import { cn } from "@/lib/utils";

interface ItemTypeSelectorProps {
  itemTypes: ItemTypeWithCount[];
  value: string;
  onChange: (typeName: string) => void;
}

export function ItemTypeSelector({ itemTypes, value, onChange }: ItemTypeSelectorProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {itemTypes.map((type) => {
        const isSelected = type.name === value;
        return (
          <button
            key={type.id}
            type="button"
            onClick={() => onChange(type.name)}
            className={cn(
              "flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-sm capitalize transition-colors",
              isSelected
                ? "border-transparent bg-muted text-foreground"
                : "border-border text-muted-foreground hover:bg-muted/50",
            )}
          >
            <TypeIcon name={type.icon} className="size-4" style={{ color: type.color }} />
            {type.name}
          </button>
        );
      })}
    </div>
  );
}
