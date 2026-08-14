"use client";

import { Badge } from "@/components/ui/badge";
import type { CollectionOption } from "@/components/dashboard/CollectionSelect";
import { ItemFormFields, type ItemFormValues } from "@/components/dashboard/ItemFormFields";
import type { ItemDetail } from "@/lib/db/items";
import { formatDate } from "@/lib/format";
import { DEFAULT_LANGUAGE } from "@/lib/languages";

export type EditState = ItemFormValues;

export function toEditState(item: ItemDetail): EditState {
  return {
    title: item.title,
    description: item.description ?? "",
    content: item.content ?? "",
    language: item.language ?? DEFAULT_LANGUAGE,
    url: item.url ?? "",
    tags: item.tags.map((tag) => tag.name).join(", "),
    collectionIds: item.collections.map((collection) => collection.id),
  };
}

interface ItemDrawerEditFormProps {
  item: ItemDetail;
  edit: EditState;
  onChange: (edit: EditState) => void;
  collections: CollectionOption[];
  isPro: boolean;
}

export function ItemDrawerEditForm({
  item,
  edit,
  onChange,
  collections,
  isPro,
}: ItemDrawerEditFormProps) {
  return (
    <div className="flex flex-col gap-5 px-4 pb-4">
      <ItemFormFields
        idPrefix="item"
        typeName={item.itemType.name}
        values={edit}
        onChange={onChange}
        collections={collections}
        isPro={isPro}
        fileName={item.fileName}
        contentTextareaClassName="min-h-32"
      />

      <section className="space-y-1.5">
        <h3 className="text-xs font-medium text-muted-foreground">Details</h3>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Type</span>
          <Badge variant="outline" className="capitalize">
            {item.itemType.name}
          </Badge>
        </div>
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
