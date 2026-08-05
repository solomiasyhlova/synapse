import { FadeIn } from "@/components/homepage/FadeIn";
import { PricingToggle } from "@/components/homepage/PricingToggle";

export function PricingSection() {
  return (
    <section id="pricing" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <FadeIn className="mx-auto max-w-xl text-center">
          <span className="mb-3 inline-block rounded-full border border-[#6366f1]/25 bg-[#6366f1]/10 px-3.5 py-1.5 text-[0.8125rem] font-semibold tracking-wide text-[#6366f1] uppercase">
            Pricing
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Simple pricing, no surprises
          </h2>
          <PricingToggle />
        </FadeIn>
      </div>
    </section>
  );
}
