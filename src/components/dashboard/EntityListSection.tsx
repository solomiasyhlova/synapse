"use client";

import type { ReactNode } from "react";

import { formatShortDate } from "@/lib/format";

interface EntityListSectionProps {
  title: string;
  count: number;
  emptyLabel: string;
  headerExtra?: ReactNode;
  children: ReactNode;
}

export function EntityListSection({
  title,
  count,
  emptyLabel,
  headerExtra,
  children,
}: EntityListSectionProps) {
  return (
    <section>
      <div className="mb-1 flex items-center justify-between gap-4">
        <h2 className="font-mono text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {title} ({count})
        </h2>
        {headerExtra}
      </div>
      {count > 0 ? (
        <div className="divide-y divide-border">{children}</div>
      ) : (
        <p className="font-mono text-sm text-muted-foreground">{emptyLabel}</p>
      )}
    </section>
  );
}

interface EntityRowProps {
  icon: ReactNode;
  iconColor?: string;
  title: string;
  typeLabel: string;
  date: Date;
  onClick: () => void;
}

export function EntityRow({ icon, iconColor, title, typeLabel, date, onClick }: EntityRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 px-2 py-1.5 text-left font-mono text-sm transition-colors hover:bg-muted/40"
    >
      <span className="flex size-4 shrink-0 items-center justify-center" style={{ color: iconColor }}>
        {icon}
      </span>
      <span className="min-w-0 flex-1 truncate">{title}</span>
      <span className="shrink-0 text-xs text-muted-foreground uppercase tracking-wide">
        {typeLabel}
      </span>
      <span className="w-14 shrink-0 text-right text-xs text-muted-foreground">
        {formatShortDate(date)}
      </span>
    </button>
  );
}
