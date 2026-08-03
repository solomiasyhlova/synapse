import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const RECENT_COLLECTIONS_LIMIT = 6;

export interface CollectionItemType {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface CollectionWithStats {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  itemCount: number;
  /** Color of the most-used content type in this collection, for the card's border accent. */
  accentColor: string | null;
  /** Distinct item types present in this collection, for the small icon row. */
  types: CollectionItemType[];
}

type CollectionWithItemTypes = Prisma.CollectionGetPayload<{
  include: { items: { include: { item: { include: { itemType: true } } } } };
}>;

function toCollectionWithStats(collection: CollectionWithItemTypes): CollectionWithStats {
  const typeCounts = new Map<string, { type: CollectionItemType; count: number }>();

  for (const { item } of collection.items) {
    const entry = typeCounts.get(item.itemType.id);
    if (entry) {
      entry.count += 1;
    } else {
      typeCounts.set(item.itemType.id, { type: item.itemType, count: 1 });
    }
  }

  const sortedByUsage = [...typeCounts.values()].sort((a, b) => b.count - a.count);

  return {
    id: collection.id,
    name: collection.name,
    description: collection.description,
    isFavorite: collection.isFavorite,
    itemCount: collection.items.length,
    accentColor: sortedByUsage[0]?.type.color ?? null,
    types: sortedByUsage.map(({ type }) => type),
  };
}

export async function getRecentCollections(
  userId: string,
  limit = RECENT_COLLECTIONS_LIMIT,
): Promise<CollectionWithStats[]> {
  const collections = await prisma.collection.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: {
      items: {
        include: {
          item: { include: { itemType: true } },
        },
      },
    },
  });

  return collections.map(toCollectionWithStats);
}

export async function createCollection(
  userId: string,
  data: { name: string; description?: string | null },
): Promise<CollectionWithStats> {
  const collection = await prisma.collection.create({
    data: {
      userId,
      name: data.name,
      description: data.description ?? null,
    },
  });

  return {
    id: collection.id,
    name: collection.name,
    description: collection.description,
    isFavorite: collection.isFavorite,
    itemCount: 0,
    accentColor: null,
    types: [],
  };
}

export async function getFavoriteCollections(userId: string): Promise<CollectionWithStats[]> {
  const collections = await prisma.collection.findMany({
    where: { userId, isFavorite: true },
    orderBy: { updatedAt: "desc" },
    include: {
      items: {
        include: {
          item: { include: { itemType: true } },
        },
      },
    },
  });

  return collections.map(toCollectionWithStats);
}
