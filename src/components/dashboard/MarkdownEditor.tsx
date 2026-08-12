"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, Crown, Loader2, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import type { PromptOptimizeState } from "@/components/dashboard/PromptOptimizer";
import { cn } from "@/lib/utils";

const MIN_HEIGHT = 120;
const MAX_HEIGHT = 400;

type Tab = "write" | "preview";

export interface MarkdownEditorOptimizeProps extends PromptOptimizeState {
  isPro: boolean;
}

interface MarkdownEditorProps {
  value: string;
  readOnly?: boolean;
  onChange?: (value: string) => void;
  className?: string;
  optimize?: MarkdownEditorOptimizeProps;
}

export function MarkdownEditor({
  value,
  readOnly = false,
  onChange,
  className,
  optimize,
}: MarkdownEditorProps) {
  const [tab, setTab] = useState<Tab>(readOnly ? "preview" : "write");
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeTab = readOnly ? "preview" : tab;
  const isReviewing = optimize?.status === "reviewing" && optimize.optimized;

  useEffect(() => {
    if (activeTab !== "write") return;
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(Math.max(textarea.scrollHeight, MIN_HEIGHT), MAX_HEIGHT)}px`;
  }, [value, activeTab]);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className={cn("overflow-hidden rounded-lg border border-input bg-[#1e1e1e]", className)}>
      <div className="flex items-center justify-between border-b border-input bg-[#2d2d2d] px-3 py-1.5">
        <div className="flex items-center gap-1">
          {isReviewing ? (
            <span className="px-2 py-1 text-xs font-medium text-zinc-400">Suggested revision</span>
          ) : readOnly ? (
            <span className="px-2 py-1 text-xs font-medium text-zinc-400">Preview</span>
          ) : (
            (["write", "preview"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={cn(
                  "rounded-md px-2 py-1 text-xs font-medium capitalize transition-colors",
                  activeTab === t
                    ? "bg-white/10 text-zinc-100"
                    : "text-zinc-400 hover:text-zinc-100",
                )}
              >
                {t}
              </button>
            ))
          )}
        </div>
        <div className="flex items-center gap-3">
          {optimize && !isReviewing && (
            optimize.isPro ? (
              <button
                type="button"
                onClick={optimize.optimize}
                disabled={optimize.status === "loading" || !value.trim()}
                className="text-zinc-400 transition-colors hover:text-zinc-100 disabled:opacity-50"
                aria-label="Optimize prompt"
                title="Optimize prompt"
              >
                {optimize.status === "loading" ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Sparkles className="size-3.5" />
                )}
              </button>
            ) : (
              <span
                className="cursor-default text-zinc-600"
                title="AI features require Pro subscription"
                aria-label="AI features require Pro subscription"
              >
                <Crown className="size-3.5" />
              </span>
            )
          )}
          <button
            type="button"
            onClick={() => void handleCopy()}
            className="text-zinc-400 transition-colors hover:text-zinc-100"
            aria-label="Copy markdown"
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          </button>
        </div>
      </div>

      {isReviewing && optimize ? (
        <>
          <div
            className="markdown-preview overflow-y-auto p-3"
            style={{ minHeight: MIN_HEIGHT, maxHeight: MAX_HEIGHT }}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{optimize.optimized ?? ""}</ReactMarkdown>
          </div>
          <div className="flex items-center justify-end gap-2 border-t border-input px-3 py-2">
            <button
              type="button"
              onClick={optimize.cancel}
              className="rounded-md px-2.5 py-1 text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={optimize.accept}
              className="rounded-md bg-white/10 px-2.5 py-1 text-xs font-medium text-zinc-100 transition-colors hover:bg-white/20"
            >
              Use this
            </button>
          </div>
        </>
      ) : activeTab === "write" ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder="Write markdown..."
          className="w-full resize-none bg-transparent p-3 font-mono text-xs text-zinc-100 outline-none placeholder:text-zinc-500"
          style={{ minHeight: MIN_HEIGHT, maxHeight: MAX_HEIGHT }}
        />
      ) : (
        <div
          className="markdown-preview overflow-y-auto p-3"
          style={{ minHeight: MIN_HEIGHT, maxHeight: MAX_HEIGHT }}
        >
          {value.trim() ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
          ) : (
            <p className="text-zinc-500 italic">Nothing to preview</p>
          )}
        </div>
      )}
    </div>
  );
}
