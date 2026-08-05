import { redirect } from "next/navigation";
import { Star } from "lucide-react";

import { auth } from "@/auth";
import { FavoritesList } from "@/components/dashboard/FavoritesList";
import { getFavoriteCollections } from "@/lib/db/collections";
import { getFavoriteItems } from "@/lib/db/items";

export default async function FavoritesPage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const userId = session.user.id;

  const [items, collections] = await Promise.all([
    getFavoriteItems(userId),
    getFavoriteCollections(userId),
  ]);

  return (
    <main className="flex-1 space-y-6 overflow-y-auto p-6">
      <div className="flex items-center gap-2">
        <Star className="size-5 text-yellow-400" />
        <h1 className="text-2xl font-bold">Favorites</h1>
      </div>

      <FavoritesList items={items} collections={collections} />
    </main>
  );
}
