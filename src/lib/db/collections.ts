import type { Prisma } from "@/generated/prisma/client";
import { COLLECTIONS_PER_PAGE, DASHBOARD_COLLECTIONS_LIMIT } from "@/lib/constants";
import { paginationSkip, toPaginatedResult, type PaginatedResult } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";

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
  updatedAt: Date;
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
    updatedAt: collection.updatedAt,
    accentColor: sortedByUsage[0]?.type.color ?? null,
    types: sortedByUsage.map(({ type }) => type),
  };
}

export async function getRecentCollections(
  userId: string,
  limit = DASHBOARD_COLLECTIONS_LIMIT,
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

export interface CollectionOption {
  id: string;
  name: string;
}

export async function getAllCollections(userId: string): Promise<CollectionOption[]> {
  return prisma.collection.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

async function fetchCollectionsWithStats(
  userId: string,
  options: { skip?: number; take?: number } = {},
): Promise<CollectionWithStats[]> {
  const collections = await prisma.collection.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    ...options,
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

export async function getAllCollectionsWithStats(
  userId: string,
  page = 1,
): Promise<PaginatedResult<CollectionWithStats>> {
  const [collections, totalCount] = await Promise.all([
    fetchCollectionsWithStats(userId, {
      skip: paginationSkip(page, COLLECTIONS_PER_PAGE),
      take: COLLECTIONS_PER_PAGE,
    }),
    prisma.collection.count({ where: { userId } }),
  ]);

  return toPaginatedResult(collections, totalCount, page, COLLECTIONS_PER_PAGE);
}

/** Unpaginated, for client-side search (mirrors getSearchableItems). */
export async function getSearchableCollections(userId: string): Promise<CollectionWithStats[]> {
  return fetchCollectionsWithStats(userId);
}

export interface CollectionDetail {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
}

export async function getCollectionById(
  userId: string,
  id: string,
): Promise<CollectionDetail | null> {
  return prisma.collection.findFirst({
    where: { id, userId },
    select: { id: true, name: true, description: true, isFavorite: true },
  });
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
    updatedAt: collection.updatedAt,
    accentColor: null,
    types: [],
  };
}

export async function updateCollection(
  userId: string,
  id: string,
  data: { name: string; description?: string | null },
): Promise<CollectionDetail | null> {
  const owned = await prisma.collection.findFirst({ where: { id, userId }, select: { id: true } });
  if (!owned) return null;

  return prisma.collection.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description ?? null,
    },
    select: { id: true, name: true, description: true, isFavorite: true },
  });
}

export async function toggleCollectionFavorite(
  userId: string,
  id: string,
): Promise<CollectionDetail | null> {
  const existing = await prisma.collection.findFirst({
    where: { id, userId },
    select: { isFavorite: true },
  });
  if (!existing) return null;

  return prisma.collection.update({
    where: { id },
    data: { isFavorite: !existing.isFavorite },
    select: { id: true, name: true, description: true, isFavorite: true },
  });
}

export async function deleteCollection(userId: string, id: string): Promise<boolean> {
  const { count } = await prisma.collection.deleteMany({ where: { id, userId } });
  return count > 0;
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
