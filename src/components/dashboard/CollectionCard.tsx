import Link from "next/link";
import { Star } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TypeIcon } from "@/components/dashboard/TypeIcon";
import type { CollectionWithStats } from "@/lib/db/collections";
import { cn } from "@/lib/utils";

export function CollectionCard({ collection }: { collection: CollectionWithStats }) {
  return (
    <Link href={`/collections/${collection.id}`} className="block">
      <Card
        className="border-l-2 transition-colors hover:bg-muted/40"
        style={{ borderLeftColor: collection.accentColor ?? undefined }}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-1.5 text-base">
            <span className="truncate">{collection.name}</span>
            {collection.isFavorite && (
              <Star className="size-3.5 shrink-0 fill-yellow-400 text-yellow-400" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">{collection.itemCount} items</p>
          {collection.description && (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {collection.description}
            </p>
          )}
          {collection.types.length > 0 && (
            <div className="flex items-center gap-1.5">
              {collection.types.map((type) => (
                <span
                  key={type.id}
                  className={cn(
                    "flex size-6 items-center justify-center rounded-md bg-muted",
                  )}
                >
                  <TypeIcon
                    name={type.icon}
                    className="size-3.5"
                    style={{ color: type.color }}
                  />
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
