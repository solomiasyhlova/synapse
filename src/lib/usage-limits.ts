export const FREE_ITEM_LIMIT = 50;
export const FREE_COLLECTION_LIMIT = 3;
export const PRO_ONLY_TYPE_NAMES = ["file", "image"];

export interface UsageLimitResult {
  allowed: boolean;
  reason?: string;
}

export function isProOnlyType(typeName: string): boolean {
  return PRO_ONLY_TYPE_NAMES.includes(typeName);
}

export function canCreateItem(
  isPro: boolean,
  currentItemCount: number,
  typeName: string,
): UsageLimitResult {
  if (!isPro && isProOnlyType(typeName)) {
    return { allowed: false, reason: `${typeName} items are a Pro feature.` };
  }

  if (!isPro && currentItemCount >= FREE_ITEM_LIMIT) {
    return {
      allowed: false,
      reason: `You've hit the free plan's ${FREE_ITEM_LIMIT}-item limit — upgrade to Pro for unlimited items.`,
    };
  }

  return { allowed: true };
}

export function canCreateCollection(
  isPro: boolean,
  currentCollectionCount: number,
): UsageLimitResult {
  if (!isPro && currentCollectionCount >= FREE_COLLECTION_LIMIT) {
    return {
      allowed: false,
      reason: `You've hit the free plan's ${FREE_COLLECTION_LIMIT}-collection limit — upgrade to Pro for unlimited collections.`,
    };
  }

  return { allowed: true };
}
