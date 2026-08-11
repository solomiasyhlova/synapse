export function parseTagsInput(value: string): string[] {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function appendTag(current: string, tag: string): string {
  const existing = parseTagsInput(current);
  if (existing.some((existingTag) => existingTag.toLowerCase() === tag.toLowerCase())) {
    return current;
  }
  return [...existing, tag].join(", ");
}
