"use server";

import { ZodError } from "zod";

import { auth } from "@/auth";
import { createCollection as createCollectionQuery } from "@/lib/db/collections";
import type { CollectionWithStats } from "@/lib/db/collections";
import { createCollectionSchema } from "@/lib/validations/collections";

interface ActionResult {
  success: boolean;
  data?: CollectionWithStats;
  error?: string;
}

export async function createCollection(data: unknown): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Not signed in" };

    const validData = await createCollectionSchema.parseAsync(data);

    const created = await createCollectionQuery(session.user.id, validData);

    return { success: true, data: created };
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: error.issues[0]?.message ?? "Invalid input" };
    }
    console.error("Failed to create collection:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
