import { NextResponse } from "next/server";
import { ApiError } from "@google/genai";
import { ZodError } from "zod";

import { auth } from "@/auth";
import { AI_MODEL_REASONING, getGeminiClient } from "@/lib/ai/gemini-client";
import { buildExplainPrompt } from "@/lib/ai/explain-prompt";
import { checkRateLimit, rateLimitMessage, rateLimiters } from "@/lib/rate-limit";
import { explainCodeSchema } from "@/lib/validations/ai";

const SYSTEM_INSTRUCTION =
  "You are a code-explanation assistant for a developer knowledge base. Given a snippet or " +
  "terminal command's title, language, and content, explain in about 200-300 words what it " +
  "does and the key concepts involved. Respond in plain markdown — no surrounding code fence " +
  "around the whole response.";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  if (!session.user.isPro) {
    return NextResponse.json({ error: "AI code explanation is a Pro feature" }, { status: 403 });
  }

  const rateLimit = await checkRateLimit(rateLimiters.explainCode, session.user.id);
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: rateLimitMessage(rateLimit.reset) },
      {
        status: 429,
        headers: { "Retry-After": Math.ceil((rateLimit.reset - Date.now()) / 1000).toString() },
      }
    );
  }

  let title: string, content: string, language: string | null;
  try {
    const body = await request.json();
    ({ title, content, language } = explainCodeSchema.parse(body));
  } catch (error) {
    const message = error instanceof ZodError ? (error.issues[0]?.message ?? "Invalid input") : "Invalid input";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    const stream = await getGeminiClient().models.generateContentStream({
      model: AI_MODEL_REASONING,
      contents: buildExplainPrompt(title, content, language),
      config: { systemInstruction: SYSTEM_INSTRUCTION },
    });

    const encoder = new TextEncoder();
    return new Response(
      new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              // Stop pulling further chunks once the client has disconnected (drawer
              // closed, navigated away) — the free-tier Gemini quota is shared across
              // every user of this app, so an abandoned stream shouldn't keep consuming it.
              if (request.signal.aborted) break;
              if (chunk.text) controller.enqueue(encoder.encode(chunk.text));
            }
          } catch (error) {
            console.error("explainCode stream failed:", error);
          } finally {
            try {
              controller.close();
            } catch {
              // already closed if the client disconnected
            }
          }
        },
      }),
      { headers: { "Content-Type": "text/plain; charset=utf-8" } }
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 429) {
      return NextResponse.json({ error: "AI is busy right now — try again in a minute." }, { status: 429 });
    }
    console.error("explainCode failed:", error);
    return NextResponse.json({ error: "Failed to generate explanation" }, { status: 500 });
  }
}
