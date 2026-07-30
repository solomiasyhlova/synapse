export function typeNameToSlug(name: string): string {
  return name.endsWith("s") ? name : `${name}s`;
}

export function slugToTypeName(slug: string): string {
  return slug.endsWith("s") ? slug.slice(0, -1) : slug;
}
