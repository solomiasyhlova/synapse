import { ArrowRight, Plus, Search } from "lucide-react";
import Link from "next/link";

import { ChaosVisual } from "@/components/homepage/ChaosVisual";
import { FadeIn } from "@/components/homepage/FadeIn";
import { GradientButton } from "@/components/homepage/GradientButton";
import { TYPE_COLORS } from "@/components/homepage/type-colors";
import { Button } from "@/components/ui/button";

const PREVIEW_TYPES = TYPE_COLORS.filter((type) => type.name !== "File");

export function HeroSection() {
  return (
    <header className="px-6 pt-32 pb-24">
      <div className="mx-auto max-w-6xl">
        <FadeIn className="mx-auto mb-18 max-w-3xl text-center">
          <span className="mb-5 inline-block rounded-full border border-[#6366f1]/25 bg-[#6366f1]/10 px-3.5 py-1.5 text-[0.8125rem] font-semibold tracking-wide text-[#6366f1] uppercase">
            Developer knowledge hub
          </span>
          <h1 className="mb-5 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Stop Losing Your <br className="hidden sm:block" />
            <span className="bg-linear-to-br from-[#6366f1] via-[#ec4899] to-[#f59e0b] bg-clip-text text-transparent">
              Developer Knowledge
            </span>
          </h1>
          <p className="mx-auto mb-8 max-w-lg text-lg text-muted-foreground">
            Snippets, prompts, notes, commands, files and links scattered across a dozen
            tools. Synapse pulls it all into one fast, searchable, AI-enhanced hub.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <GradientButton
              href="/register"
              className="px-7 py-3.5 text-base font-semibold transition-transform hover:-translate-y-px"
            >
              Get Started Free
            </GradientButton>
            <Button
              render={<Link href="#features" />}
              nativeButton={false}
              variant="outline"
              className="h-auto bg-muted px-7 py-3.5 text-base font-semibold transition-transform hover:-translate-y-px hover:bg-[color-mix(in_oklch,var(--muted),var(--foreground)_5%)]"
            >
              See Features
            </Button>
          </div>
        </FadeIn>

        <FadeIn className="mx-auto grid max-w-5xl items-center gap-5 md:grid-cols-[1fr_auto_1fr]">
          <div>
            <span className="mb-3.5 block text-center text-[0.8125rem] font-semibold text-muted-foreground/70">
              Your knowledge today...
            </span>
            <div className="relative h-80 w-full overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-lg">
              <ChaosVisual />
            </div>
          </div>

          <div className="mx-auto rotate-90 text-[#6366f1] md:rotate-0">
            <ArrowRight className="size-14 animate-arrow-pulse" strokeWidth={2.5} />
          </div>

          <div>
            <span className="mb-3.5 block text-center text-[0.8125rem] font-semibold text-muted-foreground/70">
              ...with Synapse
            </span>
            <div className="h-80 w-full overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-lg">
              <div className="flex h-full overflow-hidden rounded-2xl border border-border bg-background">
                <div className="flex w-16 shrink-0 flex-col items-center gap-3.5 border-r border-border bg-muted py-3.5">
                  <div className="mb-2 h-5 w-5 rounded-md bg-[#6366f1]" />
                  <div className="h-1.5 w-8 rounded-full bg-[#6366f1]" />
                  <div className="h-1.5 w-7 rounded-full bg-border" />
                  <div className="h-1.5 w-7 rounded-full bg-border" />
                  <div className="h-1.5 w-7 rounded-full bg-border" />
                  <div className="h-1.5 w-7 rounded-full bg-border" />
                </div>
                <div className="flex min-h-0 flex-1 flex-col gap-3 p-4.5">
                  <div className="flex shrink-0 items-center gap-2">
                    <div className="flex h-6 flex-1 items-center gap-1.5 rounded-md border border-border bg-card px-2 text-muted-foreground/70">
                      <Search className="h-3 w-3 shrink-0" />
                      <span className="h-1.5 w-2/5 rounded-full bg-border" />
                    </div>
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#6366f1] text-white">
                      <Plus className="h-3.5 w-3.5" />
                    </div>
                  </div>
                  <div className="grid min-h-0 flex-1 grid-cols-2 gap-2.5">
                    {PREVIEW_TYPES.map((type) => {
                      const Icon = type.icon;
                      return (
                        <div
                          key={type.name}
                          className="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-2.5"
                          style={{ borderTopColor: type.color, borderTopWidth: 3 }}
                        >
                          <div
                            className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded"
                            style={{
                              backgroundColor: `color-mix(in srgb, ${type.color} 18%, transparent)`,
                              color: type.color,
                            }}
                          >
                            <Icon className="h-2.5 w-2.5" />
                          </div>
                          <span className="block h-1.5 w-3/4 rounded-full bg-border" />
                          <span className="block h-1.5 w-1/2 rounded-full bg-border opacity-70" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </header>
  );
}
