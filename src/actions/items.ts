"use server";

import { ZodError } from "zod";

import { auth } from "@/auth";
import { deleteItem as deleteItemQuery, updateItem as updateItemQuery } from "@/lib/db/items";
import type { ItemDetail } from "@/lib/db/items";
import { updateItemSchema } from "@/lib/validations/items";

interface ActionResult {
  success: boolean;
  data?: ItemDetail;
  error?: string;
}

interface DeleteActionResult {
  success: boolean;
  error?: string;
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

export async function deleteItem(itemId: string): Promise<DeleteActionResult> {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Not signed in" };

    const deleted = await deleteItemQuery(session.user.id, itemId);
    if (!deleted) {
      return { success: false, error: "Item not found" };
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to delete item:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
