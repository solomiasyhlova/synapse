import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function GradientButton({
  href,
  className,
  children,
  onClick,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Button
      render={<Link href={href} onClick={onClick} />}
      nativeButton={false}
      className={cn(
        "h-auto bg-linear-to-br from-[#6366f1] to-[#8b5cf6] text-white shadow-[0_4px_20px_rgba(99,102,241,0.35)] hover:from-[#7678f5] hover:to-[#9c6bf6]",
        className,
      )}
    >
      {children}
    </Button>
  );
}
