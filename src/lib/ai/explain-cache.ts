// Lightweight per-session cache so re-opening the same item's drawer doesn't
// re-call Gemini (explanations aren't persisted to the DB). Module-level, not
// React state, so it survives the drawer unmounting/remounting between opens.
const cache = new Map<string, string>();

export function getCachedExplanation(itemId: string): string | undefined {
  return cache.get(itemId);
}

export function setCachedExplanation(itemId: string, explanation: string): void {
  cache.set(itemId, explanation);
}
