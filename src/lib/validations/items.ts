import { z } from "zod";

import { isR2Url } from "@/lib/r2";

export const updateItemSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().nullable().optional(),
  content: z.string().nullable().optional(),
  url: z.url().nullable().optional(),
  language: z.string().trim().nullable().optional(),
  tags: z.array(z.string().trim().min(1)),
  collectionIds: z.array(z.string()),
});

export type UpdateItemInput = z.infer<typeof updateItemSchema>;

export const CREATABLE_TYPE_NAMES = [
  "snippet",
  "prompt",
  "command",
  "note",
  "link",
  "file",
  "image",
] as const;

const FILE_TYPE_NAMES = ["file", "image"];

export const createItemSchema = z
  .object({
    typeName: z.enum(CREATABLE_TYPE_NAMES),
    title: z.string().trim().min(1, "Title is required"),
    description: z.string().trim().nullable().optional(),
    content: z.string().nullable().optional(),
    url: z.url().nullable().optional(),
    language: z.string().trim().nullable().optional(),
    fileUrl: z.url().nullable().optional(),
    fileName: z.string().trim().nullable().optional(),
    fileSize: z.number().int().positive().nullable().optional(),
    tags: z.array(z.string().trim().min(1)),
    collectionIds: z.array(z.string()),
  })
  .refine((data) => data.typeName !== "link" || !!data.url?.trim(), {
    message: "URL is required",
    path: ["url"],
  })
  .refine((data) => !FILE_TYPE_NAMES.includes(data.typeName) || !!data.fileUrl?.trim(), {
    message: "A file upload is required",
    path: ["fileUrl"],
  })
  .refine((data) => !data.fileUrl || isR2Url(data.fileUrl), {
    message: "Invalid file URL",
    path: ["fileUrl"],
  });

export type CreateItemInput = z.infer<typeof createItemSchema>;
