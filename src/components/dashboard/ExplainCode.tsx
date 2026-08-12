"use client";

import { useEffect, useRef, useState } from "react";

import { getCachedExplanation, setCachedExplanation } from "@/lib/ai/explain-cache";
import { toastManager } from "@/lib/toast";

export type ExplainStatus = "idle" | "loading" | "streaming" | "done" | "error";

interface UseExplainCodeOptions {
  itemId: string;
  title: string;
  content: string;
  language: string | null;
}

export interface ExplainCodeState {
  status: ExplainStatus;
  explanation: string | null;
  explain: () => void;
}

export function useExplainCode({ itemId, title, content, language }: UseExplainCodeOptions): ExplainCodeState {
  const cached = getCachedExplanation(itemId) ?? null;
  const [explanation, setExplanation] = useState<string | null>(cached);
  const [status, setStatus] = useState<ExplainStatus>(cached ? "done" : "idle");
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  async function explain() {
    if (explanation) return;

    setStatus("loading");
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch("/api/ai/explain-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, language }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "Failed to generate explanation");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let text = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        setStatus("streaming");
        setExplanation(text);
      }

      if (!text.trim()) {
        throw new Error("Failed to generate explanation");
      }

      setCachedExplanation(itemId, text);
      setStatus("done");
    } catch (error) {
      if (controller.signal.aborted) return;
      setStatus("error");
      toastManager.add({
        title: "Couldn't explain code",
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }

  return { status, explanation, explain: () => void explain() };
}
