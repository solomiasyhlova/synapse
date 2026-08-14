"use client";

import { Crown, Loader2, Sparkles } from "lucide-react";

interface AiTriggerButtonProps {
  isPro: boolean;
  showSpinner: boolean;
  disabled?: boolean;
  onClick: () => void;
  label: string;
}

export function AiTriggerButton({
  isPro,
  showSpinner,
  disabled,
  onClick,
  label,
}: AiTriggerButtonProps) {
  if (!isPro) {
    return (
      <span
        className="cursor-default text-zinc-600"
        title="AI features require Pro subscription"
        aria-label="AI features require Pro subscription"
      >
        <Crown className="size-3.5" />
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="text-zinc-400 transition-colors hover:text-zinc-100 disabled:opacity-50"
      aria-label={label}
      title={label}
    >
      {showSpinner ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <Sparkles className="size-3.5" />
      )}
    </button>
  );
}
