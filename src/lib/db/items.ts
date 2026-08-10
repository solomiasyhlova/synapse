import type { ContentType } from "@/generated/prisma/enums";
import { DASHBOARD_RECENT_ITEMS_LIMIT, ITEMS_PER_PAGE } from "@/lib/constants";
import { paginationSkip, toPaginatedResult, type PaginatedResult } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";
import { canCreateItem } from "@/lib/usage-limits";

export interface ItemType {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface ItemTypeWithCount extends ItemType {
  itemCount: number;
}

export interface ItemWithType {
  id: string;
  title: string;
  description: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  itemType: ItemType;
}

export async function getPinnedItems(userId: string): Promise<ItemWithType[]> {
  return prisma.item.findMany({
    where: { userId, isPinned: true },
    orderBy: { updatedAt: "desc" },
    include: { itemType: true },
  });
}

export async function getFavoriteItems(userId: string): Promise<ItemWithType[]> {
  return prisma.item.findMany({
    where: { userId, isFavorite: true },
    orderBy: { updatedAt: "desc" },
    include: { itemType: true },
  });
}

export async function getRecentItems(
  userId: string,
  limit = DASHBOARD_RECENT_ITEMS_LIMIT,
): Promise<ItemWithType[]> {
  return prisma.item.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: { itemType: true },
  });
}

export async function getItemTypeByName(userId: string, name: string): Promise<ItemType | null> {
  return prisma.itemType.findFirst({
    where: { name, OR: [{ isSystem: true }, { userId }] },
    select: { id: true, name: true, icon: true, color: true },
  });
}

export async function getItemsByType(
  userId: string,
  typeName: string,
  page = 1,
): Promise<PaginatedResult<ItemWithType>> {
  const where = { userId, itemType: { name: typeName } };

  const [items, totalCount] = await Promise.all([
    prisma.item.findMany({
      where,
      orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
      skip: paginationSkip(page, ITEMS_PER_PAGE),
      take: ITEMS_PER_PAGE,
      include: { itemType: true },
    }),
    prisma.item.count({ where }),
  ]);

  return toPaginatedResult(items, totalCount, page, ITEMS_PER_PAGE);
}

export async function getItemsByCollection(
  userId: string,
  collectionId: string,
  page = 1,
): Promise<PaginatedResult<ItemWithType>> {
  const where = { userId, collections: { some: { collectionId } } };

  const [items, totalCount] = await Promise.all([
    prisma.item.findMany({
      where,
      orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
      skip: paginationSkip(page, ITEMS_PER_PAGE),
      take: ITEMS_PER_PAGE,
      include: { itemType: true },
    }),
    prisma.item.count({ where }),
  ]);

  return toPaginatedResult(items, totalCount, page, ITEMS_PER_PAGE);
}

export interface ItemDetail extends ItemWithType {
  contentType: ContentType;
  content: string | null;
  url: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  language: string | null;
  createdAt: Date;
  tags: { id: string; name: string }[];
  collections: { id: string; name: string }[];
}

const ITEM_DETAIL_INCLUDE = {
  itemType: { select: { id: true, name: true, icon: true, color: true } },
  tags: { select: { id: true, name: true } },
  collections: { include: { collection: { select: { id: true, name: true } } } },
};

export async function getItemById(userId: string, id: string): Promise<ItemDetail | null> {
  const item = await prisma.item.findFirst({
    where: { id, userId },
    include: ITEM_DETAIL_INCLUDE,
  });
  if (!item) return null;

  return {
    ...item,
    collections: item.collections.map(({ collection }) => collection),
  };
}

const FILE_TYPE_NAMES = ["file", "image"];

function resolveContentType(typeName: string): ContentType {
  if (typeName === "link") return "URL";
  if (FILE_TYPE_NAMES.includes(typeName)) return "FILE";
  return "TEXT";
}

async function resolveOwnedCollectionIds(userId: string, collectionIds: string[]): Promise<string[]> {
  if (collectionIds.length === 0) return [];
  const owned = await prisma.collection.findMany({
    where: { id: { in: collectionIds }, userId },
    select: { id: true },
  });
  return owned.map((c) => c.id);
}

export interface CreateItemData {
  title: string;
  description?: string | null;
  content?: string | null;
  url?: string | null;
  language?: string | null;
  fileUrl?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  tags: string[];
  collectionIds: string[];
}

export interface CreateItemOutcome {
  item: ItemDetail | null;
  error?: string;
}

export async function createItem(
  userId: string,
  typeName: string,
  data: CreateItemData,
  isPro: boolean,
): Promise<CreateItemOutcome> {
  const itemType = await getItemTypeByName(userId, typeName);
  if (!itemType) return { item: null, error: "Item type not found" };

  const itemCount = await prisma.item.count({ where: { userId } });
  const limitCheck = canCreateItem(isPro, itemCount, typeName);
  if (!limitCheck.allowed) return { item: null, error: limitCheck.reason };

  const collectionIds = await resolveOwnedCollectionIds(userId, data.collectionIds);

  const item = await prisma.item.create({
    data: {
      title: data.title,
      description: data.description ?? null,
      content: data.content ?? null,
      url: data.url ?? null,
      language: data.language ?? null,
      fileUrl: data.fileUrl ?? null,
      fileName: data.fileName ?? null,
      fileSize: data.fileSize ?? null,
      contentType: resolveContentType(typeName),
      userId,
      itemTypeId: itemType.id,
      tags: {
        connectOrCreate: data.tags.map((name) => ({
          where: { userId_name: { userId, name } },
          create: { name, userId },
        })),
      },
      collections: {
        create: collectionIds.map((collectionId) => ({ collectionId })),
      },
    },
    include: ITEM_DETAIL_INCLUDE,
  });

  return {
    item: {
      ...item,
      collections: item.collections.map(({ collection }) => collection),
    },
  };
}

export interface UpdateItemData {
  title: string;
  description?: string | null;
  content?: string | null;
  url?: string | null;
  language?: string | null;
  tags: string[];
  collectionIds: string[];
}

export async function updateItem(
  userId: string,
  id: string,
  data: UpdateItemData,
): Promise<ItemDetail | null> {
  const existing = await prisma.item.findFirst({ where: { id, userId }, select: { id: true } });
  if (!existing) return null;

  const collectionIds = await resolveOwnedCollectionIds(userId, data.collectionIds);

  const item = await prisma.item.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description ?? null,
      content: data.content ?? null,
      url: data.url ?? null,
      language: data.language ?? null,
      tags: {
        set: [],
        connectOrCreate: data.tags.map((name) => ({
          where: { userId_name: { userId, name } },
          create: { name, userId },
        })),
      },
      collections: {
        deleteMany: {},
        create: collectionIds.map((collectionId) => ({ collectionId })),
      },
    },
    include: ITEM_DETAIL_INCLUDE,
  });

  return {
    ...item,
    collections: item.collections.map(({ collection }) => collection),
  };
}

export async function toggleItemFavorite(userId: string, id: string): Promise<ItemDetail | null> {
  const existing = await prisma.item.findFirst({
    where: { id, userId },
    select: { isFavorite: true },
  });
  if (!existing) return null;

  const item = await prisma.item.update({
    where: { id },
    data: { isFavorite: !existing.isFavorite },
    include: ITEM_DETAIL_INCLUDE,
  });

  return {
    ...item,
    collections: item.collections.map(({ collection }) => collection),
  };
}

export async function toggleItemPin(userId: string, id: string): Promise<ItemDetail | null> {
  const existing = await prisma.item.findFirst({
    where: { id, userId },
    select: { isPinned: true },
  });
  if (!existing) return null;

  const item = await prisma.item.update({
    where: { id },
    data: { isPinned: !existing.isPinned },
    include: ITEM_DETAIL_INCLUDE,
  });

  return {
    ...item,
    collections: item.collections.map(({ collection }) => collection),
  };
}

export interface DeletedItem {
  id: string;
  fileUrl: string | null;
}

export async function deleteItem(userId: string, id: string): Promise<DeletedItem | null> {
  const existing = await prisma.item.findFirst({
    where: { id, userId },
    select: { id: true, fileUrl: true },
  });
  if (!existing) return null;

  await prisma.item.delete({ where: { id } });
  return existing;
}

const SEARCH_PREVIEW_LENGTH = 140;

export interface SearchableItem {
  id: string;
  title: string;
  contentPreview: string | null;
  itemType: ItemType;
}

export async function getSearchableItems(userId: string): Promise<SearchableItem[]> {
  const items = await prisma.item.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      content: true,
      description: true,
      url: true,
      itemType: { select: { id: true, name: true, icon: true, color: true } },
    },
  });

  return items.map((item) => ({
    id: item.id,
    title: item.title,
    contentPreview: (item.content ?? item.description ?? item.url)?.slice(0, SEARCH_PREVIEW_LENGTH) ?? null,
    itemType: item.itemType,
  }));
}

const SYSTEM_TYPE_ORDER = ["snippet", "prompt", "command", "note", "file", "image", "link"];

export async function getSystemItemTypes(userId: string): Promise<ItemTypeWithCount[]> {
  const types = await prisma.itemType.findMany({ where: { isSystem: true } });
  types.sort((a, b) => SYSTEM_TYPE_ORDER.indexOf(a.name) - SYSTEM_TYPE_ORDER.indexOf(b.name));

  const counts = await prisma.item.groupBy({
    by: ["itemTypeId"],
    where: { userId },
    _count: { _all: true },
  });
  const countByTypeId = new Map(counts.map((c) => [c.itemTypeId, c._count._all]));

  return types.map((type) => ({ ...type, itemCount: countByTypeId.get(type.id) ?? 0 }));
}
