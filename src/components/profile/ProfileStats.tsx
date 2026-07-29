import { Card, CardContent } from "@/components/ui/card";
import { TypeIcon } from "@/components/dashboard/TypeIcon";
import { getProfileStats } from "@/lib/db/profile";

interface ProfileStatsProps {
  userId: string;
}

export async function ProfileStats({ userId }: ProfileStatsProps) {
  const { totalItems, totalCollections, typeBreakdown } = await getProfileStats(userId);

  const stats = [
    { label: "Total items", value: totalItems },
    { label: "Collections", value: totalCollections },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="space-y-1">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-semibold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {typeBreakdown.map((type) => (
            <div key={type.id} className="flex items-center gap-2">
              <TypeIcon name={type.icon} className="size-4 shrink-0" style={{ color: type.color }} />
              <span className="flex-1 truncate text-sm capitalize">{type.name}</span>
              <span className="text-sm text-muted-foreground">{type.itemCount}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
