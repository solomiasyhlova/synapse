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

export const CREATABLE_TYPE_NAMES = ["snippet", "prompt", "command", "note", "link"] as const;

export const createItemSchema = z
  .object({
    typeName: z.enum(CREATABLE_TYPE_NAMES),
    title: z.string().trim().min(1, "Title is required"),
    description: z.string().trim().nullable().optional(),
    content: z.string().nullable().optional(),
    url: z.url().nullable().optional(),
    language: z.string().trim().nullable().optional(),
    tags: z.array(z.string().trim().min(1)),
  })
  .refine((data) => data.typeName !== "link" || !!data.url?.trim(), {
    message: "URL is required",
    path: ["url"],
  });

export type CreateItemInput = z.infer<typeof createItemSchema>;
