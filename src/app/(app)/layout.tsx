import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Logo } from "@/components/dashboard/Logo";
import { MobileSidebar } from "@/components/dashboard/MobileSidebar";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { SidebarProvider } from "@/components/dashboard/sidebar-context";
import { TopBar } from "@/components/dashboard/TopBar";
import { getFavoriteCollections, getRecentCollections } from "@/lib/db/collections";
import { getSystemItemTypes } from "@/lib/db/items";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const [itemTypes, favoriteCollections, recentCollections] = await Promise.all([
    getSystemItemTypes(session.user.id),
    getFavoriteCollections(session.user.id),
    getRecentCollections(session.user.id, 5),
  ]);

  const user = {
    name: session.user.name ?? "Unknown user",
    email: session.user.email ?? "",
    image: session.user.image,
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center border-b border-border">
          <Logo />
          <TopBar />
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
    </SidebarProvider>
  );
}
