"use server";

import { handleActionError, requireSession } from "@/lib/actions";
import {
  createCollection as createCollectionQuery,
  deleteCollection as deleteCollectionQuery,
  toggleCollectionFavorite as toggleCollectionFavoriteQuery,
  updateCollection as updateCollectionQuery,
} from "@/lib/db/collections";
import type { CollectionDetail, CollectionWithStats } from "@/lib/db/collections";
import { createCollectionSchema, updateCollectionSchema } from "@/lib/validations/collections";
import type { ActionResult } from "@/types/actions";

export async function createCollection(data: unknown): Promise<ActionResult<CollectionWithStats>> {
  try {
    const session = await requireSession();

    const validData = await createCollectionSchema.parseAsync(data);

    const outcome = await createCollectionQuery(session.user.id, validData, session.user.isPro);
    if (!outcome.collection) {
      return { success: false, error: outcome.error ?? "Something went wrong. Please try again." };
    }

    return { success: true, data: outcome.collection };
  } catch (error) {
    return handleActionError(error, "Failed to create collection:");
  }
}

export async function updateCollection(
  id: string,
  data: unknown,
): Promise<ActionResult<CollectionDetail>> {
  try {
    const session = await requireSession();

    const validData = await updateCollectionSchema.parseAsync(data);

    const updated = await updateCollectionQuery(session.user.id, id, validData);
    if (!updated) return { success: false, error: "Collection not found" };

    return { success: true, data: updated };
  } catch (error) {
    return handleActionError(error, "Failed to update collection:");
  }
}

export async function toggleCollectionFavorite(id: string): Promise<ActionResult<CollectionDetail>> {
  try {
    const session = await requireSession();

    const updated = await toggleCollectionFavoriteQuery(session.user.id, id);
    if (!updated) return { success: false, error: "Collection not found" };

    return { success: true, data: updated };
  } catch (error) {
    return handleActionError(error, "Failed to toggle collection favorite:");
  }
}

export async function deleteCollection(id: string): Promise<ActionResult> {
  try {
    const session = await requireSession();

    const deleted = await deleteCollectionQuery(session.user.id, id);
    if (!deleted) return { success: false, error: "Collection not found" };

    return { success: true };
  } catch (error) {
    return handleActionError(error, "Failed to delete collection:");
  }
}
