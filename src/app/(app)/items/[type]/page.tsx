import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { ItemCard } from "@/components/dashboard/ItemCard";
import { TypeIcon } from "@/components/dashboard/TypeIcon";
import { getItemsByType, getItemTypeByName } from "@/lib/db/items";
import { slugToTypeName } from "@/lib/item-type-slug";

export default async function ItemsByTypePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type: slug } = await params;

  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const userId = session.user.id;
  const typeName = slugToTypeName(slug);

  const itemType = await getItemTypeByName(userId, typeName);
  if (!itemType) notFound();

  const items = await getItemsByType(userId, typeName);

  return (
    <main className="flex-1 space-y-6 overflow-y-auto p-6">
      <div className="flex items-center gap-2">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
          <TypeIcon name={itemType.icon} className="size-4" style={{ color: itemType.color }} />
        </span>
        <div>
          <h1 className="text-2xl font-bold capitalize">{slug}</h1>
          <p className="text-sm text-muted-foreground">
            {items.length} {items.length === 1 ? "item" : "items"}
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No items yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </main>
  );
}
