"use client";

import { useState } from "react";
import { Check, Sparkles, X } from "lucide-react";

import { generateAutoTags } from "@/actions/ai";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toastManager } from "@/lib/toast";

interface UseTagSuggestionsOptions {
  title: string;
  content: string | null;
  existingTags: string[];
  onAccept: (tag: string) => void;
}

export function useTagSuggestions({ title, content, existingTags, onAccept }: UseTagSuggestionsOptions) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  async function suggest() {
    setIsLoading(true);
    const result = await generateAutoTags({ title, content });
    setIsLoading(false);

    if (!result.success || !result.data) {
      toastManager.add({ title: "Couldn't suggest tags", description: result.error });
      return;
    }

    const existingLower = existingTags.map((tag) => tag.toLowerCase());
    const filtered = result.data.filter((tag) => !existingLower.includes(tag));
    setSuggestions(filtered);
    if (filtered.length === 0) {
      toastManager.add({ title: "No new tag suggestions" });
    }
  }

  function accept(tag: string) {
    onAccept(tag);
    setSuggestions((prev) => prev.filter((t) => t !== tag));
  }

  function reject(tag: string) {
    setSuggestions((prev) => prev.filter((t) => t !== tag));
  }

  return { suggestions, isLoading, suggest, accept, reject };
}

interface TagSuggestButtonProps {
  isPro: boolean;
  isLoading: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export function TagSuggestButton({ isPro, isLoading, disabled, onClick }: TagSuggestButtonProps) {
  if (!isPro) return null;

  return (
    <Button type="button" variant="ghost" size="sm" onClick={onClick} disabled={isLoading || disabled}>
      <Sparkles className="size-4" />
      {isLoading ? "Suggesting..." : "Suggest tags"}
    </Button>
  );
}

interface TagSuggestionChipsProps {
  suggestions: string[];
  onAccept: (tag: string) => void;
  onReject: (tag: string) => void;
}

export function TagSuggestionChips({ suggestions, onAccept, onReject }: TagSuggestionChipsProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {suggestions.map((tag) => (
        <Badge key={tag} variant="secondary" className="gap-0.5 py-1 pr-1 text-xs">
          {tag}
          <button
            type="button"
            onClick={() => onAccept(tag)}
            aria-label={`Accept tag "${tag}"`}
            className="rounded-full p-0.5 hover:bg-background/60"
          >
            <Check className="size-3 text-blue-500" />
          </button>
          <button
            type="button"
            onClick={() => onReject(tag)}
            aria-label={`Reject tag "${tag}"`}
            className="rounded-full p-0.5 hover:bg-background/60"
          >
            <X className="size-3 text-red-500" />
          </button>
        </Badge>
      ))}
    </div>
  );
}
