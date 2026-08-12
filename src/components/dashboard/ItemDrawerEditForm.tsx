"use client";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CollectionSelect, type CollectionOption } from "@/components/dashboard/CollectionSelect";
import { DescriptionSuggestButton, useDescriptionSuggestion } from "@/components/dashboard/DescriptionSuggestion";
import { ItemContentField } from "@/components/dashboard/ItemContentField";
import { LanguageSelect } from "@/components/dashboard/LanguageSelect";
import { TagSuggestButton, TagSuggestionChips, useTagSuggestions } from "@/components/dashboard/TagSuggestions";
import type { ItemDetail } from "@/lib/db/items";
import { formatDate } from "@/lib/format";
import { CONTENT_TYPES, FILE_TYPES, LANGUAGE_TYPES } from "@/lib/item-type-kinds";
import { DEFAULT_LANGUAGE } from "@/lib/languages";
import { appendTag, parseTagsInput } from "@/lib/tags";

export interface EditState {
  title: string;
  description: string;
  content: string;
  language: string;
  url: string;
  tags: string;
  collectionIds: string[];
}

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
  const isContentType = CONTENT_TYPES.includes(item.itemType.name);
  const isUrlType = item.itemType.name === "link";
  const isFileType = FILE_TYPES.includes(item.itemType.name);
  const aiContent = (isContentType ? edit.content : edit.description) || edit.url || null;
  const tagSuggestions = useTagSuggestions({
    title: edit.title,
    content: aiContent,
    existingTags: parseTagsInput(edit.tags),
    onAccept: (tag) => onChange({ ...edit, tags: appendTag(edit.tags, tag) }),
  });
  const descriptionSuggestion = useDescriptionSuggestion({
    title: edit.title,
    content: isContentType ? edit.content : null,
    url: isUrlType ? edit.url : null,
    fileName: isFileType ? item.fileName : null,
    onGenerate: (description) => onChange({ ...edit, description }),
  });

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
        <div className="flex items-center justify-between">
          <label htmlFor="item-description" className="text-xs font-medium text-muted-foreground">
            Description
          </label>
          <DescriptionSuggestButton
            isPro={isPro}
            isLoading={descriptionSuggestion.isLoading}
            disabled={!edit.title.trim()}
            onClick={() => void descriptionSuggestion.suggest()}
          />
        </div>
        <Textarea
          id="item-description"
          value={edit.description}
          onChange={(e) => onChange({ ...edit, description: e.target.value })}
        />
      </section>

      {LANGUAGE_TYPES.includes(item.itemType.name) && (
        <section className="space-y-1.5">
          <label htmlFor="item-language" className="text-xs font-medium text-muted-foreground">
            Language
          </label>
          <LanguageSelect
            id="item-language"
            value={edit.language}
            onChange={(language) => onChange({ ...edit, language })}
          />
        </section>
      )}

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
        <div className="flex items-center justify-between">
          <label htmlFor="item-tags" className="text-xs font-medium text-muted-foreground">
            Tags
          </label>
          <TagSuggestButton
            isPro={isPro}
            isLoading={tagSuggestions.isLoading}
            disabled={!edit.title.trim()}
            onClick={() => void tagSuggestions.suggest()}
          />
        </div>
        <Input
          id="item-tags"
          placeholder="comma, separated, tags"
          value={edit.tags}
          onChange={(e) => onChange({ ...edit, tags: e.target.value })}
        />
        <TagSuggestionChips
          suggestions={tagSuggestions.suggestions}
          onAccept={tagSuggestions.accept}
          onReject={tagSuggestions.reject}
        />
      </section>

      <section className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Collections</label>
        <CollectionSelect
          collections={collections}
          value={edit.collectionIds}
          onChange={(collectionIds) => onChange({ ...edit, collectionIds })}
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
