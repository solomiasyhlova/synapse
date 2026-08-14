"use server";

import { handleActionError, requireSession } from "@/lib/actions";
import { updateEditorPreferences as updateEditorPreferencesQuery } from "@/lib/db/settings";
import type { EditorPreferences } from "@/lib/editor-preferences";
import { editorPreferencesSchema } from "@/lib/validations/settings";
import type { ActionResult } from "@/types/actions";

export async function updateEditorPreferences(data: unknown): Promise<ActionResult<EditorPreferences>> {
  try {
    const session = await requireSession();

    const validData = await editorPreferencesSchema.parseAsync(data);
    const updated = await updateEditorPreferencesQuery(session.user.id, validData);

    return { success: true, data: updated };
  } catch (error) {
    return handleActionError(error, "Failed to update editor preferences:");
  }
}
