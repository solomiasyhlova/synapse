"use server";

import { ZodError } from "zod";

import { auth } from "@/auth";
import {
  createItem as createItemQuery,
  deleteItem as deleteItemQuery,
  toggleItemFavorite as toggleItemFavoriteQuery,
  updateItem as updateItemQuery,
} from "@/lib/db/items";
import type { ItemDetail } from "@/lib/db/items";
import { deleteFileFromR2 } from "@/lib/r2";
import { createItemSchema, updateItemSchema } from "@/lib/validations/items";

interface ActionResult {
  success: boolean;
  data?: ItemDetail;
  error?: string;
}

interface DeleteActionResult {
  success: boolean;
  error?: string;
}

export async function createItem(data: unknown): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Not signed in" };

    const validData = await createItemSchema.parseAsync(data);

    const created = await createItemQuery(session.user.id, validData.typeName, {
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
    });
    if (!created) {
      return { success: false, error: "Item type not found" };
    }

    return { success: true, data: created };
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: error.issues[0]?.message ?? "Invalid input" };
    }
    console.error("Failed to create item:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function updateItem(itemId: string, data: unknown): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Not signed in" };

    const validData = await updateItemSchema.parseAsync(data);

    const updated = await updateItemQuery(session.user.id, itemId, validData);
    if (!updated) {
      return { success: false, error: "Item not found" };
    }

    return { success: true, data: updated };
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: error.issues[0]?.message ?? "Invalid input" };
    }
    console.error("Failed to update item:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function toggleItemFavorite(itemId: string): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Not signed in" };

    const updated = await toggleItemFavoriteQuery(session.user.id, itemId);
    if (!updated) {
      return { success: false, error: "Item not found" };
    }

    return { success: true, data: updated };
  } catch (error) {
    console.error("Failed to toggle item favorite:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function deleteItem(itemId: string): Promise<DeleteActionResult> {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Not signed in" };

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
    console.error("Failed to delete item:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
