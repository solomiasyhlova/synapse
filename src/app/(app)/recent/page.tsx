import { redirect } from "next/navigation";
import { Clock } from "lucide-react";

import { auth } from "@/auth";
import { RecentList } from "@/components/dashboard/RecentList";
import { getRecentCollections } from "@/lib/db/collections";
import { getRecentItems } from "@/lib/db/items";
import { RECENT_PAGE_LIMIT } from "@/lib/constants";

export default async function RecentPage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const userId = session.user.id;

  const [items, collections] = await Promise.all([
    getRecentItems(userId, RECENT_PAGE_LIMIT),
    getRecentCollections(userId, RECENT_PAGE_LIMIT),
  ]);

  return (
    <main className="flex-1 space-y-6 overflow-y-auto p-6">
      <div className="flex items-center gap-2">
        <Clock className="size-5 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Recent</h1>
      </div>

      <RecentList items={items} collections={collections} />
    </main>
  );
}
