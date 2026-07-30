import { describe, expect, it, vi } from "vitest";

const findFirst = vi.fn();
const update = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    item: { findFirst, update },
  },
}));

const { getItemById, updateItem } = await import("./items");

describe("getItemById", () => {
  it("returns null when the item isn't found or isn't owned by the user", async () => {
    findFirst.mockResolvedValueOnce(null);

    const result = await getItemById("user-1", "item-1");

    expect(result).toBeNull();
    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "item-1", userId: "user-1" } }),
    );
  });

  it("flattens joined collections into plain collection objects", async () => {
    findFirst.mockResolvedValueOnce({
      id: "item-1",
      title: "useAuth Hook",
      description: null,
      isFavorite: false,
      isPinned: false,
      updatedAt: new Date("2024-01-15"),
      createdAt: new Date("2024-01-15"),
      contentType: "TEXT",
      content: "export function useAuth() {}",
      url: null,
      fileUrl: null,
      fileName: null,
      fileSize: null,
      language: "typescript",
      itemType: { id: "type-1", name: "snippet", icon: "Code", color: "#3b82f6" },
      tags: [{ id: "tag-1", name: "react" }],
      collections: [
        { collection: { id: "col-1", name: "React Patterns" } },
        { collection: { id: "col-2", name: "Hooks" } },
      ],
    });

    const result = await getItemById("user-1", "item-1");

    expect(result?.collections).toEqual([
      { id: "col-1", name: "React Patterns" },
      { id: "col-2", name: "Hooks" },
    ]);
    expect(result?.tags).toEqual([{ id: "tag-1", name: "react" }]);
  });
});

describe("updateItem", () => {
  it("returns null when the item isn't found or isn't owned by the user", async () => {
    findFirst.mockResolvedValueOnce(null);

    const result = await updateItem("user-1", "item-1", {
      title: "New title",
      tags: [],
    });

    expect(result).toBeNull();
    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "item-1", userId: "user-1" } }),
    );
    expect(update).not.toHaveBeenCalled();
  });

  it("disconnects existing tags and connects-or-creates the new ones", async () => {
    findFirst.mockResolvedValueOnce({ id: "item-1" });
    update.mockResolvedValueOnce({
      id: "item-1",
      title: "New title",
      description: null,
      isFavorite: false,
      isPinned: false,
      updatedAt: new Date("2024-01-16"),
      createdAt: new Date("2024-01-15"),
      contentType: "TEXT",
      content: "export function useAuth() {}",
      url: null,
      fileUrl: null,
      fileName: null,
      fileSize: null,
      language: "typescript",
      itemType: { id: "type-1", name: "snippet", icon: "Code", color: "#3b82f6" },
      tags: [{ id: "tag-2", name: "hooks" }],
      collections: [{ collection: { id: "col-1", name: "React Patterns" } }],
    });

    const result = await updateItem("user-1", "item-1", {
      title: "New title",
      description: null,
      content: "export function useAuth() {}",
      language: "typescript",
      tags: ["hooks"],
    });

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "item-1" },
        data: expect.objectContaining({
          title: "New title",
          tags: {
            set: [],
            connectOrCreate: [
              {
                where: { userId_name: { userId: "user-1", name: "hooks" } },
                create: { name: "hooks", userId: "user-1" },
              },
            ],
          },
        }),
      }),
    );
    expect(result?.collections).toEqual([{ id: "col-1", name: "React Patterns" }]);
  });
});
