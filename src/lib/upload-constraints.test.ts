import { describe, expect, it } from "vitest";

import {
  formatBytes,
  getFileExtension,
  getMimeType,
  isUploadKind,
  UPLOAD_CONSTRAINTS,
  validateUploadFile,
} from "./upload-constraints";

describe("getFileExtension", () => {
  it("returns the lowercased extension including the dot", () => {
    expect(getFileExtension("Report.PDF")).toBe(".pdf");
  });

  it("returns an empty string when there is no extension", () => {
    expect(getFileExtension("README")).toBe("");
  });
});

describe("formatBytes", () => {
  it("formats sizes under 1 KB as whole bytes", () => {
    expect(formatBytes(512)).toBe("512 B");
  });

  it("formats kilobytes and megabytes with one decimal", () => {
    expect(formatBytes(1536)).toBe("1.5 KB");
    expect(formatBytes(5 * 1024 * 1024)).toBe("5.0 MB");
  });
});

describe("getMimeType", () => {
  it("resolves the mime type for a known extension", () => {
    expect(getMimeType("image", ".png")).toBe("image/png");
    expect(getMimeType("file", ".json")).toBe("application/json");
  });

  it("falls back to application/octet-stream for an unknown extension", () => {
    expect(getMimeType("file", ".exe")).toBe("application/octet-stream");
  });
});

describe("isUploadKind", () => {
  it("accepts only 'file' or 'image'", () => {
    expect(isUploadKind("file")).toBe(true);
    expect(isUploadKind("image")).toBe(true);
    expect(isUploadKind("snippet")).toBe(false);
    expect(isUploadKind(null)).toBe(false);
  });
});

describe("validateUploadFile", () => {
  it("returns null for a valid file within size and extension limits", () => {
    expect(validateUploadFile("image", "photo.png", 1024)).toBeNull();
  });

  it("rejects an unsupported extension", () => {
    const error = validateUploadFile("file", "script.exe", 1024);
    expect(error).toMatch(/Unsupported file type/);
  });

  it("rejects a file over the kind's max size", () => {
    const error = validateUploadFile("image", "photo.png", UPLOAD_CONSTRAINTS.image.maxSize + 1);
    expect(error).toMatch(/too large/);
  });
});
