"use server";

import { ZodError } from "zod";

import { auth } from "@/auth";
import { updateEditorPreferences as updateEditorPreferencesQuery } from "@/lib/db/settings";
import type { EditorPreferences } from "@/lib/editor-preferences";
import { editorPreferencesSchema } from "@/lib/validations/settings";

interface ActionResult {
  success: boolean;
  data?: EditorPreferences;
  error?: string;
}

export async function updateEditorPreferences(data: unknown): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Not signed in" };

    const validData = await editorPreferencesSchema.parseAsync(data);
    const updated = await updateEditorPreferencesQuery(session.user.id, validData);

    return { success: true, data: updated };
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: error.issues[0]?.message ?? "Invalid input" };
    }
    console.error("Failed to update editor preferences:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
