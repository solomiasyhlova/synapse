import { Card, CardContent } from "@/components/ui/card";
import { collections, items } from "@/lib/mock-data";

export function StatsCards() {
  const stats = [
    { label: "Total items", value: items.length },
    { label: "Collections", value: collections.length },
    { label: "Favorite items", value: items.filter((item) => item.isFavorite).length },
    {
      label: "Favorite collections",
      value: collections.filter((collection) => collection.isFavorite).length,
    },
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
