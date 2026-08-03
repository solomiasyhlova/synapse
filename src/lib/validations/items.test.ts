import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const R2_PUBLIC_URL = "https://files.example.com";

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv("R2_PUBLIC_URL", R2_PUBLIC_URL);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("createItemSchema", () => {
  it("accepts a snippet without any file fields", async () => {
    const { createItemSchema } = await import("./items");

    const result = createItemSchema.safeParse({
      typeName: "snippet",
      title: "Hello",
      tags: [],
      collectionIds: [],
    });

    expect(result.success).toBe(true);
  });

  it("requires a URL for link items", async () => {
    const { createItemSchema } = await import("./items");

    const result = createItemSchema.safeParse({
      typeName: "link",
      title: "Docs",
      tags: [],
      collectionIds: [],
    });

    expect(result.success).toBe(false);
  });

  it("requires a fileUrl for file/image items", async () => {
    const { createItemSchema } = await import("./items");

    const result = createItemSchema.safeParse({
      typeName: "file",
      title: "Report",
      tags: [],
      collectionIds: [],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.includes("fileUrl"))).toBe(true);
    }
  });

  it("accepts a fileUrl hosted on the configured R2 public URL", async () => {
    const { createItemSchema } = await import("./items");

    const result = createItemSchema.safeParse({
      typeName: "file",
      title: "Report",
      fileUrl: `${R2_PUBLIC_URL}/user-1/abc123.pdf`,
      fileName: "report.pdf",
      fileSize: 1024,
      tags: [],
      collectionIds: [],
    });

    expect(result.success).toBe(true);
  });

  it("rejects a fileUrl that isn't hosted on the configured R2 public URL (SSRF guard)", async () => {
    const { createItemSchema } = await import("./items");

    const result = createItemSchema.safeParse({
      typeName: "file",
      title: "Report",
      fileUrl: "http://169.254.169.254/latest/meta-data/",
      fileName: "report.pdf",
      fileSize: 1024,
      tags: [],
      collectionIds: [],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.includes("fileUrl"))).toBe(true);
    }
  });
});
