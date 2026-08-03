import { describe, expect, it, vi } from "vitest";

const create = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    collection: { create },
  },
}));

const { createCollection } = await import("./collections");

describe("createCollection", () => {
  it("creates the collection scoped to the user and returns fresh stats", async () => {
    create.mockResolvedValueOnce({
      id: "col-1",
      name: "React Patterns",
      description: "Snippets and notes for React.",
      isFavorite: false,
    });

    const result = await createCollection("user-1", {
      name: "React Patterns",
      description: "Snippets and notes for React.",
    });

    expect(create).toHaveBeenCalledWith({
      data: {
        userId: "user-1",
        name: "React Patterns",
        description: "Snippets and notes for React.",
      },
    });
    expect(result).toEqual({
      id: "col-1",
      name: "React Patterns",
      description: "Snippets and notes for React.",
      isFavorite: false,
      itemCount: 0,
      accentColor: null,
      types: [],
    });
  });

  it("defaults a missing description to null", async () => {
    create.mockResolvedValueOnce({
      id: "col-2",
      name: "Untitled",
      description: null,
      isFavorite: false,
    });

    await createCollection("user-1", { name: "Untitled" });

    expect(create).toHaveBeenCalledWith({
      data: { userId: "user-1", name: "Untitled", description: null },
    });
  });
});
