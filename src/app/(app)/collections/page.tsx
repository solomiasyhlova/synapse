import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { CollectionCard } from "@/components/dashboard/CollectionCard";
import { Pagination } from "@/components/dashboard/Pagination";
import { getAllCollectionsWithStats } from "@/lib/db/collections";

export default async function CollectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(Number(pageParam) || 1, 1);

  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const { items: collections, totalCount, totalPages } = await getAllCollectionsWithStats(
    session.user.id,
    page,
  );

  return (
    <main className="flex-1 space-y-6 overflow-y-auto p-6">
      <div>
        <h1 className="text-2xl font-bold">Collections</h1>
        <p className="text-sm text-muted-foreground">
          {totalCount} {totalCount === 1 ? "collection" : "collections"}
        </p>
      </div>

      {totalCount === 0 ? (
        <p className="text-sm text-muted-foreground">No collections yet.</p>
      ) : collections.length === 0 ? (
        <p className="text-sm text-muted-foreground">No collections on this page.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      )}

      <Pagination currentPage={page} totalPages={totalPages} basePath="/collections" />
    </main>
  );
}
