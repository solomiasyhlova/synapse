"use client";

import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="px-2 pb-1 text-xs font-semibold tracking-wider text-foreground/70">
      {children}
    </h3>
  );
}

export function SectionToggle({
  label,
  isOpen,
  onToggle,
}: {
  label: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={isOpen}
      className="flex w-full items-center justify-between rounded-md px-2 pb-1 text-sm font-semibold tracking-wider text-foreground transition-colors hover:text-foreground/80"
    >
      <span>{label}</span>
      <ChevronDown className={cn("size-4 shrink-0 transition-transform", !isOpen && "-rotate-90")} />
    </button>
  );
}
