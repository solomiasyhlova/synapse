"use client";

import { useState } from "react";

import { optimizePrompt } from "@/actions/ai";
import { toastManager } from "@/lib/toast";

export type PromptOptimizeStatus = "idle" | "loading" | "reviewing";

interface UsePromptOptimizeOptions {
  title: string;
  content: string;
  onAccept: (optimized: string) => void;
}

export interface PromptOptimizeState {
  status: PromptOptimizeStatus;
  optimized: string | null;
  optimize: () => void;
  accept: () => void;
  cancel: () => void;
}

export function usePromptOptimize({ title, content, onAccept }: UsePromptOptimizeOptions): PromptOptimizeState {
  const [status, setStatus] = useState<PromptOptimizeStatus>("idle");
  const [optimized, setOptimized] = useState<string | null>(null);

  async function optimize() {
    setStatus("loading");
    const result = await optimizePrompt({ title, content });

    if (!result.success || !result.data) {
      setStatus("idle");
      toastManager.add({ title: "Couldn't optimize prompt", description: result.error });
      return;
    }

    setOptimized(result.data);
    setStatus("reviewing");
  }

  function accept() {
    if (optimized) onAccept(optimized);
    setStatus("idle");
    setOptimized(null);
  }

  function cancel() {
    setStatus("idle");
    setOptimized(null);
  }

  return { status, optimized, optimize: () => void optimize(), accept, cancel };
}
