import { notFound, redirect } from "next/navigation";
import { Lock, Plus } from "lucide-react";

import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { PlanCard } from "@/components/billing/PlanCard";
import { CreateItemDialog } from "@/components/dashboard/CreateItemDialog";
import { FileListRow } from "@/components/dashboard/FileListRow";
import { ImageCard } from "@/components/dashboard/ImageCard";
import { ItemCard } from "@/components/dashboard/ItemCard";
import { Pagination } from "@/components/dashboard/Pagination";
import { TypeIcon } from "@/components/dashboard/TypeIcon";
import { getAllCollections } from "@/lib/db/collections";
import { getItemsByType, getItemTypeByName, getSystemItemTypes } from "@/lib/db/items";
import { slugToTypeName } from "@/lib/item-type-slug";
import { isProOnlyType } from "@/lib/usage-limits";

export default async function ItemsByTypePage({
  params,
  searchParams,
}: {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { type: slug } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(Number(pageParam) || 1, 1);

  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const userId = session.user.id;
  const typeName = slugToTypeName(slug);

  if (isProOnlyType(typeName) && !session.user.isPro) {
    return (
      <main className="flex flex-1 items-center justify-center overflow-y-auto p-6">
        <div className="w-full max-w-sm space-y-6 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
            <Lock className="size-5 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-bold capitalize">{slug} are a Pro feature</h1>
            <p className="text-sm text-muted-foreground">
              Upgrade to Pro to upload and organize {typeName}s.
            </p>
          </div>
          <PlanCard isPro={false} interval={null} currentPeriodEnd={null} showUsage={false} />
        </div>
      </main>
    );
  }

  const itemType = await getItemTypeByName(userId, typeName);
  if (!itemType) notFound();

  const [{ items, totalCount, totalPages }, itemTypes, collections] = await Promise.all([
    getItemsByType(userId, typeName, page),
    getSystemItemTypes(userId),
    getAllCollections(userId),
  ]);

  return (
    <main className="flex-1 space-y-6 overflow-y-auto p-6">
      <div className="flex items-center gap-2">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
          <TypeIcon name={itemType.icon} className="size-4" style={{ color: itemType.color }} />
        </span>
        <div>
          <h1 className="text-2xl font-bold capitalize">{slug}</h1>
          <p className="text-sm text-muted-foreground">
            {totalCount} {totalCount === 1 ? "item" : "items"}
          </p>
        </div>
        <CreateItemDialog
          itemTypes={itemTypes}
          collections={collections}
          defaultTypeName={typeName}
          trigger={
            <Button className="ml-auto">
              <Plus />
              <span className="capitalize">Add {typeName}</span>
            </Button>
          }
        />
      </div>

      {totalCount === 0 ? (
        <p className="text-sm text-muted-foreground">No items yet.</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No items on this page.</p>
      ) : typeName === "file" ? (
        <div className="divide-y divide-border overflow-hidden rounded-lg border border-border">
          {items.map((item) => (
            <FileListRow key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) =>
            typeName === "image" ? (
              <ImageCard key={item.id} item={item} />
            ) : (
              <ItemCard key={item.id} item={item} />
            ),
          )}
        </div>
      )}

      <Pagination currentPage={page} totalPages={totalPages} basePath={`/items/${slug}`} />
    </main>
  );
}
