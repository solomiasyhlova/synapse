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
