import Link from "next/link";

import { CollectionCard } from "@/components/dashboard/CollectionCard";
import { collections } from "@/lib/mock-data";

const RECENT_COLLECTIONS_LIMIT = 6;

export function CollectionsSection() {
  const recentCollections = [...collections]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, RECENT_COLLECTIONS_LIMIT);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Collections</h2>
        <Link
          href="/collections"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          View all
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {recentCollections.map((collection) => (
          <CollectionCard key={collection.id} collection={collection} />
        ))}
      </div>
    </section>
  );
}
