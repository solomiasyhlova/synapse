import { z } from "zod";

export const generateAutoTagsSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  content: z.string().nullable(),
});

export type GenerateAutoTagsInput = z.infer<typeof generateAutoTagsSchema>;

export const generateDescriptionSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  content: z.string().nullable(),
  url: z.string().nullable(),
  fileName: z.string().nullable(),
});

export type GenerateDescriptionInput = z.infer<typeof generateDescriptionSchema>;

export const explainCodeSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  content: z.string().trim().min(1, "Content is required"),
  language: z.string().nullable(),
});

export type ExplainCodeInput = z.infer<typeof explainCodeSchema>;

export const optimizePromptSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  content: z.string().trim().min(1, "Content is required"),
});

export type OptimizePromptInput = z.infer<typeof optimizePromptSchema>;
