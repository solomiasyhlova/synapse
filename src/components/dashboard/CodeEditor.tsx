"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Check, Copy, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Monaco, OnMount } from "@monaco-editor/react";

import { AiTriggerButton } from "@/components/dashboard/AiTriggerButton";
import { useEditorPreferences } from "@/components/dashboard/editor-preferences-context";
import type { ExplainCodeState } from "@/components/dashboard/ExplainCode";
import { useCopyToClipboard } from "@/components/dashboard/use-copy-to-clipboard";
import type { EditorTheme } from "@/lib/editor-preferences";
import { EDITOR_MAX_HEIGHT as MAX_HEIGHT, EDITOR_MIN_HEIGHT as MIN_HEIGHT } from "@/lib/editor-chrome";
import { getLanguageLabel } from "@/lib/languages";
import { cn } from "@/lib/utils";

const Editor = dynamic(() => import("@monaco-editor/react").then((mod) => mod.Editor), {
  ssr: false,
  loading: () => <div className="h-30 animate-pulse bg-[#18181b]" />,
});

const MONACO_THEME_NAMES: Record<EditorTheme, string> = {
  "vs-dark": "synapse-vs-dark",
  monokai: "synapse-monokai",
  "github-dark": "synapse-github-dark",
};

function defineEditorThemes(monaco: Monaco) {
  monaco.editor.defineTheme("synapse-vs-dark", {
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
  monaco.editor.defineTheme("synapse-monokai", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "88846f" },
      { token: "keyword", foreground: "f92672" },
      { token: "string", foreground: "e6db74" },
      { token: "number", foreground: "ae81ff" },
      { token: "type", foreground: "66d9ef" },
      { token: "function", foreground: "a6e22e" },
    ],
    colors: {
      "editor.background": "#272822",
      "editor.lineHighlightBackground": "#3e3d32",
      "editorLineNumber.foreground": "#75715e",
      "editorLineNumber.activeForeground": "#f8f8f2",
      "editorGutter.background": "#272822",
      "scrollbarSlider.background": "#75715e66",
      "scrollbarSlider.hoverBackground": "#75715e88",
      "scrollbarSlider.activeBackground": "#75715eaa",
    },
  });
  monaco.editor.defineTheme("synapse-github-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "8b949e" },
      { token: "keyword", foreground: "ff7b72" },
      { token: "string", foreground: "a5d6ff" },
      { token: "number", foreground: "79c0ff" },
      { token: "type", foreground: "ffa657" },
      { token: "function", foreground: "d2a8ff" },
    ],
    colors: {
      "editor.background": "#0d1117",
      "editor.lineHighlightBackground": "#161b22",
      "editorLineNumber.foreground": "#484f58",
      "editorLineNumber.activeForeground": "#c9d1d9",
      "editorGutter.background": "#0d1117",
      "scrollbarSlider.background": "#6e768166",
      "scrollbarSlider.hoverBackground": "#6e768188",
      "scrollbarSlider.activeBackground": "#6e7681aa",
    },
  });
}

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

interface CodeEditorExplainProps extends ExplainCodeState {
  isPro: boolean;
}

interface CodeEditorProps {
  value: string;
  language?: string | null;
  readOnly?: boolean;
  onChange?: (value: string) => void;
  className?: string;
  explain?: CodeEditorExplainProps;
}

export function CodeEditor({ value, language, readOnly = false, onChange, className, explain }: CodeEditorProps) {
  const preferences = useEditorPreferences();
  const { copied, copy } = useCopyToClipboard();
  const [height, setHeight] = useState(MIN_HEIGHT);
  const [activeTab, setActiveTab] = useState<"code" | "explain">("code");

  function handleExplainClick() {
    setActiveTab("explain");
    explain?.explain();
  }

  const showTabs = explain && explain.status !== "idle";
  const showExplainPanel = activeTab === "explain" && showTabs;

  const handleMount: OnMount = (editor, monaco) => {
    defineEditorThemes(monaco);

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
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-[#ff5f56]" />
            <span className="size-2.5 rounded-full bg-[#ffbd2e]" />
            <span className="size-2.5 rounded-full bg-[#27c93f]" />
          </div>
          {showTabs && (
            <div className="flex items-center gap-1">
              {(["code", "explain"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "rounded-md px-2 py-1 text-xs font-medium capitalize transition-colors",
                    activeTab === tab ? "bg-white/10 text-zinc-100" : "text-zinc-400 hover:text-zinc-100"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          {language && !showExplainPanel && (
            <span className="font-mono text-xs text-zinc-400">{getLanguageLabel(language)}</span>
          )}
          {explain && (
            <AiTriggerButton
              isPro={explain.isPro}
              showSpinner={explain.status === "loading"}
              disabled={explain.status === "loading" || explain.status === "streaming"}
              onClick={handleExplainClick}
              label="Explain code"
            />
          )}
          <button
            type="button"
            onClick={() => void copy(value)}
            className="text-zinc-400 transition-colors hover:text-zinc-100"
            aria-label="Copy code"
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          </button>
        </div>
      </div>
      {showExplainPanel && explain ? (
        <div
          className="markdown-preview overflow-y-auto p-3"
          style={{ minHeight: MIN_HEIGHT, maxHeight: MAX_HEIGHT }}
        >
          {explain.status === "loading" ? (
            <div className="flex h-full items-center justify-center py-8 text-zinc-500">
              <Loader2 className="size-5 animate-spin" />
            </div>
          ) : explain.status === "error" ? (
            <p className="text-sm text-zinc-500">Couldn't generate an explanation. Click the sparkles icon to try again.</p>
          ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{explain.explanation ?? ""}</ReactMarkdown>
          )}
        </div>
      ) : (
        <div style={{ height }} className="transition-[height] duration-150">
          <Editor
            value={value}
            language={toMonacoLanguage(language)}
            theme={MONACO_THEME_NAMES[preferences.theme]}
            onMount={handleMount}
            onChange={(nextValue) => onChange?.(nextValue ?? "")}
            options={{
              readOnly,
              domReadOnly: readOnly,
              minimap: { enabled: preferences.minimap },
              fontSize: preferences.fontSize,
              tabSize: preferences.tabSize,
              wordWrap: preferences.wordWrap ? "on" : "off",
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
      )}
    </div>
  );
}
