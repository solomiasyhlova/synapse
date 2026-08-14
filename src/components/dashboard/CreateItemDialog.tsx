"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { createItem } from "@/actions/items";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { CollectionOption } from "@/components/dashboard/CollectionSelect";
import { FileUpload, type UploadedFile } from "@/components/dashboard/FileUpload";
import { ItemFormFields, type ItemFormValues } from "@/components/dashboard/ItemFormFields";
import { ItemTypeSelector } from "@/components/dashboard/ItemTypeSelector";
import type { ItemTypeWithCount } from "@/lib/db/items";
import { CONTENT_TYPES, FILE_TYPES, LANGUAGE_TYPES } from "@/lib/item-type-kinds";
import { DEFAULT_LANGUAGE } from "@/lib/languages";
import { parseTagsInput } from "@/lib/tags";
import { toastManager } from "@/lib/toast";

const EMPTY_FORM: ItemFormValues & { file: UploadedFile | null } = {
  title: "",
  description: "",
  content: "",
  language: DEFAULT_LANGUAGE,
  url: "",
  tags: "",
  file: null,
  collectionIds: [],
};

interface CreateItemDialogProps {
  itemTypes: ItemTypeWithCount[];
  collections: CollectionOption[];
  defaultTypeName?: string;
  trigger?: React.ReactElement;
  isPro: boolean;
}

export function CreateItemDialog({
  itemTypes,
  collections,
  defaultTypeName,
  trigger,
  isPro,
}: CreateItemDialogProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [typeName, setTypeName] = useState(defaultTypeName ?? itemTypes[0]?.name ?? "");
  const [form, setForm] = useState(EMPTY_FORM);
  const [isCreating, setIsCreating] = useState(false);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) {
      setTypeName(defaultTypeName ?? itemTypes[0]?.name ?? "");
    } else {
      setForm(EMPTY_FORM);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsCreating(true);

    const isContentType = CONTENT_TYPES.includes(typeName);
    const isLanguageType = LANGUAGE_TYPES.includes(typeName);
    const isUrlType = typeName === "link";
    const isFileType = FILE_TYPES.includes(typeName);

    const result = await createItem({
      typeName,
      title: form.title,
      description: form.description.trim() ? form.description : null,
      content: isContentType ? form.content : null,
      language: isLanguageType ? form.language.trim() || null : null,
      url: isUrlType ? form.url.trim() || null : null,
      fileUrl: isFileType ? (form.file?.fileUrl ?? null) : null,
      fileName: isFileType ? (form.file?.fileName ?? null) : null,
      fileSize: isFileType ? (form.file?.fileSize ?? null) : null,
      tags: parseTagsInput(form.tags),
      collectionIds: form.collectionIds,
    });

    setIsCreating(false);

    if (result.success) {
      toastManager.add({ title: "Item created" });
      handleOpenChange(false);
      router.refresh();
    } else {
      toastManager.add({ title: "Failed to create item", description: result.error });
    }
  }

  const isUrlType = typeName === "link";
  const isFileType = FILE_TYPES.includes(typeName);
  const canSubmit =
    form.title.trim().length > 0 &&
    (!isUrlType || form.url.trim().length > 0) &&
    (!isFileType || form.file !== null);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          trigger ?? (
            <Button aria-label="New item">
              <Plus />
              <span className="hidden sm:inline">New item</span>
            </Button>
          )
        }
      />
      <DialogContent className="max-w-lg gap-3">
        <DialogHeader>
          <DialogTitle>New item</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <ItemTypeSelector
            itemTypes={itemTypes}
            value={typeName}
            onChange={(nextTypeName) => {
              if (nextTypeName !== typeName) {
                setForm((prev) => ({ ...prev, file: null }));
              }
              setTypeName(nextTypeName);
            }}
          />

          <ItemFormFields
            idPrefix="create-item"
            variant="create"
            typeName={typeName}
            values={form}
            onChange={(values) => setForm((prev) => ({ ...prev, ...values }))}
            collections={collections}
            isPro={isPro}
            fileName={form.file?.fileName ?? null}
            beforeTags={
              isFileType && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">
                    {typeName === "image" ? "Image" : "File"}
                  </label>
                  <FileUpload
                    kind={typeName as "file" | "image"}
                    value={form.file}
                    onChange={(file) => setForm((prev) => ({ ...prev, file }))}
                  />
                </div>
              )
            }
          />

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="ghost" />}>Cancel</DialogClose>
            <Button type="submit" disabled={!canSubmit || isCreating}>
              {isCreating ? "Creating..." : "Create item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
