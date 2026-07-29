import { Card, CardContent } from "@/components/ui/card";
import { getDashboardStats } from "@/lib/db/stats";

export async function StatsCards({ userId }: { userId: string }) {
  const dashboardStats = await getDashboardStats(userId);

  const stats = [
    { label: "Total items", value: dashboardStats.totalItems },
    { label: "Collections", value: dashboardStats.totalCollections },
    { label: "Favorite items", value: dashboardStats.favoriteItems },
    { label: "Favorite collections", value: dashboardStats.favoriteCollections },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="space-y-1">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-2xl font-semibold">{stat.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
