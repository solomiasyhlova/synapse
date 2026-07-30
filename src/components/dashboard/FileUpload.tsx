"use client";

import { useRef, useState, type DragEvent } from "react";
import { File as FileIcon, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatBytes, UPLOAD_CONSTRAINTS, validateUploadFile } from "@/lib/upload-constraints";
import type { UploadKind } from "@/lib/upload-constraints";
import { toastManager } from "@/lib/toast";
import { cn } from "@/lib/utils";

export interface UploadedFile {
  fileUrl: string;
  fileName: string;
  fileSize: number;
}

interface UploadResponse {
  success: boolean;
  data?: UploadedFile;
  error?: string;
}

interface FileUploadProps {
  kind: UploadKind;
  value: UploadedFile | null;
  onChange: (file: UploadedFile | null) => void;
}

export function FileUpload({ kind, value, onChange }: FileUploadProps) {
  const constraints = UPLOAD_CONSTRAINTS[kind];
  const extensions = Object.keys(constraints.mimeByExtension);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);

  function upload(file: File) {
    const error = validateUploadFile(kind, file.name, file.size);
    if (error) {
      toastManager.add({ title: "Upload failed", description: error });
      return;
    }

    setProgress(0);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("kind", kind);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload");

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        setProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      setProgress(null);
      let result: UploadResponse | null = null;
      try {
        result = JSON.parse(xhr.responseText);
      } catch {
        // fall through to the generic error below
      }

      if (result?.success && result.data) {
        onChange(result.data);
      } else {
        toastManager.add({
          title: "Upload failed",
          description: result?.error ?? "Unexpected server response",
        });
      }
    };

    xhr.onerror = () => {
      setProgress(null);
      toastManager.add({ title: "Upload failed", description: "Network error" });
    };

    xhr.send(formData);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) upload(file);
  }

  if (value) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-border p-3">
        {kind === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value.fileUrl}
            alt={value.fileName}
            className="size-12 shrink-0 rounded-md object-cover"
          />
        ) : (
          <span className="flex size-12 shrink-0 items-center justify-center rounded-md bg-muted">
            <FileIcon className="size-5 text-muted-foreground" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{value.fileName}</p>
          <p className="text-xs text-muted-foreground">{formatBytes(value.fileSize)}</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={() => onChange(null)}
        >
          <X className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => progress === null && inputRef.current?.click()}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed p-6 text-center transition-colors",
        isDragging ? "border-primary bg-muted/50" : "border-border hover:bg-muted/30",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={extensions.join(",")}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
          e.target.value = "";
        }}
      />
      <Upload className="size-5 text-muted-foreground" />
      {progress !== null ? (
        <div className="w-full max-w-52 space-y-1">
          <p className="text-xs text-muted-foreground">Uploading... {progress}%</p>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : (
        <>
          <p className="text-sm">
            <span className="font-medium text-primary">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-muted-foreground">
            {extensions.join(", ")} up to {formatBytes(constraints.maxSize)}
          </p>
        </>
      )}
    </div>
  );
}
