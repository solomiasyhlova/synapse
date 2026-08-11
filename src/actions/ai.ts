"use server";

import { ApiError } from "@google/genai";
import { ZodError } from "zod";

import { auth } from "@/auth";
import { AI_MODEL, getGeminiClient } from "@/lib/ai/gemini-client";
import { checkRateLimit, rateLimitMessage, rateLimiters } from "@/lib/rate-limit";
import { generateAutoTagsSchema } from "@/lib/validations/ai";

interface GenerateAutoTagsResult {
  success: boolean;
  data?: string[];
  error?: string;
}

const MAX_CONTENT_LENGTH = 2000;

const SYSTEM_INSTRUCTION =
  "You are a tagging assistant for a developer knowledge base. Given an item's title " +
  "and content, suggest 3-5 short, lowercase, freeform tags describing its topic, " +
  "language, or purpose. Respond with JSON only.";

export async function generateAutoTags(data: unknown): Promise<GenerateAutoTagsResult> {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Not signed in" };
    if (!session.user.isPro) return { success: false, error: "AI tagging is a Pro feature" };

    const { title, content } = await generateAutoTagsSchema.parseAsync(data);

    const rateLimit = await checkRateLimit(rateLimiters.autoTag, session.user.id);
    if (!rateLimit.success) {
      return { success: false, error: rateLimitMessage(rateLimit.reset) };
    }

    const truncatedContent = content?.slice(0, MAX_CONTENT_LENGTH) || "(no content)";

    const response = await getGeminiClient().models.generateContent({
      model: AI_MODEL,
      contents: `Title: ${title}\n\nContent:\n${truncatedContent}`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
      },
    });

    const tags = parseTagsResponse(response.text);
    if (tags.length === 0) {
      return { success: false, error: "No tag suggestions returned" };
    }

    return { success: true, data: tags };
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: error.issues[0]?.message ?? "Invalid input" };
    }
    if (error instanceof ApiError && error.status === 429) {
      return { success: false, error: "AI is busy right now — try again in a minute." };
    }
    console.error("generateAutoTags failed:", error);
    return { success: false, error: "Failed to generate tag suggestions" };
  }
}

function parseTagsResponse(text: string | undefined): string[] {
  if (!text) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return [];
  }

  const raw = Array.isArray(parsed)
    ? parsed
    : parsed && typeof parsed === "object" && "tags" in parsed
      ? (parsed as { tags: unknown }).tags
      : [];
  if (!Array.isArray(raw)) return [];

  return raw
    .filter((tag): tag is string => typeof tag === "string")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);
}
