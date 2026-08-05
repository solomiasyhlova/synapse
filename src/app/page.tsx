import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AISection } from "@/components/homepage/AISection";
import { CTASection } from "@/components/homepage/CTASection";
import { FeaturesSection } from "@/components/homepage/FeaturesSection";
import { Footer } from "@/components/homepage/Footer";
import { HeroSection } from "@/components/homepage/HeroSection";
import { Navbar } from "@/components/homepage/Navbar";
import { PricingSection } from "@/components/homepage/PricingSection";

export default async function Home() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div id="homepage-scroll" className="h-full overflow-y-auto scroll-smooth">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <AISection />
        <PricingSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
