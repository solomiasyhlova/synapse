import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { toEditorPreferences, type EditorPreferences } from "@/lib/editor-preferences";

export async function getEditorPreferences(userId: string): Promise<EditorPreferences> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { editorPreferences: true },
  });
  return toEditorPreferences(user?.editorPreferences);
}

export async function updateEditorPreferences(
  userId: string,
  preferences: EditorPreferences,
): Promise<EditorPreferences> {
  await prisma.user.update({
    where: { id: userId },
    data: { editorPreferences: preferences as unknown as Prisma.InputJsonValue },
  });
  return preferences;
}
