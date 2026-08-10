"use server";

import { ZodError } from "zod";

import { auth } from "@/auth";
import {
  createCollection as createCollectionQuery,
  deleteCollection as deleteCollectionQuery,
  toggleCollectionFavorite as toggleCollectionFavoriteQuery,
  updateCollection as updateCollectionQuery,
} from "@/lib/db/collections";
import type { CollectionDetail, CollectionWithStats } from "@/lib/db/collections";
import { createCollectionSchema, updateCollectionSchema } from "@/lib/validations/collections";

interface ActionResult<T = CollectionWithStats> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function createCollection(data: unknown): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Not signed in" };

    const validData = await createCollectionSchema.parseAsync(data);

    const outcome = await createCollectionQuery(session.user.id, validData, session.user.isPro);
    if (!outcome.collection) {
      return { success: false, error: outcome.error ?? "Something went wrong. Please try again." };
    }

    return { success: true, data: outcome.collection };
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: error.issues[0]?.message ?? "Invalid input" };
    }
    console.error("Failed to create collection:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function updateCollection(
  id: string,
  data: unknown,
): Promise<ActionResult<CollectionDetail>> {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Not signed in" };

    const validData = await updateCollectionSchema.parseAsync(data);

    const updated = await updateCollectionQuery(session.user.id, id, validData);
    if (!updated) return { success: false, error: "Collection not found" };

    return { success: true, data: updated };
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: error.issues[0]?.message ?? "Invalid input" };
    }
    console.error("Failed to update collection:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function toggleCollectionFavorite(id: string): Promise<ActionResult<CollectionDetail>> {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Not signed in" };

    const updated = await toggleCollectionFavoriteQuery(session.user.id, id);
    if (!updated) return { success: false, error: "Collection not found" };

    return { success: true, data: updated };
  } catch (error) {
    console.error("Failed to toggle collection favorite:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function deleteCollection(id: string): Promise<ActionResult<never>> {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Not signed in" };

    const deleted = await deleteCollectionQuery(session.user.id, id);
    if (!deleted) return { success: false, error: "Collection not found" };

    return { success: true };
  } catch (error) {
    console.error("Failed to delete collection:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
