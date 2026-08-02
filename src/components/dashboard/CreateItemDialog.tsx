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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload, type UploadedFile } from "@/components/dashboard/FileUpload";
import { ItemContentField } from "@/components/dashboard/ItemContentField";
import { TypeIcon } from "@/components/dashboard/TypeIcon";
import type { ItemTypeWithCount } from "@/lib/db/items";
import { CONTENT_TYPES, FILE_TYPES, LANGUAGE_TYPES } from "@/lib/item-type-kinds";
import { toastManager } from "@/lib/toast";
import { cn } from "@/lib/utils";

const EMPTY_FORM = {
  title: "",
  description: "",
  content: "",
  language: "",
  url: "",
  tags: "",
  file: null as UploadedFile | null,
};

interface CreateItemDialogProps {
  itemTypes: ItemTypeWithCount[];
  defaultTypeName?: string;
  trigger?: React.ReactElement;
}

export function CreateItemDialog({ itemTypes, defaultTypeName, trigger }: CreateItemDialogProps) {
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
      tags: form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
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
            <Button>
              <Plus />
              New item
            </Button>
          )
        }
      />
      <DialogContent className="max-w-lg gap-3">
        <DialogHeader>
          <DialogTitle>New item</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <div className="flex flex-wrap gap-1.5">
            {itemTypes.map((type) => {
              const isSelected = type.name === typeName;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => {
                    if (type.name !== typeName) {
                      setForm((prev) => ({ ...prev, file: null }));
                    }
                    setTypeName(type.name);
                  }}
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

          <div className="flex flex-col gap-1.5">
            <label htmlFor="create-item-title" className="text-sm font-medium">
              Title
            </label>
            <Input
              id="create-item-title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. useDebounce hook"
              required
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="create-item-description" className="text-sm font-medium">
              Description
              <span className="ml-1 font-normal text-muted-foreground">(optional)</span>
            </label>
            <Textarea
              id="create-item-description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What's this for?"
              rows={2}
            />
          </div>

          {CONTENT_TYPES.includes(typeName) && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="create-item-content" className="text-sm font-medium">
                Content
              </label>
              <ItemContentField
                id="create-item-content"
                typeName={typeName}
                value={form.content}
                language={form.language}
                onChange={(content) => setForm({ ...form, content })}
              />
            </div>
          )}

          {LANGUAGE_TYPES.includes(typeName) && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="create-item-language" className="text-sm font-medium">
                Language
                <span className="ml-1 font-normal text-muted-foreground">(optional)</span>
              </label>
              <Input
                id="create-item-language"
                value={form.language}
                onChange={(e) => setForm({ ...form, language: e.target.value })}
                placeholder="e.g. typescript"
              />
            </div>
          )}

          {isUrlType && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="create-item-url" className="text-sm font-medium">
                URL
              </label>
              <Input
                id="create-item-url"
                type="url"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="https://example.com"
                required
              />
            </div>
          )}

          {isFileType && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">{typeName === "image" ? "Image" : "File"}</label>
              <FileUpload
                kind={typeName as "file" | "image"}
                value={form.file}
                onChange={(file) => setForm({ ...form, file })}
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="create-item-tags" className="text-sm font-medium">
              Tags
              <span className="ml-1 font-normal text-muted-foreground">(optional)</span>
            </label>
            <Input
              id="create-item-tags"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="comma, separated, tags"
            />
          </div>

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
