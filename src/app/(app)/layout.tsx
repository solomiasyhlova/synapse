import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { GlobalSearch } from "@/components/dashboard/GlobalSearch";
import { ItemDrawer } from "@/components/dashboard/ItemDrawer";
import { Logo } from "@/components/dashboard/Logo";
import { MobileSidebar } from "@/components/dashboard/MobileSidebar";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { EditorPreferencesProvider } from "@/components/dashboard/editor-preferences-context";
import { GlobalSearchProvider } from "@/components/dashboard/global-search-context";
import { ItemDrawerProvider } from "@/components/dashboard/item-drawer-context";
import { SidebarProvider } from "@/components/dashboard/sidebar-context";
import { TopBar } from "@/components/dashboard/TopBar";
import {
  getAllCollections,
  getFavoriteCollections,
  getRecentCollections,
  getSearchableCollections,
} from "@/lib/db/collections";
import { getSearchableItems, getSystemItemTypes } from "@/lib/db/items";
import { getEditorPreferences } from "@/lib/db/settings";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const [
    itemTypes,
    favoriteCollections,
    recentCollections,
    collections,
    searchableItems,
    allCollections,
    editorPreferences,
  ] = await Promise.all([
    getSystemItemTypes(session.user.id),
    getFavoriteCollections(session.user.id),
    getRecentCollections(session.user.id, 5),
    getAllCollections(session.user.id),
    getSearchableItems(session.user.id),
    getSearchableCollections(session.user.id),
    getEditorPreferences(session.user.id),
  ]);

  const user = {
    name: session.user.name ?? "Unknown user",
    email: session.user.email ?? "",
    image: session.user.image,
    isPro: session.user.isPro,
  };

  return (
    <EditorPreferencesProvider preferences={editorPreferences}>
      <SidebarProvider>
        <ItemDrawerProvider>
          <GlobalSearchProvider>
            <div className="flex min-h-0 flex-1 flex-col">
              <header className="flex h-14 shrink-0 items-center border-b border-border">
                <Logo />
                <TopBar itemTypes={itemTypes} collections={collections} isPro={user.isPro} />
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
            <GlobalSearch items={searchableItems} collections={allCollections} />
          </GlobalSearchProvider>
        </ItemDrawerProvider>
      </SidebarProvider>
    </EditorPreferencesProvider>
  );
}
