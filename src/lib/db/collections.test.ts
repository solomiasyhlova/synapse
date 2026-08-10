import { describe, expect, it, vi } from "vitest";

const create = vi.fn();
const findMany = vi.fn();
const findFirst = vi.fn();
const update = vi.fn();
const count = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    collection: { create, findMany, findFirst, update, count },
  },
}));

const {
  createCollection,
  getAllCollectionsWithStats,
  getSearchableCollections,
  toggleCollectionFavorite,
} = await import("./collections");

const itemType = { id: "type-1", name: "snippet", icon: "Code", color: "#3b82f6" };
const collectionRow = (id: string) => ({
  id,
  name: `Collection ${id}`,
  description: null,
  isFavorite: false,
  items: [{ item: { itemType } }],
});

describe("createCollection", () => {
  it("rejects a free user who has hit the collection limit, without creating", async () => {
    count.mockResolvedValueOnce(3);

    const result = await createCollection("user-1", { name: "One too many" }, false);

    expect(result.collection).toBeNull();
    expect(result.error).toMatch(/3-collection limit/);
    expect(create).not.toHaveBeenCalled();
  });

  it("creates the collection scoped to the user and returns fresh stats", async () => {
    count.mockResolvedValueOnce(0);
    create.mockResolvedValueOnce({
      id: "col-1",
      name: "React Patterns",
      description: "Snippets and notes for React.",
      isFavorite: false,
    });

    const result = await createCollection(
      "user-1",
      { name: "React Patterns", description: "Snippets and notes for React." },
      false,
    );

    expect(create).toHaveBeenCalledWith({
      data: {
        userId: "user-1",
        name: "React Patterns",
        description: "Snippets and notes for React.",
      },
    });
    expect(result.collection).toEqual({
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
    count.mockResolvedValueOnce(0);
    create.mockResolvedValueOnce({
      id: "col-2",
      name: "Untitled",
      description: null,
      isFavorite: false,
    });

    await createCollection("user-1", { name: "Untitled" }, false);

    expect(create).toHaveBeenCalledWith({
      data: { userId: "user-1", name: "Untitled", description: null },
    });
  });

  it("allows a Pro user past the free collection limit", async () => {
    count.mockResolvedValueOnce(10);
    create.mockResolvedValueOnce({
      id: "col-3",
      name: "Yet Another",
      description: null,
      isFavorite: false,
    });

    const result = await createCollection("user-1", { name: "Yet Another" }, true);

    expect(result.collection).not.toBeNull();
    expect(create).toHaveBeenCalled();
  });
});

describe("getAllCollectionsWithStats", () => {
  it("fetches only the requested page's worth of collections", async () => {
    findMany.mockResolvedValueOnce([collectionRow("col-1")]);
    count.mockResolvedValueOnce(43);

    const result = await getAllCollectionsWithStats("user-1", 2);

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: "user-1" }, skip: 21, take: 21 }),
    );
    expect(count).toHaveBeenCalledWith({ where: { userId: "user-1" } });
    expect(result.page).toBe(2);
    expect(result.totalPages).toBe(3);
    expect(result.totalCount).toBe(43);
    expect(result.items).toEqual([
      expect.objectContaining({ id: "col-1", itemCount: 1, accentColor: "#3b82f6" }),
    ]);
  });
});

describe("getSearchableCollections", () => {
  it("fetches every collection, unpaginated", async () => {
    findMany.mockResolvedValueOnce([collectionRow("col-1"), collectionRow("col-2")]);

    const result = await getSearchableCollections("user-1");

    const call = findMany.mock.calls.at(-1)![0];
    expect(call).toMatchObject({ where: { userId: "user-1" } });
    expect(call).not.toHaveProperty("skip");
    expect(call).not.toHaveProperty("take");
    expect(result).toHaveLength(2);
  });
});

describe("toggleCollectionFavorite", () => {
  it("returns null when the collection isn't found or isn't owned by the user", async () => {
    findFirst.mockResolvedValueOnce(null);

    const result = await toggleCollectionFavorite("user-1", "col-1");

    expect(result).toBeNull();
    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "col-1", userId: "user-1" } }),
    );
    expect(update).not.toHaveBeenCalled();
  });

  it("flips isFavorite from false to true", async () => {
    findFirst.mockResolvedValueOnce({ isFavorite: false });
    update.mockResolvedValueOnce({
      id: "col-1",
      name: "React Patterns",
      description: null,
      isFavorite: true,
    });

    const result = await toggleCollectionFavorite("user-1", "col-1");

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "col-1" }, data: { isFavorite: true } }),
    );
    expect(result?.isFavorite).toBe(true);
  });
});
