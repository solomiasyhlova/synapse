export const UPLOAD_CONSTRAINTS = {
  image: {
    label: "image",
    maxSize: 5 * 1024 * 1024,
    mimeByExtension: {
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".svg": "image/svg+xml",
    },
  },
  file: {
    label: "file",
    maxSize: 10 * 1024 * 1024,
    mimeByExtension: {
      ".pdf": "application/pdf",
      ".txt": "text/plain",
      ".md": "text/markdown",
      ".json": "application/json",
      ".yaml": "application/x-yaml",
      ".yml": "application/x-yaml",
      ".xml": "application/xml",
      ".csv": "text/csv",
      ".toml": "application/toml",
      ".ini": "text/plain",
    },
  },
} as const;

export type UploadKind = keyof typeof UPLOAD_CONSTRAINTS;

export function isUploadKind(value: unknown): value is UploadKind {
  return value === "image" || value === "file";
}

export function getFileExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf(".");
  return lastDot === -1 ? "" : fileName.slice(lastDot).toLowerCase();
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`;
}

export function getMimeType(kind: UploadKind, extension: string): string {
  const mimeByExtension: Record<string, string> = UPLOAD_CONSTRAINTS[kind].mimeByExtension;
  return mimeByExtension[extension] ?? "application/octet-stream";
}

export function validateUploadFile(
  kind: UploadKind,
  fileName: string,
  fileSize: number,
): string | null {
  const constraints = UPLOAD_CONSTRAINTS[kind];
  const extension = getFileExtension(fileName);
  const extensions = Object.keys(constraints.mimeByExtension);

  if (!extensions.includes(extension)) {
    return `Unsupported file type. Allowed: ${extensions.join(", ")}`;
  }
  if (fileSize > constraints.maxSize) {
    return `File is too large. Max size is ${formatBytes(constraints.maxSize)}`;
  }
  return null;
}
