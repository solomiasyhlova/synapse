import { prisma } from "@/lib/prisma";

// TODO: replace with the authenticated user's id once Auth.js sessions are wired up.
const DEMO_USER_EMAIL = "demo@devstash.io";

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

export async function getPinnedItems(): Promise<ItemWithType[]> {
  const user = await prisma.user.findUnique({ where: { email: DEMO_USER_EMAIL } });
  if (!user) return [];

  return prisma.item.findMany({
    where: { userId: user.id, isPinned: true },
    orderBy: { updatedAt: "desc" },
    include: { itemType: true },
  });
}

export async function getRecentItems(limit = RECENT_ITEMS_LIMIT): Promise<ItemWithType[]> {
  const user = await prisma.user.findUnique({ where: { email: DEMO_USER_EMAIL } });
  if (!user) return [];

  return prisma.item.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: { itemType: true },
  });
}

const SYSTEM_TYPE_ORDER = ["snippet", "prompt", "command", "note", "file", "image", "link"];

export async function getSystemItemTypes(): Promise<ItemTypeWithCount[]> {
  const types = await prisma.itemType.findMany({ where: { isSystem: true } });
  types.sort((a, b) => SYSTEM_TYPE_ORDER.indexOf(a.name) - SYSTEM_TYPE_ORDER.indexOf(b.name));

  const user = await prisma.user.findUnique({ where: { email: DEMO_USER_EMAIL } });
  if (!user) return types.map((type) => ({ ...type, itemCount: 0 }));

  const counts = await prisma.item.groupBy({
    by: ["itemTypeId"],
    where: { userId: user.id },
    _count: { _all: true },
  });
  const countByTypeId = new Map(counts.map((c) => [c.itemTypeId, c._count._all]));

  return types.map((type) => ({ ...type, itemCount: countByTypeId.get(type.id) ?? 0 }));
}
