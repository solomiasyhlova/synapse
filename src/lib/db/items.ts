import type { ContentType } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

const RECENT_ITEMS_LIMIT = 10;

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
  updatedAt: Date;
  itemType: ItemType;
}

export async function getPinnedItems(userId: string): Promise<ItemWithType[]> {
  return prisma.item.findMany({
    where: { userId, isPinned: true },
    orderBy: { updatedAt: "desc" },
    include: { itemType: true },
  });
}

export async function getRecentItems(
  userId: string,
  limit = RECENT_ITEMS_LIMIT,
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

export async function getItemsByType(userId: string, typeName: string): Promise<ItemWithType[]> {
  return prisma.item.findMany({
    where: { userId, itemType: { name: typeName } },
    orderBy: { updatedAt: "desc" },
    include: { itemType: true },
  });
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

export async function getItemById(userId: string, id: string): Promise<ItemDetail | null> {
  const item = await prisma.item.findFirst({
    where: { id, userId },
    include: {
      itemType: { select: { id: true, name: true, icon: true, color: true } },
      tags: { select: { id: true, name: true } },
      collections: { include: { collection: { select: { id: true, name: true } } } },
    },
  });
  if (!item) return null;

  return {
    ...item,
    collections: item.collections.map(({ collection }) => collection),
  };
}

export interface CreateItemData {
  title: string;
  description?: string | null;
  content?: string | null;
  url?: string | null;
  language?: string | null;
  tags: string[];
}

export async function createItem(
  userId: string,
  typeName: string,
  data: CreateItemData,
): Promise<ItemDetail | null> {
  const itemType = await getItemTypeByName(userId, typeName);
  if (!itemType) return null;

  const item = await prisma.item.create({
    data: {
      title: data.title,
      description: data.description ?? null,
      content: data.content ?? null,
      url: data.url ?? null,
      language: data.language ?? null,
      contentType: typeName === "link" ? "URL" : "TEXT",
      userId,
      itemTypeId: itemType.id,
      tags: {
        connectOrCreate: data.tags.map((name) => ({
          where: { userId_name: { userId, name } },
          create: { name, userId },
        })),
      },
    },
    include: {
      itemType: { select: { id: true, name: true, icon: true, color: true } },
      tags: { select: { id: true, name: true } },
      collections: { include: { collection: { select: { id: true, name: true } } } },
    },
  });

  return {
    ...item,
    collections: item.collections.map(({ collection }) => collection),
  };
}

export interface UpdateItemData {
  title: string;
  description?: string | null;
  content?: string | null;
  url?: string | null;
  language?: string | null;
  tags: string[];
}

export async function updateItem(
  userId: string,
  id: string,
  data: UpdateItemData,
): Promise<ItemDetail | null> {
  const existing = await prisma.item.findFirst({ where: { id, userId }, select: { id: true } });
  if (!existing) return null;

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
    },
    include: {
      itemType: { select: { id: true, name: true, icon: true, color: true } },
      tags: { select: { id: true, name: true } },
      collections: { include: { collection: { select: { id: true, name: true } } } },
    },
  });

  return {
    ...item,
    collections: item.collections.map(({ collection }) => collection),
  };
}

export async function deleteItem(userId: string, id: string): Promise<boolean> {
  const existing = await prisma.item.findFirst({ where: { id, userId }, select: { id: true } });
  if (!existing) return false;

  await prisma.item.delete({ where: { id } });
  return true;
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
