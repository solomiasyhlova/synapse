"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { AiTriggerButton } from "@/components/dashboard/AiTriggerButton";
import type { PromptOptimizeState } from "@/components/dashboard/PromptOptimizer";
import { useCopyToClipboard } from "@/components/dashboard/use-copy-to-clipboard";
import { EDITOR_MAX_HEIGHT as MAX_HEIGHT, EDITOR_MIN_HEIGHT as MIN_HEIGHT } from "@/lib/editor-chrome";
import { cn } from "@/lib/utils";

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
  const { copied, copy } = useCopyToClipboard();
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
            <AiTriggerButton
              isPro={optimize.isPro}
              showSpinner={optimize.status === "loading"}
              disabled={optimize.status === "loading" || !value.trim()}
              onClick={optimize.optimize}
              label="Optimize prompt"
            />
          )}
          <button
            type="button"
            onClick={() => void copy(value)}
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
