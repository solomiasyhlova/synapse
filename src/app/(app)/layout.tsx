import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ItemDrawer } from "@/components/dashboard/ItemDrawer";
import { Logo } from "@/components/dashboard/Logo";
import { MobileSidebar } from "@/components/dashboard/MobileSidebar";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { ItemDrawerProvider } from "@/components/dashboard/item-drawer-context";
import { SidebarProvider } from "@/components/dashboard/sidebar-context";
import { TopBar } from "@/components/dashboard/TopBar";
import { getAllCollections, getFavoriteCollections, getRecentCollections } from "@/lib/db/collections";
import { getSystemItemTypes } from "@/lib/db/items";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const [itemTypes, favoriteCollections, recentCollections, collections] = await Promise.all([
    getSystemItemTypes(session.user.id),
    getFavoriteCollections(session.user.id),
    getRecentCollections(session.user.id, 5),
    getAllCollections(session.user.id),
  ]);

  const user = {
    name: session.user.name ?? "Unknown user",
    email: session.user.email ?? "",
    image: session.user.image,
  };

  return (
    <SidebarProvider>
      <ItemDrawerProvider>
        <div className="flex min-h-0 flex-1 flex-col">
          <header className="flex h-14 shrink-0 items-center border-b border-border">
            <Logo />
            <TopBar itemTypes={itemTypes} collections={collections} />
          </header>
          <div className="flex min-h-0 flex-1">
            <Sidebar
              itemTypes={itemTypes}
              favoriteCollections={favoriteCollections}
              recentCollections={recentCollections}
              user={user}
            />
            {children}
          </div>
        </div>
        <MobileSidebar
          itemTypes={itemTypes}
          favoriteCollections={favoriteCollections}
          recentCollections={recentCollections}
          user={user}
        />
        <ItemDrawer collections={collections} />
      </ItemDrawerProvider>
    </SidebarProvider>
  );
}
