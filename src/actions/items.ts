"use server";

import { ZodError } from "zod";

import { auth } from "@/auth";
import { updateItem as updateItemQuery } from "@/lib/db/items";
import type { ItemDetail } from "@/lib/db/items";
import { updateItemSchema } from "@/lib/validations/items";

interface ActionResult {
  success: boolean;
  data?: ItemDetail;
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
