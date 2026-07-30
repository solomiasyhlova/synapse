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
