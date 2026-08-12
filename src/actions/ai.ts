"use server";

import { ApiError } from "@google/genai";
import { ZodError } from "zod";

import { auth } from "@/auth";
import { AI_MODEL, getGeminiClient } from "@/lib/ai/gemini-client";
import { checkRateLimit, rateLimitMessage, rateLimiters } from "@/lib/rate-limit";
import { generateAutoTagsSchema, generateDescriptionSchema, optimizePromptSchema } from "@/lib/validations/ai";

interface GenerateAutoTagsResult {
  success: boolean;
  data?: string[];
  error?: string;
}

interface GenerateDescriptionResult {
  success: boolean;
  data?: string;
  error?: string;
}

interface OptimizePromptResult {
  success: boolean;
  data?: string;
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

const DESCRIPTION_SYSTEM_INSTRUCTION =
  "You are a summarization assistant for a developer knowledge base. Given an item's title " +
  "and whatever context is available (content, a URL, or a file name), write a concise, " +
  "specific 1-2 sentence description of what it is or does. Respond with JSON only.";

export async function generateDescription(data: unknown): Promise<GenerateDescriptionResult> {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Not signed in" };
    if (!session.user.isPro) return { success: false, error: "AI descriptions are a Pro feature" };

    const { title, content, url, fileName } = await generateDescriptionSchema.parseAsync(data);

    const rateLimit = await checkRateLimit(rateLimiters.aiSummary, session.user.id);
    if (!rateLimit.success) {
      return { success: false, error: rateLimitMessage(rateLimit.reset) };
    }

    const context = buildDescriptionContext({ content, url, fileName });

    const response = await getGeminiClient().models.generateContent({
      model: AI_MODEL,
      contents: `Title: ${title}\n\n${context}`,
      config: {
        systemInstruction: DESCRIPTION_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
      },
    });

    const description = parseDescriptionResponse(response.text);
    if (!description) {
      return { success: false, error: "No description generated" };
    }

    return { success: true, data: description };
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: error.issues[0]?.message ?? "Invalid input" };
    }
    if (error instanceof ApiError && error.status === 429) {
      return { success: false, error: "AI is busy right now — try again in a minute." };
    }
    console.error("generateDescription failed:", error);
    return { success: false, error: "Failed to generate description" };
  }
}

const OPTIMIZE_PROMPT_SYSTEM_INSTRUCTION =
  "You are a prompt engineering assistant for a developer knowledge base. Given the title and " +
  "current text of a saved AI prompt, rewrite it to be clearer, more specific, and more " +
  "effective, while preserving its original intent. If the prompt is already well-written, " +
  'make only minor improvements. Respond with JSON only, in the exact shape {"optimized": "<rewritten prompt text>"}.';

export async function optimizePrompt(data: unknown): Promise<OptimizePromptResult> {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Not signed in" };
    if (!session.user.isPro) return { success: false, error: "Prompt optimization is a Pro feature" };

    const { title, content } = await optimizePromptSchema.parseAsync(data);

    const rateLimit = await checkRateLimit(rateLimiters.promptOptimize, session.user.id);
    if (!rateLimit.success) {
      return { success: false, error: rateLimitMessage(rateLimit.reset) };
    }

    const truncatedContent = content.slice(0, MAX_CONTENT_LENGTH);

    const response = await getGeminiClient().models.generateContent({
      model: AI_MODEL,
      contents: `Title: ${title}\n\nPrompt:\n${truncatedContent}`,
      config: {
        systemInstruction: OPTIMIZE_PROMPT_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
      },
    });

    const optimized = parseOptimizedPromptResponse(response.text);
    if (!optimized) {
      return { success: false, error: "No optimized prompt generated" };
    }

    return { success: true, data: optimized };
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: error.issues[0]?.message ?? "Invalid input" };
    }
    if (error instanceof ApiError && error.status === 429) {
      return { success: false, error: "AI is busy right now — try again in a minute." };
    }
    console.error("optimizePrompt failed:", error);
    return { success: false, error: "Failed to optimize prompt" };
  }
}

function parseOptimizedPromptResponse(text: string | undefined): string | null {
  if (!text) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }

  const raw =
    parsed && typeof parsed === "object" && "optimized" in parsed
      ? (parsed as { optimized: unknown }).optimized
      : parsed && typeof parsed === "object" && "prompt" in parsed
        ? (parsed as { prompt: unknown }).prompt
        : typeof parsed === "string"
          ? parsed
          : null;

  return typeof raw === "string" && raw.trim() ? raw.trim() : null;
}

function buildDescriptionContext({
  content,
  url,
  fileName,
}: {
  content: string | null;
  url: string | null;
  fileName: string | null;
}): string {
  const parts: string[] = [];
  if (content?.trim()) parts.push(`Content:\n${content.slice(0, MAX_CONTENT_LENGTH)}`);
  if (url?.trim()) parts.push(`URL: ${url}`);
  if (fileName?.trim()) parts.push(`File name: ${fileName}`);
  return parts.length > 0 ? parts.join("\n\n") : "(no additional content available)";
}

function parseDescriptionResponse(text: string | undefined): string | null {
  if (!text) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }

  const raw =
    parsed && typeof parsed === "object" && "description" in parsed
      ? (parsed as { description: unknown }).description
      : typeof parsed === "string"
        ? parsed
        : null;

  return typeof raw === "string" && raw.trim() ? raw.trim() : null;
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
