import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { FileListRow } from "@/components/dashboard/FileListRow";
import { ImageCard } from "@/components/dashboard/ImageCard";
import { ItemCard } from "@/components/dashboard/ItemCard";
import { getCollectionById } from "@/lib/db/collections";
import { getItemsByCollection } from "@/lib/db/items";

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const userId = session.user.id;

  const collection = await getCollectionById(userId, id);
  if (!collection) notFound();

  const items = await getItemsByCollection(userId, id);
  const fileItems = items.filter((item) => item.itemType.name === "file");
  const otherItems = items.filter((item) => item.itemType.name !== "file");

  return (
    <main className="flex-1 space-y-6 overflow-y-auto p-6">
      <div>
        <h1 className="text-2xl font-bold">{collection.name}</h1>
        {collection.description && (
          <p className="text-sm text-muted-foreground">{collection.description}</p>
        )}
        <p className="text-sm text-muted-foreground">
          {items.length} {items.length === 1 ? "item" : "items"}
        </p>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No items in this collection yet.</p>
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
    </main>
  );
}
