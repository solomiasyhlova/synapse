import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";

export function TypeIcon({
  name,
  className,
  style,
}: {
  name: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const icons = LucideIcons as unknown as Record<string, LucideIcon>;
  const Icon = icons[name] ?? LucideIcons.Circle;
  return <Icon className={className} style={style} />;
}
