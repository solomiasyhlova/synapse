import { GoogleGenAI } from "@google/genai";

// gemini-2.5-flash-lite is scheduled to retire on the Gemini Developer API
// (Oct 16, 2026); gemini-3.5-flash-lite is the current-gen replacement.
export const AI_MODEL = "gemini-3.5-flash-lite";

// Reasoning tier for tasks where output quality matters more than cost (code
// explanation, prompt optimization) — gemini-3.6-flash is the Gemini 3 family's
// current-gen equivalent of the (also-retiring) gemini-2.5-flash. Drop to
// AI_MODEL if this model's free-tier daily quota proves too tight in practice.
export const AI_MODEL_REASONING = "gemini-3.6-flash";

// Constructing the client throws immediately if the key is missing, which would crash
// `next build` at import time (Next evaluates route modules while collecting page data,
// even for routes that never execute) — same deferred-singleton pattern as src/lib/stripe.ts.
let geminiClient: GoogleGenAI | undefined;

export function getGeminiClient(): GoogleGenAI {
  geminiClient ??= new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY ?? "" });
  return geminiClient;
}
