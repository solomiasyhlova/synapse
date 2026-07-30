import { z } from "zod";

export const updateItemSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().nullable().optional(),
  content: z.string().nullable().optional(),
  url: z.url().nullable().optional(),
  language: z.string().trim().nullable().optional(),
  tags: z.array(z.string().trim().min(1)),
});

export type UpdateItemInput = z.infer<typeof updateItemSchema>;
