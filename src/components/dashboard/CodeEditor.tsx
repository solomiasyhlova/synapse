"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Check, Copy } from "lucide-react";
import type { OnMount } from "@monaco-editor/react";

import { cn } from "@/lib/utils";

const Editor = dynamic(() => import("@monaco-editor/react").then((mod) => mod.Editor), {
  ssr: false,
  loading: () => <div className="h-30 animate-pulse bg-[#18181b]" />,
});

const MIN_HEIGHT = 120;
const MAX_HEIGHT = 400;

// Free-text `language` values (typed by the user) don't always match Monaco's language ids.
const LANGUAGE_ALIASES: Record<string, string> = {
  js: "javascript",
  jsx: "javascript",
  ts: "typescript",
  tsx: "typescript",
  sh: "shell",
  bash: "shell",
  zsh: "shell",
  yml: "yaml",
  md: "markdown",
  py: "python",
  rb: "ruby",
  "c++": "cpp",
  "c#": "csharp",
};

function toMonacoLanguage(language?: string | null) {
  if (!language) return "plaintext";
  const normalized = language.trim().toLowerCase();
  return LANGUAGE_ALIASES[normalized] ?? normalized;
}

interface CodeEditorProps {
  value: string;
  language?: string | null;
  readOnly?: boolean;
  onChange?: (value: string) => void;
  className?: string;
}

export function CodeEditor({ value, language, readOnly = false, onChange, className }: CodeEditorProps) {
  const [copied, setCopied] = useState(false);
  const [height, setHeight] = useState(MIN_HEIGHT);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const handleMount: OnMount = (editor, monaco) => {
    monaco.editor.defineTheme("synapse-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#18181b",
        "editor.lineHighlightBackground": "#18181b",
        "editorLineNumber.foreground": "#52525b",
        "editorLineNumber.activeForeground": "#a1a1aa",
        "editorGutter.background": "#18181b",
        "scrollbarSlider.background": "#3f3f4666",
        "scrollbarSlider.hoverBackground": "#52525b88",
        "scrollbarSlider.activeBackground": "#71717aaa",
      },
    });
    monaco.editor.setTheme("synapse-dark");

    const updateHeight = () => {
      const contentHeight = editor.getContentHeight();
      setHeight(Math.min(Math.max(contentHeight, MIN_HEIGHT), MAX_HEIGHT));
    };
    updateHeight();
    editor.onDidContentSizeChange(updateHeight);
  };

  return (
    <div className={cn("overflow-hidden rounded-lg border border-input", className)}>
      <div className="flex items-center justify-between border-b border-input bg-[#18181b] px-3 py-2">
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-[#ff5f56]" />
          <span className="size-2.5 rounded-full bg-[#ffbd2e]" />
          <span className="size-2.5 rounded-full bg-[#27c93f]" />
        </div>
        <div className="flex items-center gap-3">
          {language && (
            <span className="font-mono text-xs text-zinc-400">{language}</span>
          )}
          <button
            type="button"
            onClick={() => void handleCopy()}
            className="text-zinc-400 transition-colors hover:text-zinc-100"
            aria-label="Copy code"
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          </button>
        </div>
      </div>
      <div style={{ height }} className="transition-[height] duration-150">
        <Editor
          value={value}
          language={toMonacoLanguage(language)}
          theme="synapse-dark"
          onMount={handleMount}
          onChange={(nextValue) => onChange?.(nextValue ?? "")}
          options={{
            readOnly,
            domReadOnly: readOnly,
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            renderLineHighlight: readOnly ? "none" : "line",
            padding: { top: 12, bottom: 12 },
            scrollbar: {
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8,
            },
            fontFamily: "var(--font-mono)",
            cursorStyle: readOnly ? "line-thin" : "line",
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
}
