import { z } from "zod";

import { EDITOR_THEMES } from "@/lib/editor-preferences";

export const editorPreferencesSchema = z.object({
  fontSize: z.number().int().min(10).max(24),
  tabSize: z.number().int().min(1).max(8),
  wordWrap: z.boolean(),
  minimap: z.boolean(),
  theme: z.enum(EDITOR_THEMES),
});

export type EditorPreferencesInput = z.infer<typeof editorPreferencesSchema>;
