import { GoogleGenAI } from "@google/genai";

// gemini-2.5-flash-lite is scheduled to retire on the Gemini Developer API
// (Oct 16, 2026); gemini-3.5-flash-lite is the current-gen replacement.
export const AI_MODEL = "gemini-3.5-flash-lite";

// Constructing the client throws immediately if the key is missing, which would crash
// `next build` at import time (Next evaluates route modules while collecting page data,
// even for routes that never execute) — same deferred-singleton pattern as src/lib/stripe.ts.
let geminiClient: GoogleGenAI | undefined;

export function getGeminiClient(): GoogleGenAI {
  geminiClient ??= new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY ?? "" });
  return geminiClient;
}
