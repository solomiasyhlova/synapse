"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Folder } from "lucide-react";
import { useEffect, useState } from "react";

import { GradientButton } from "@/components/homepage/GradientButton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const showSignIn = pathname !== "/sign-in";
  const showGetStarted = pathname !== "/register";

  useEffect(() => {
    // The app shell keeps html/body non-scrolling (fixed dashboard layout), so this
    // page scrolls its own wrapper div instead of the window — see src/app/page.tsx.
    const scrollEl = document.getElementById("homepage-scroll");
    if (!scrollEl) return;

    const onScroll = () => setScrolled(scrollEl.scrollTop > 12);
    onScroll();
    scrollEl.addEventListener("scroll", onScroll, { passive: true });
    return () => scrollEl.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b border-transparent transition-[background-color,border-color,backdrop-filter] duration-300",
        scrolled && "border-border bg-background/85 backdrop-blur-md",
        navOpen && "bg-background/95 backdrop-blur-md",
      )}
    >
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between gap-6 px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold">
          <Folder className="size-5 text-[#6366f1]" aria-hidden="true" />
          <span>Synapse</span>
        </Link>

        <div className="hidden items-center gap-8 text-sm text-muted-foreground sm:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          {showSignIn && (
            <Button
              render={<Link href="/sign-in" />}
              nativeButton={false}
              variant="ghost"
              className="h-auto px-3.5 py-2 text-sm font-semibold"
            >
              Sign In
            </Button>
          )}
          {showGetStarted && (
            <GradientButton href="/register" className="px-5 py-2 text-sm font-semibold">
              Get Started
            </GradientButton>
          )}
        </div>

        <button
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={navOpen}
          onClick={() => setNavOpen((open) => !open)}
          className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 sm:hidden"
        >
          <span
            className={cn(
              "block h-0.5 w-5 rounded-full bg-foreground transition-transform",
              navOpen && "translate-y-[7px] rotate-45",
            )}
          />
          <span
            className={cn(
              "block h-0.5 w-5 rounded-full bg-foreground transition-opacity",
              navOpen && "opacity-0",
            )}
          />
          <span
            className={cn(
              "block h-0.5 w-5 rounded-full bg-foreground transition-transform",
              navOpen && "-translate-y-[7px] -rotate-45",
            )}
          />
        </button>
      </div>

      {navOpen && (
        <div className="flex flex-col items-start gap-3 border-t border-border px-6 py-4 sm:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setNavOpen(false)}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          {showSignIn && (
            <Button
              render={<Link href="/sign-in" />}
              nativeButton={false}
              variant="ghost"
              onClick={() => setNavOpen(false)}
              className="h-auto px-0 text-sm font-semibold"
            >
              Sign In
            </Button>
          )}
          {showGetStarted && (
            <GradientButton
              href="/register"
              onClick={() => setNavOpen(false)}
              className="px-5 py-2 text-sm font-semibold"
            >
              Get Started
            </GradientButton>
          )}
        </div>
      )}
    </nav>
  );
}
