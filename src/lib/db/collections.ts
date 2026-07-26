import { prisma } from "@/lib/prisma";

// TODO: replace with the authenticated user's id once Auth.js sessions are wired up.
const DEMO_USER_EMAIL = "demo@devstash.io";

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

export async function getRecentCollections(
  limit = RECENT_COLLECTIONS_LIMIT,
): Promise<CollectionWithStats[]> {
  const user = await prisma.user.findUnique({ where: { email: DEMO_USER_EMAIL } });
  if (!user) return [];

  const collections = await prisma.collection.findMany({
    where: { userId: user.id },
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

  return collections.map((collection) => {
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
  });
}
