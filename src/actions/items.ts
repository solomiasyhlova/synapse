"use server";

import { handleActionError, requireSession } from "@/lib/actions";
import {
  createItem as createItemQuery,
  deleteItem as deleteItemQuery,
  toggleItemFavorite as toggleItemFavoriteQuery,
  toggleItemPin as toggleItemPinQuery,
  updateItem as updateItemQuery,
} from "@/lib/db/items";
import type { ItemDetail } from "@/lib/db/items";
import { deleteFileFromR2 } from "@/lib/r2";
import { createItemSchema, updateItemSchema } from "@/lib/validations/items";
import type { ActionResult } from "@/types/actions";

export async function createItem(data: unknown): Promise<ActionResult<ItemDetail>> {
  try {
    const session = await requireSession();

    const validData = await createItemSchema.parseAsync(data);

    const outcome = await createItemQuery(
      session.user.id,
      validData.typeName,
      {
        title: validData.title,
        description: validData.description,
        content: validData.content,
        url: validData.url,
        language: validData.language,
        fileUrl: validData.fileUrl,
        fileName: validData.fileName,
        fileSize: validData.fileSize,
        tags: validData.tags,
        collectionIds: validData.collectionIds,
      },
      session.user.isPro,
    );
    if (!outcome.item) {
      return { success: false, error: outcome.error ?? "Item type not found" };
    }

    return { success: true, data: outcome.item };
  } catch (error) {
    return handleActionError(error, "Failed to create item:");
  }
}

export async function updateItem(itemId: string, data: unknown): Promise<ActionResult<ItemDetail>> {
  try {
    const session = await requireSession();

    const validData = await updateItemSchema.parseAsync(data);

    const updated = await updateItemQuery(session.user.id, itemId, validData);
    if (!updated) {
      return { success: false, error: "Item not found" };
    }

    return { success: true, data: updated };
  } catch (error) {
    return handleActionError(error, "Failed to update item:");
  }
}

export async function toggleItemFavorite(itemId: string): Promise<ActionResult<ItemDetail>> {
  try {
    const session = await requireSession();

    const updated = await toggleItemFavoriteQuery(session.user.id, itemId);
    if (!updated) {
      return { success: false, error: "Item not found" };
    }

    return { success: true, data: updated };
  } catch (error) {
    return handleActionError(error, "Failed to toggle item favorite:");
  }
}

export async function toggleItemPin(itemId: string): Promise<ActionResult<ItemDetail>> {
  try {
    const session = await requireSession();

    const updated = await toggleItemPinQuery(session.user.id, itemId);
    if (!updated) {
      return { success: false, error: "Item not found" };
    }

    return { success: true, data: updated };
  } catch (error) {
    return handleActionError(error, "Failed to toggle item pin:");
  }
}

export async function deleteItem(itemId: string): Promise<ActionResult> {
  try {
    const session = await requireSession();

    const deleted = await deleteItemQuery(session.user.id, itemId);
    if (!deleted) {
      return { success: false, error: "Item not found" };
    }

    if (deleted.fileUrl) {
      try {
        await deleteFileFromR2(deleted.fileUrl);
      } catch (error) {
        console.error("Failed to delete file from R2:", error);
      }
    }

    return { success: true };
  } catch (error) {
    return handleActionError(error, "Failed to delete item:");
  }
}
