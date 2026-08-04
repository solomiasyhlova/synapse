import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { CollectionPageActions } from "@/components/dashboard/CollectionPageActions";
import { FileListRow } from "@/components/dashboard/FileListRow";
import { ImageCard } from "@/components/dashboard/ImageCard";
import { ItemCard } from "@/components/dashboard/ItemCard";
import { Pagination } from "@/components/dashboard/Pagination";
import { getCollectionById } from "@/lib/db/collections";
import { getItemsByCollection } from "@/lib/db/items";

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { id } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(Number(pageParam) || 1, 1);

  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const userId = session.user.id;

  const collection = await getCollectionById(userId, id);
  if (!collection) notFound();

  const { items, totalCount, totalPages } = await getItemsByCollection(userId, id, page);
  const fileItems = items.filter((item) => item.itemType.name === "file");
  const otherItems = items.filter((item) => item.itemType.name !== "file");

  return (
    <main className="flex-1 space-y-6 overflow-y-auto p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{collection.name}</h1>
          {collection.description && (
            <p className="text-sm text-muted-foreground">{collection.description}</p>
          )}
          <p className="text-sm text-muted-foreground">
            {totalCount} {totalCount === 1 ? "item" : "items"}
          </p>
        </div>
        <CollectionPageActions collection={collection} />
      </div>

      {totalCount === 0 ? (
        <p className="text-sm text-muted-foreground">No items in this collection yet.</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No items on this page.</p>
      ) : (
        <div className="space-y-6">
          {otherItems.length > 0 && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {otherItems.map((item) =>
                item.itemType.name === "image" ? (
                  <ImageCard key={item.id} item={item} />
                ) : (
                  <ItemCard key={item.id} item={item} />
                ),
              )}
            </div>
          )}
          {fileItems.length > 0 && (
            <div className="divide-y divide-border overflow-hidden rounded-lg border border-border">
              {fileItems.map((item) => (
                <FileListRow key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      )}

      <Pagination currentPage={page} totalPages={totalPages} basePath={`/collections/${id}`} />
    </main>
  );
}
