import {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  Link,
  File,
  Image,
  Circle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  Link,
  File,
  Image,
};

export function TypeIcon({
  name,
  className,
  style,
}: {
  name: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const Icon = ICONS[name] ?? Circle;
  return <Icon className={className} style={style} />;
}
