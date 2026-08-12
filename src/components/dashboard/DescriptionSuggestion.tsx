"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";

import { generateDescription } from "@/actions/ai";
import { Button } from "@/components/ui/button";
import { toastManager } from "@/lib/toast";

interface UseDescriptionSuggestionOptions {
  title: string;
  content: string | null;
  url: string | null;
  fileName: string | null;
  onGenerate: (description: string) => void;
}

export function useDescriptionSuggestion({
  title,
  content,
  url,
  fileName,
  onGenerate,
}: UseDescriptionSuggestionOptions) {
  const [isLoading, setIsLoading] = useState(false);

  async function suggest() {
    setIsLoading(true);
    const result = await generateDescription({ title, content, url, fileName });
    setIsLoading(false);

    if (!result.success || !result.data) {
      toastManager.add({ title: "Couldn't generate description", description: result.error });
      return;
    }

    onGenerate(result.data);
  }

  return { isLoading, suggest };
}

interface DescriptionSuggestButtonProps {
  isPro: boolean;
  isLoading: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export function DescriptionSuggestButton({
  isPro,
  isLoading,
  disabled,
  onClick,
}: DescriptionSuggestButtonProps) {
  if (!isPro) return null;

  return (
    <Button type="button" variant="ghost" size="sm" onClick={onClick} disabled={isLoading || disabled}>
      <Sparkles className="size-4" />
      {isLoading ? "Generating..." : "Suggest description"}
    </Button>
  );
}
