import { Logo } from "@/components/dashboard/Logo";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex h-14 shrink-0 items-center border-b border-border">
        <Logo />
        <TopBar />
      </header>
      <div className="flex flex-1">
        <Sidebar />
        {children}
      </div>
    </div>
  );
}
