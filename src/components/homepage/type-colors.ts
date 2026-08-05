import { Code, File, Image, Link, Sparkles, StickyNote, Terminal } from "lucide-react";
import type { LucideIcon } from "lucide-react";

// Hardcoded from context/project-overview.md §6 — this page is public/unauthenticated
// so it can't query the real ItemType rows from the DB.
export const TYPE_COLORS: { name: string; color: string; icon: LucideIcon }[] = [
  { name: "Snippet", color: "#3b82f6", icon: Code },
  { name: "Prompt", color: "#8b5cf6", icon: Sparkles },
  { name: "Command", color: "#f97316", icon: Terminal },
  { name: "Note", color: "#fde047", icon: StickyNote },
  { name: "Link", color: "#10b981", icon: Link },
  { name: "File", color: "#6b7280", icon: File },
  { name: "Image", color: "#ec4899", icon: Image },
];
