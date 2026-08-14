export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatShortDate(date: Date, options?: { includeYear?: boolean }) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(options?.includeYear ? { year: "numeric" as const } : {}),
  });
}
