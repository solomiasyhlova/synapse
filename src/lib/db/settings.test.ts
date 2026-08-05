import { describe, expect, it, vi } from "vitest";

const findUnique = vi.fn();
const update = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique, update },
  },
}));

const { getEditorPreferences, updateEditorPreferences } = await import("./settings");

describe("getEditorPreferences", () => {
  it("returns the defaults when the user has no stored preferences", async () => {
    findUnique.mockResolvedValueOnce({ editorPreferences: null });

    const result = await getEditorPreferences("user-1");

    expect(findUnique).toHaveBeenCalledWith({
      where: { id: "user-1" },
      select: { editorPreferences: true },
    });
    expect(result).toEqual({
      fontSize: 13,
      tabSize: 2,
      wordWrap: true,
      minimap: false,
      theme: "vs-dark",
    });
  });

  it("merges stored preferences over the defaults", async () => {
    findUnique.mockResolvedValueOnce({
      editorPreferences: { fontSize: 18, theme: "monokai" },
    });

    const result = await getEditorPreferences("user-1");

    expect(result).toEqual({
      fontSize: 18,
      tabSize: 2,
      wordWrap: true,
      minimap: false,
      theme: "monokai",
    });
  });

  it("falls back to the defaults when the user isn't found", async () => {
    findUnique.mockResolvedValueOnce(null);

    const result = await getEditorPreferences("user-1");

    expect(result.theme).toBe("vs-dark");
  });
});

describe("updateEditorPreferences", () => {
  it("persists the preferences scoped to the user and returns them", async () => {
    const preferences = {
      fontSize: 16,
      tabSize: 4,
      wordWrap: false,
      minimap: true,
      theme: "github-dark" as const,
    };
    update.mockResolvedValueOnce({});

    const result = await updateEditorPreferences("user-1", preferences);

    expect(update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { editorPreferences: preferences },
    });
    expect(result).toEqual(preferences);
  });
});
