import { Check, Sparkles } from "lucide-react";

import { FadeIn } from "@/components/homepage/FadeIn";

const AI_CHECKLIST = [
  "AI auto-tag suggestions",
  "Instant AI summaries",
  '"Explain this code" on any snippet',
  "Prompt optimizer",
];

export function AISection() {
  return (
    <section id="ai" className="border-y border-border bg-muted/40 px-6 py-24">
      <div className="mx-auto grid max-w-6xl gap-16 md:grid-cols-2 md:items-center">
        <FadeIn>
          <span className="mb-4.5 inline-block rounded-full bg-linear-to-br from-[#f59e0b] to-[#fbbf24] px-3 py-1.5 text-xs font-bold tracking-wide text-[#0a0a0f] uppercase">
            Pro Feature
          </span>
          <h2 className="mb-3.5 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Let AI do the busywork
          </h2>
          <p className="mb-7 max-w-md text-[1.0625rem] text-muted-foreground">
            Google Gemini quietly organizes what you save, so you spend less time filing and
            more time building.
          </p>
          <ul className="flex flex-col gap-3.5">
            {AI_CHECKLIST.map((item) => (
              <li key={item} className="flex items-center gap-3 text-[0.9375rem] font-medium">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500/15 text-green-500">
                  <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </FadeIn>

        <FadeIn className="min-w-0">
          <div className="overflow-hidden rounded-2xl border border-border bg-[#18181b] shadow-2xl">
            <div className="flex items-center gap-2 border-b border-border bg-[#202024] px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
              <span className="ml-2 font-mono text-[0.8125rem] text-muted-foreground/70">
                auth-helpers.ts
              </span>
            </div>
            <pre className="overflow-x-auto p-5 font-mono text-[0.8125rem] leading-[1.7] text-zinc-300">
              <code>
                <span className="text-purple-400">export function</span>{" "}
                <span className="text-blue-400">verifyToken</span>(
                <span className="text-zinc-100">token</span>:{" "}
                <span className="text-green-400">string</span>) {"{"}
                {"\n  "}
                <span className="text-purple-400">const</span>{" "}
                <span className="text-zinc-100">payload</span> ={" "}
                <span className="text-blue-400">jwt</span>.
                <span className="text-blue-400">verify</span>(
                <span className="text-zinc-100">token</span>,{" "}
                <span className="text-zinc-100">SECRET</span>);
                {"\n  "}
                <span className="text-purple-400">return</span>{" "}
                <span className="text-zinc-100">payload</span>;{"\n"}
                {"}"}
              </code>
            </pre>
            <div className="border-t border-border px-5 py-4">
              <span className="mb-3 flex items-center gap-2 text-xs font-semibold text-[#8b5cf6]">
                <Sparkles className="h-3.5 w-3.5" />
                AI Generated Tags
              </span>
              <div className="flex flex-wrap gap-2">
                {["auth", "jwt", "typescript", "security"].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[#6366f1]/30 bg-[#6366f1]/12 px-2.5 py-1 text-xs font-medium text-[#a5a6f6]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
