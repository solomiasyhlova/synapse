import Link from "next/link";

const PRODUCT_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
];

const COMPANY_LINKS = ["About", "Blog"];
const LEGAL_LINKS = ["Privacy", "Terms"];

export function Footer() {
  return (
    <footer className="border-t border-border px-6 pt-14">
      <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-12 pb-10">
        <div className="max-w-xs">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold">
            <span className="text-[#6366f1]" aria-hidden="true">
              ◆
            </span>
            <span>Synapse</span>
          </Link>
          <p className="mt-3 text-sm text-muted-foreground/70">
            One fast, searchable, AI-enhanced hub for everything a developer keeps scattered.
          </p>
        </div>

        <div className="flex gap-16">
          <div className="flex flex-col gap-3">
            <h4 className="mb-1 text-[0.8125rem] font-bold tracking-wide text-muted-foreground/70 uppercase">
              Product
            </h4>
            {PRODUCT_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="mb-1 text-[0.8125rem] font-bold tracking-wide text-muted-foreground/70 uppercase">
              Company
            </h4>
            {COMPANY_LINKS.map((label) => (
              <span key={label} className="text-sm text-muted-foreground/70">
                {label}
              </span>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="mb-1 text-[0.8125rem] font-bold tracking-wide text-muted-foreground/70 uppercase">
              Legal
            </h4>
            {LEGAL_LINKS.map((label) => (
              <span key={label} className="text-sm text-muted-foreground/70">
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-border py-6 text-center">
        <p className="text-[0.8125rem] text-muted-foreground/70">
          &copy; {new Date().getFullYear()} Synapse. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
