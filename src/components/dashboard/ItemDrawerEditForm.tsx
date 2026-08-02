"use client";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ItemContentField } from "@/components/dashboard/ItemContentField";
import type { ItemDetail } from "@/lib/db/items";
import { formatDate } from "@/lib/format";
import { CONTENT_TYPES, LANGUAGE_TYPES } from "@/lib/item-type-kinds";

export interface EditState {
  title: string;
  description: string;
  content: string;
  language: string;
  url: string;
  tags: string;
}

export function toEditState(item: ItemDetail): EditState {
  return {
    title: item.title,
    description: item.description ?? "",
    content: item.content ?? "",
    language: item.language ?? "",
    url: item.url ?? "",
    tags: item.tags.map((tag) => tag.name).join(", "),
  };
}

interface ItemDrawerEditFormProps {
  item: ItemDetail;
  edit: EditState;
  onChange: (edit: EditState) => void;
}

export function ItemDrawerEditForm({ item, edit, onChange }: ItemDrawerEditFormProps) {
  return (
    <div className="flex flex-col gap-5 px-4 pb-4">
      <section className="space-y-1.5">
        <label htmlFor="item-title" className="text-xs font-medium text-muted-foreground">
          Title
        </label>
        <Input
          id="item-title"
          value={edit.title}
          onChange={(e) => onChange({ ...edit, title: e.target.value })}
        />
      </section>

      <section className="space-y-1.5">
        <label htmlFor="item-description" className="text-xs font-medium text-muted-foreground">
          Description
        </label>
        <Textarea
          id="item-description"
          value={edit.description}
          onChange={(e) => onChange({ ...edit, description: e.target.value })}
        />
      </section>

      {CONTENT_TYPES.includes(item.itemType.name) && (
        <section className="space-y-1.5">
          <label htmlFor="item-content" className="text-xs font-medium text-muted-foreground">
            Content
          </label>
          <ItemContentField
            id="item-content"
            typeName={item.itemType.name}
            value={edit.content}
            language={edit.language}
            onChange={(content) => onChange({ ...edit, content })}
            textareaClassName="min-h-32"
          />
        </section>
      )}

      {LANGUAGE_TYPES.includes(item.itemType.name) && (
        <section className="space-y-1.5">
          <label htmlFor="item-language" className="text-xs font-medium text-muted-foreground">
            Language
          </label>
          <Input
            id="item-language"
            value={edit.language}
            onChange={(e) => onChange({ ...edit, language: e.target.value })}
          />
        </section>
      )}

      {item.itemType.name === "link" && (
        <section className="space-y-1.5">
          <label htmlFor="item-url" className="text-xs font-medium text-muted-foreground">
            URL
          </label>
          <Input
            id="item-url"
            value={edit.url}
            onChange={(e) => onChange({ ...edit, url: e.target.value })}
          />
        </section>
      )}

      <section className="space-y-1.5">
        <label htmlFor="item-tags" className="text-xs font-medium text-muted-foreground">
          Tags
        </label>
        <Input
          id="item-tags"
          placeholder="comma, separated, tags"
          value={edit.tags}
          onChange={(e) => onChange({ ...edit, tags: e.target.value })}
        />
      </section>

      <section className="space-y-1.5">
        <h3 className="text-xs font-medium text-muted-foreground">Details</h3>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Type</span>
          <Badge variant="outline" className="capitalize">
            {item.itemType.name}
          </Badge>
        </div>
        {item.collections.length > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Collections</span>
            <div className="flex flex-wrap justify-end gap-1.5">
              {item.collections.map((collection) => (
                <Badge key={collection.id} variant="secondary">
                  {collection.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
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
