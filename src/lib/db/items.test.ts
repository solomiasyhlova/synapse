import { describe, expect, it, vi } from "vitest";

const findFirst = vi.fn();
const findMany = vi.fn();
const count = vi.fn();
const create = vi.fn();
const update = vi.fn();
const deleteFn = vi.fn();
const itemTypeFindFirst = vi.fn();
const collectionFindMany = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    item: { findFirst, findMany, count, create, update, delete: deleteFn },
    itemType: { findFirst: itemTypeFindFirst },
    collection: { findMany: collectionFindMany },
  },
}));

const {
  createItem,
  deleteItem,
  getFavoriteItems,
  getItemById,
  getItemsByCollection,
  getItemsByType,
  getSearchableItems,
  toggleItemFavorite,
  updateItem,
} = await import("./items");

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

describe("getItemsByType", () => {
  it("fetches only the requested page's worth of items, scoped to the type", async () => {
    findMany.mockResolvedValueOnce([{ id: "item-1" }]);
    count.mockResolvedValueOnce(43);

    const result = await getItemsByType("user-1", "snippet", 2);

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user-1", itemType: { name: "snippet" } },
        skip: 21,
        take: 21,
      }),
    );
    expect(count).toHaveBeenCalledWith({
      where: { userId: "user-1", itemType: { name: "snippet" } },
    });
    expect(result).toEqual({
      items: [{ id: "item-1" }],
      page: 2,
      totalPages: 3,
      totalCount: 43,
    });
  });

  it("defaults to page 1", async () => {
    findMany.mockResolvedValueOnce([]);
    count.mockResolvedValueOnce(0);

    const result = await getItemsByType("user-1", "snippet");

    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 0, take: 21 }));
    expect(result.page).toBe(1);
    expect(result.totalPages).toBe(1);
  });
});

describe("getItemsByCollection", () => {
  it("fetches only the requested page's worth of items in the collection", async () => {
    findMany.mockResolvedValueOnce([{ id: "item-1" }]);
    count.mockResolvedValueOnce(5);

    const result = await getItemsByCollection("user-1", "col-1", 1);

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user-1", collections: { some: { collectionId: "col-1" } } },
        skip: 0,
        take: 21,
      }),
    );
    expect(result.totalCount).toBe(5);
    expect(result.totalPages).toBe(1);
  });
});

describe("createItem", () => {
  it("returns null when the item type isn't found", async () => {
    itemTypeFindFirst.mockResolvedValueOnce(null);

    const result = await createItem("user-1", "snippet", {
      title: "New snippet",
      tags: [],
      collectionIds: [],
    });

    expect(result).toBeNull();
    expect(create).not.toHaveBeenCalled();
  });

  it("creates the item under the resolved type and connects-or-creates tags", async () => {
    itemTypeFindFirst.mockResolvedValueOnce({
      id: "type-1",
      name: "snippet",
      icon: "Code",
      color: "#3b82f6",
    });
    create.mockResolvedValueOnce({
      id: "item-1",
      title: "New snippet",
      description: null,
      isFavorite: false,
      isPinned: false,
      updatedAt: new Date("2024-01-16"),
      createdAt: new Date("2024-01-16"),
      contentType: "TEXT",
      content: "console.log('hi')",
      url: null,
      fileUrl: null,
      fileName: null,
      fileSize: null,
      language: "typescript",
      itemType: { id: "type-1", name: "snippet", icon: "Code", color: "#3b82f6" },
      tags: [{ id: "tag-1", name: "js" }],
      collections: [],
    });

    const result = await createItem("user-1", "snippet", {
      title: "New snippet",
      content: "console.log('hi')",
      language: "typescript",
      tags: ["js"],
      collectionIds: [],
    });

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          title: "New snippet",
          itemTypeId: "type-1",
          contentType: "TEXT",
          tags: {
            connectOrCreate: [
              {
                where: { userId_name: { userId: "user-1", name: "js" } },
                create: { name: "js", userId: "user-1" },
              },
            ],
          },
        }),
      }),
    );
    expect(result?.collections).toEqual([]);
  });

  it("only links collections owned by the user, ignoring ids that don't belong to them", async () => {
    itemTypeFindFirst.mockResolvedValueOnce({
      id: "type-1",
      name: "snippet",
      icon: "Code",
      color: "#3b82f6",
    });
    collectionFindMany.mockResolvedValueOnce([{ id: "col-1" }]);
    create.mockResolvedValueOnce({
      id: "item-1",
      title: "New snippet",
      description: null,
      isFavorite: false,
      isPinned: false,
      updatedAt: new Date("2024-01-16"),
      createdAt: new Date("2024-01-16"),
      contentType: "TEXT",
      content: null,
      url: null,
      fileUrl: null,
      fileName: null,
      fileSize: null,
      language: null,
      itemType: { id: "type-1", name: "snippet", icon: "Code", color: "#3b82f6" },
      tags: [],
      collections: [{ collection: { id: "col-1", name: "React Patterns" } }],
    });

    await createItem("user-1", "snippet", {
      title: "New snippet",
      tags: [],
      collectionIds: ["col-1", "not-owned"],
    });

    expect(collectionFindMany).toHaveBeenCalledWith({
      where: { id: { in: ["col-1", "not-owned"] }, userId: "user-1" },
      select: { id: true },
    });
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          collections: { create: [{ collectionId: "col-1" }] },
        }),
      }),
    );
  });

  it("stores the URL content type for link items", async () => {
    itemTypeFindFirst.mockResolvedValueOnce({
      id: "type-2",
      name: "link",
      icon: "Link",
      color: "#10b981",
    });
    create.mockResolvedValueOnce({
      id: "item-2",
      title: "Docs",
      description: null,
      isFavorite: false,
      isPinned: false,
      updatedAt: new Date("2024-01-16"),
      createdAt: new Date("2024-01-16"),
      contentType: "URL",
      content: null,
      url: "https://example.com",
      fileUrl: null,
      fileName: null,
      fileSize: null,
      language: null,
      itemType: { id: "type-2", name: "link", icon: "Link", color: "#10b981" },
      tags: [],
      collections: [],
    });

    await createItem("user-1", "link", {
      title: "Docs",
      url: "https://example.com",
      tags: [],
      collectionIds: [],
    });

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ contentType: "URL", url: "https://example.com" }),
      }),
    );
  });

  it("stores the FILE content type and file metadata for image items", async () => {
    itemTypeFindFirst.mockResolvedValueOnce({
      id: "type-3",
      name: "image",
      icon: "Image",
      color: "#ec4899",
    });
    create.mockResolvedValueOnce({
      id: "item-3",
      title: "Diagram",
      description: null,
      isFavorite: false,
      isPinned: false,
      updatedAt: new Date("2024-01-16"),
      createdAt: new Date("2024-01-16"),
      contentType: "FILE",
      content: null,
      url: null,
      fileUrl: "https://files.example.com/diagram.png",
      fileName: "diagram.png",
      fileSize: 1024,
      language: null,
      itemType: { id: "type-3", name: "image", icon: "Image", color: "#ec4899" },
      tags: [],
      collections: [],
    });

    await createItem("user-1", "image", {
      title: "Diagram",
      fileUrl: "https://files.example.com/diagram.png",
      fileName: "diagram.png",
      fileSize: 1024,
      tags: [],
      collectionIds: [],
    });

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          contentType: "FILE",
          fileUrl: "https://files.example.com/diagram.png",
          fileName: "diagram.png",
          fileSize: 1024,
        }),
      }),
    );
  });
});

describe("updateItem", () => {
  it("returns null when the item isn't found or isn't owned by the user", async () => {
    findFirst.mockResolvedValueOnce(null);

    const result = await updateItem("user-1", "item-1", {
      title: "New title",
      tags: [],
      collectionIds: [],
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
      collectionIds: [],
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

  it("reconciles collections to the new selection, filtering out ids the user doesn't own", async () => {
    findFirst.mockResolvedValueOnce({ id: "item-1" });
    collectionFindMany.mockResolvedValueOnce([{ id: "col-2" }]);
    update.mockResolvedValueOnce({
      id: "item-1",
      title: "New title",
      description: null,
      isFavorite: false,
      isPinned: false,
      updatedAt: new Date("2024-01-16"),
      createdAt: new Date("2024-01-15"),
      contentType: "TEXT",
      content: null,
      url: null,
      fileUrl: null,
      fileName: null,
      fileSize: null,
      language: null,
      itemType: { id: "type-1", name: "snippet", icon: "Code", color: "#3b82f6" },
      tags: [],
      collections: [{ collection: { id: "col-2", name: "Hooks" } }],
    });

    const result = await updateItem("user-1", "item-1", {
      title: "New title",
      tags: [],
      collectionIds: ["col-2", "not-owned"],
    });

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "item-1" },
        data: expect.objectContaining({
          collections: { deleteMany: {}, create: [{ collectionId: "col-2" }] },
        }),
      }),
    );
    expect(result?.collections).toEqual([{ id: "col-2", name: "Hooks" }]);
  });
});

describe("getSearchableItems", () => {
  const itemType = { id: "type-1", name: "snippet", icon: "Code", color: "#3b82f6" };

  it("prefers content for the preview when present", async () => {
    findMany.mockResolvedValueOnce([
      {
        id: "item-1",
        title: "useAuth Hook",
        content: "export function useAuth() {}",
        description: "A hook",
        url: null,
        itemType,
      },
    ]);

    const result = await getSearchableItems("user-1");

    expect(result).toEqual([
      {
        id: "item-1",
        title: "useAuth Hook",
        contentPreview: "export function useAuth() {}",
        itemType,
      },
    ]);
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: "user-1" } }));
  });

  it("falls back to description, then url, when content is missing", async () => {
    findMany.mockResolvedValueOnce([
      { id: "item-1", title: "Docs", content: null, description: "Great docs", url: null, itemType },
      { id: "item-2", title: "Repo", content: null, description: null, url: "https://example.com", itemType },
      { id: "item-3", title: "Empty", content: null, description: null, url: null, itemType },
    ]);

    const result = await getSearchableItems("user-1");

    expect(result.map((item) => item.contentPreview)).toEqual([
      "Great docs",
      "https://example.com",
      null,
    ]);
  });

  it("truncates long content previews to 140 characters", async () => {
    findMany.mockResolvedValueOnce([
      { id: "item-1", title: "Long", content: "a".repeat(200), description: null, url: null, itemType },
    ]);

    const result = await getSearchableItems("user-1");

    expect(result[0].contentPreview).toHaveLength(140);
  });
});

describe("getFavoriteItems", () => {
  it("fetches only favorited items, sorted by most recently updated", async () => {
    findMany.mockResolvedValueOnce([{ id: "item-1", isFavorite: true }]);

    const result = await getFavoriteItems("user-1");

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user-1", isFavorite: true },
        orderBy: { updatedAt: "desc" },
      }),
    );
    expect(result).toEqual([{ id: "item-1", isFavorite: true }]);
  });
});

describe("toggleItemFavorite", () => {
  it("returns null when the item isn't found or isn't owned by the user", async () => {
    findFirst.mockResolvedValueOnce(null);

    const result = await toggleItemFavorite("user-1", "item-1");

    expect(result).toBeNull();
    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "item-1", userId: "user-1" } }),
    );
  });

  it("flips isFavorite from false to true", async () => {
    findFirst.mockResolvedValueOnce({ isFavorite: false });
    update.mockResolvedValueOnce({
      id: "item-1",
      title: "useAuth Hook",
      description: null,
      isFavorite: true,
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
      tags: [],
      collections: [],
    });

    const result = await toggleItemFavorite("user-1", "item-1");

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "item-1" }, data: { isFavorite: true } }),
    );
    expect(result?.isFavorite).toBe(true);
  });

  it("flips isFavorite from true to false", async () => {
    findFirst.mockResolvedValueOnce({ isFavorite: true });
    update.mockResolvedValueOnce({
      id: "item-1",
      title: "useAuth Hook",
      description: null,
      isFavorite: false,
      isPinned: false,
      updatedAt: new Date("2024-01-16"),
      createdAt: new Date("2024-01-15"),
      contentType: "TEXT",
      content: null,
      url: null,
      fileUrl: null,
      fileName: null,
      fileSize: null,
      language: null,
      itemType: { id: "type-1", name: "snippet", icon: "Code", color: "#3b82f6" },
      tags: [],
      collections: [],
    });

    await toggleItemFavorite("user-1", "item-1");

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "item-1" }, data: { isFavorite: false } }),
    );
  });
});

describe("deleteItem", () => {
  it("returns null when the item isn't found or isn't owned by the user", async () => {
    findFirst.mockResolvedValueOnce(null);

    const result = await deleteItem("user-1", "item-1");

    expect(result).toBeNull();
    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "item-1", userId: "user-1" } }),
    );
    expect(deleteFn).not.toHaveBeenCalled();
  });

  it("deletes the item and returns its id and fileUrl when owned by the user", async () => {
    findFirst.mockResolvedValueOnce({ id: "item-1", fileUrl: "https://files.example.com/item-1.png" });
    deleteFn.mockResolvedValueOnce({ id: "item-1" });

    const result = await deleteItem("user-1", "item-1");

    expect(result).toEqual({ id: "item-1", fileUrl: "https://files.example.com/item-1.png" });
    expect(deleteFn).toHaveBeenCalledWith({ where: { id: "item-1" } });
  });
});
