import { ChevronLeft, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

export function Logo() {
  return (
    <div className="flex w-64 shrink-0 items-center gap-2 border-r border-border px-4">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
        <Plus className="size-4" />
      </span>
      <span className="flex-1 font-semibold">Synapse</span>
      <Button variant="ghost" size="icon" aria-label="Collapse sidebar">
        <ChevronLeft />
      </Button>
    </div>
  );
}
