import { Code, File, LayoutGrid, Search, Sparkles, Terminal } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { FadeIn } from "@/components/homepage/FadeIn";

const FEATURES: { title: string; description: string; color: string; icon: LucideIcon }[] = [
  {
    title: "Code Snippets",
    description: "Save and organize reusable code with syntax highlighting for every language.",
    color: "#3b82f6",
    icon: Code,
  },
  {
    title: "AI Prompts",
    description: "Keep your best prompts and system messages ready to reuse, not buried in chat history.",
    color: "#8b5cf6",
    icon: Sparkles,
  },
  {
    title: "Instant Search",
    description: "Full-text search across content, tags, titles, and types — find anything in seconds.",
    color: "#06b6d4",
    icon: Search,
  },
  {
    title: "Commands",
    description: "Never dig through bash history again — pin the commands you actually reuse.",
    color: "#f97316",
    icon: Terminal,
  },
  {
    title: "Files & Docs",
    description: "Upload context files, docs, and images so they live next to the knowledge that needs them.",
    color: "#6b7280",
    icon: File,
  },
  {
    title: "Collections",
    description: "Group items of any type into collections — an item can live in more than one at a time.",
    color: "#6366f1",
    icon: LayoutGrid,
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <FadeIn className="mx-auto mb-14 max-w-xl text-center">
          <span className="mb-3 inline-block rounded-full border border-[#6366f1]/25 bg-[#6366f1]/10 px-3.5 py-1.5 text-[0.8125rem] font-semibold tracking-wide text-[#6366f1] uppercase">
            Features
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Everything you save, one place to find it
          </h2>
        </FadeIn>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <FadeIn key={feature.title}>
                <div className="h-full rounded-2xl border border-border bg-card p-7 transition-[transform,box-shadow] hover:-translate-y-1 hover:shadow-lg">
                  <div
                    className="mb-4.5 flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${feature.color} 16%, transparent)`,
                      color: feature.color,
                    }}
                  >
                    <Icon className="h-5.5 w-5.5" />
                  </div>
                  <h3 className="mb-2 text-[1.0625rem] font-bold">{feature.title}</h3>
                  <p className="text-[0.9375rem] text-muted-foreground">{feature.description}</p>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
