import { z } from "zod";

export const generateAutoTagsSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  content: z.string().nullable(),
});

export type GenerateAutoTagsInput = z.infer<typeof generateAutoTagsSchema>;
