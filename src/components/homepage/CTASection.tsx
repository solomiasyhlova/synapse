import { FadeIn } from "@/components/homepage/FadeIn";
import { GradientButton } from "@/components/homepage/GradientButton";

export function CTASection() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <FadeIn>
          <div className="rounded-3xl border border-border bg-linear-to-br from-[#6366f1]/14 to-[#ec4899]/10 px-8 py-18 text-center">
            <h2 className="mb-3.5 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Ready to Organize Your Knowledge?
            </h2>
            <p className="mb-7 text-[1.0625rem] text-muted-foreground">
              Join developers who stopped losing their best snippets, prompts, and notes.
            </p>
            <GradientButton
              href="/register"
              className="px-7 py-3.5 text-base font-semibold transition-transform hover:-translate-y-px"
            >
              Get Started Free
            </GradientButton>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
