"use client";

import type { ReactNode } from "react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CollectionSelect, type CollectionOption } from "@/components/dashboard/CollectionSelect";
import { DescriptionSuggestButton, useDescriptionSuggestion } from "@/components/dashboard/DescriptionSuggestion";
import { ItemContentField } from "@/components/dashboard/ItemContentField";
import { LanguageSelect } from "@/components/dashboard/LanguageSelect";
import { usePromptOptimize } from "@/components/dashboard/PromptOptimizer";
import { TagSuggestButton, TagSuggestionChips, useTagSuggestions } from "@/components/dashboard/TagSuggestions";
import { CONTENT_TYPES, FILE_TYPES, LANGUAGE_TYPES } from "@/lib/item-type-kinds";
import { appendTag, parseTagsInput } from "@/lib/tags";

export interface ItemFormValues {
  title: string;
  description: string;
  content: string;
  language: string;
  url: string;
  tags: string;
  collectionIds: string[];
}

interface ItemFormFieldsProps {
  idPrefix: string;
  typeName: string;
  values: ItemFormValues;
  onChange: (values: ItemFormValues) => void;
  collections: CollectionOption[];
  isPro: boolean;
  fileName?: string | null;
  contentTextareaClassName?: string;
  variant?: "create" | "edit";
  beforeTags?: ReactNode;
}

export function ItemFormFields({
  idPrefix,
  typeName,
  values,
  onChange,
  collections,
  isPro,
  fileName = null,
  contentTextareaClassName,
  variant = "edit",
  beforeTags,
}: ItemFormFieldsProps) {
  const isCreate = variant === "create";
  const labelClassName = isCreate
    ? "text-sm font-medium"
    : "text-xs font-medium text-muted-foreground";

  const isContentType = CONTENT_TYPES.includes(typeName);
  const isLanguageType = LANGUAGE_TYPES.includes(typeName);
  const isUrlType = typeName === "link";
  const isFileType = FILE_TYPES.includes(typeName);

  const aiContent = (isContentType ? values.content : values.description) || values.url || null;
  const tagSuggestions = useTagSuggestions({
    title: values.title,
    content: aiContent,
    existingTags: parseTagsInput(values.tags),
    onAccept: (tag) => onChange({ ...values, tags: appendTag(values.tags, tag) }),
  });
  const descriptionSuggestion = useDescriptionSuggestion({
    title: values.title,
    content: isContentType ? values.content : null,
    url: isUrlType ? values.url : null,
    fileName: isFileType ? fileName : null,
    onGenerate: (description) => onChange({ ...values, description }),
  });
  const promptOptimize = usePromptOptimize({
    title: values.title,
    content: values.content,
    onAccept: (optimized) => onChange({ ...values, content: optimized }),
  });

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${idPrefix}-title`} className={labelClassName}>
          Title
        </label>
        <Input
          id={`${idPrefix}-title`}
          value={values.title}
          onChange={(e) => onChange({ ...values, title: e.target.value })}
          placeholder={isCreate ? "e.g. useDebounce hook" : undefined}
          required
          autoFocus={isCreate}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor={`${idPrefix}-description`} className={labelClassName}>
            Description
            {isCreate && <span className="ml-1 font-normal text-muted-foreground">(optional)</span>}
          </label>
          <DescriptionSuggestButton
            isPro={isPro}
            isLoading={descriptionSuggestion.isLoading}
            disabled={!values.title.trim()}
            onClick={() => void descriptionSuggestion.suggest()}
          />
        </div>
        <Textarea
          id={`${idPrefix}-description`}
          value={values.description}
          onChange={(e) => onChange({ ...values, description: e.target.value })}
          placeholder={isCreate ? "What's this for?" : undefined}
          rows={2}
        />
      </div>

      {isLanguageType && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${idPrefix}-language`} className={labelClassName}>
            Language
          </label>
          <LanguageSelect
            id={`${idPrefix}-language`}
            value={values.language}
            onChange={(language) => onChange({ ...values, language })}
          />
        </div>
      )}

      {isContentType && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${idPrefix}-content`} className={labelClassName}>
            Content
          </label>
          <ItemContentField
            id={`${idPrefix}-content`}
            typeName={typeName}
            value={values.content}
            language={values.language}
            onChange={(content) => onChange({ ...values, content })}
            textareaClassName={contentTextareaClassName}
            optimize={typeName === "prompt" ? { isPro, ...promptOptimize } : undefined}
          />
        </div>
      )}

      {isUrlType && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${idPrefix}-url`} className={labelClassName}>
            URL
          </label>
          <Input
            id={`${idPrefix}-url`}
            type="url"
            value={values.url}
            onChange={(e) => onChange({ ...values, url: e.target.value })}
            placeholder={isCreate ? "https://example.com" : undefined}
            required={isCreate}
          />
        </div>
      )}

      {beforeTags}

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor={`${idPrefix}-tags`} className={labelClassName}>
            Tags
            {isCreate && <span className="ml-1 font-normal text-muted-foreground">(optional)</span>}
          </label>
          <TagSuggestButton
            isPro={isPro}
            isLoading={tagSuggestions.isLoading}
            disabled={!values.title.trim()}
            onClick={() => void tagSuggestions.suggest()}
          />
        </div>
        <Input
          id={`${idPrefix}-tags`}
          value={values.tags}
          onChange={(e) => onChange({ ...values, tags: e.target.value })}
          placeholder="comma, separated, tags"
        />
        <TagSuggestionChips
          suggestions={tagSuggestions.suggestions}
          onAccept={tagSuggestions.accept}
          onReject={tagSuggestions.reject}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClassName}>
          Collections
          {isCreate && <span className="ml-1 font-normal text-muted-foreground">(optional)</span>}
        </label>
        <CollectionSelect
          collections={collections}
          value={values.collectionIds}
          onChange={(collectionIds) => onChange({ ...values, collectionIds })}
        />
      </div>
    </>
  );
}
