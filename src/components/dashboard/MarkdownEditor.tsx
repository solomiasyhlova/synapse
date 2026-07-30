"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

const MIN_HEIGHT = 120;
const MAX_HEIGHT = 400;

type Tab = "write" | "preview";

interface MarkdownEditorProps {
  value: string;
  readOnly?: boolean;
  onChange?: (value: string) => void;
  className?: string;
}

export function MarkdownEditor({
  value,
  readOnly = false,
  onChange,
  className,
}: MarkdownEditorProps) {
  const [tab, setTab] = useState<Tab>(readOnly ? "preview" : "write");
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeTab = readOnly ? "preview" : tab;

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
          {readOnly ? (
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
        <button
          type="button"
          onClick={() => void handleCopy()}
          className="text-zinc-400 transition-colors hover:text-zinc-100"
          aria-label="Copy markdown"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        </button>
      </div>

      {activeTab === "write" ? (
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
