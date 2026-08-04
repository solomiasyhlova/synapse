import { describe, expect, it, vi } from "vitest";

const create = vi.fn();
const findMany = vi.fn();
const count = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    collection: { create, findMany, count },
  },
}));

const { createCollection, getAllCollectionsWithStats, getSearchableCollections } = await import(
  "./collections"
);

const itemType = { id: "type-1", name: "snippet", icon: "Code", color: "#3b82f6" };
const collectionRow = (id: string) => ({
  id,
  name: `Collection ${id}`,
  description: null,
  isFavorite: false,
  items: [{ item: { itemType } }],
});

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
