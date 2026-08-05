# Homepage Spec

## Overview

Turn the static prototype at `prototypes/homepage/` into the real marketing homepage of the app at `/`, built with the actual stack (Next.js Server/Client Components, Tailwind v4 + shadcn/ui) instead of plain HTML/CSS/JS. Same content and sections as the mockup — ported and cleaned up, not redesigned.

## Routing

- `src/app/page.tsx` currently just `redirect("/dashboard")`. Replace with the homepage; keep the redirect but flip the condition — check `auth()` and `redirect("/dashboard")` only when a session exists (same pattern as `src/app/(app)/layout.tsx`). Signed-out visitors see the marketing page.
- No changes to any route under `(app)`.

## Component Breakdown

All new files under `src/components/homepage/`.

| Component | Type | Notes |
|---|---|---|
| `page.tsx` | Server | Composes sections, does the `auth()` redirect check |
| `Navbar.tsx` | Client | Scroll-opacity effect + mobile menu toggle need state/effects |
| `HeroSection.tsx` | Server | Static headline/subhead/CTAs + dashboard-preview markup |
| `ChaosVisual.tsx` | Client | Only the animated icon physics needs to be a client component |
| `FeaturesSection.tsx` | Server | Static grid |
| `AISection.tsx` | Server | Static |
| `PricingSection.tsx` | Server | Wraps the static cards |
| `PricingToggle.tsx` | Client | Isolates the monthly/yearly toggle state so the rest of `PricingSection` stays server-rendered |
| `CTASection.tsx` | Server | Static |
| `Footer.tsx` | Server | Static; current year via `new Date().getFullYear()` at render (no client/useEffect needed) |
| `FadeIn.tsx` | Client | Shared `IntersectionObserver` wrapper used by each section instead of duplicating observer setup |

## Styling & Content Decisions

- Tailwind v4 utilities + shadcn/ui primitives (`Button`, etc.) instead of `styles.css`. No `tailwind.config.*` — any new theme tokens go in `globals.css`'s `@theme`.
- Use the app's real global font (already set in `globals.css`), not the mockup's system-sans stack — this is the real app, not a standalone prototype.
- **Item type colors/icons must match the real app** (project-overview.md §6 — e.g. Prompt is purple `#8b5cf6`/`Sparkles`, Command is orange `#f97316`/`Terminal`, etc.), not the mockup's placeholder hex values, which drifted from the real palette (e.g. mockup's Prompt is amber, Command is cyan). Applies to the features grid accents and the dashboard-preview mini-card accents. These are public/unauthenticated, so hardcode the §6 values directly rather than querying `ItemType` from the DB.
- Use `lucide-react` (already a dependency) for feature/checkmark/UI icons instead of hand-written inline SVGs, matching the rest of the codebase.
- Chaos container icons (Notion, GitHub, Slack, VS Code, browser tabs, terminal, text file, bookmark) stay as inline SVGs ported from the prototype — lucide has no brand marks for Notion/Slack/VS Code.
- Pricing and feature-limit copy must match project-overview.md §9 (Monetization) exactly — 50 items / 3 collections free, $8/mo or $72/yr pro — so it doesn't silently drift from the pricing table.

## Interactivity (ported from `script.js`)

- Navbar background opacity/blur increases on scroll.
- Mobile hamburger toggles a nav dropdown.
- Sections fade in on scroll via `FadeIn` (`IntersectionObserver`).
- Chaos icons drift, bounce off walls, repel from the mouse cursor, with subtle rotate/scale pulsing — `requestAnimationFrame` loop, ported near-verbatim into `ChaosVisual.tsx`.
- Pricing toggle flips displayed price ($8/mo ↔ $6/mo billed yearly) client-side, no server round-trip.

## Links / Button Destinations

| Element | Destination |
|---|---|
| Navbar logo | `/` |
| Navbar "Features" / "Pricing" | `#features` / `#pricing` |
| Navbar "Sign In" | `/sign-in` |
| Navbar "Get Started" | `/register` |
| Hero "Get Started Free" | `/register` |
| Hero "See Features" | `#features` |
| Free plan "Get Started Free" | `/register` |
| Pro plan "Start Free Trial" | `/register` (no Stripe checkout flow exists yet — same destination as Free until billing is built) |
| CTA "Get Started Free" | `/register` |
| Footer "Features" / "Pricing" | `#features` / `#pricing` |
| Footer "About" / "Blog" / "Privacy" / "Terms" | No pages exist — render as plain (non-clickable) text, not a dead `href="#"` link |

## Out of Scope

- No changes to `/dashboard` or any authenticated route.
- No new "About", "Blog", "Privacy", or "Terms" pages.
- No Stripe checkout wiring — "Start Free Trial" routes to `/register` like Free, per project-overview.md's "feature-flag everything during development" guidance.

## References

- `prototypes/homepage/` (`index.html`, `styles.css`, `script.js`) — source mockup, content/structure of record
- @context/project-overview.md — §6 (type colors/icons), §9 (monetization/pricing)
- @context/coding-standards.md
