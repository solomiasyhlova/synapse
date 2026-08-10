"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { toastManager } from "@/lib/toast";

export function ProUpgradeToast({ success }: { success: boolean }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!success) return;

    toastManager.add({
      title: "You're now Pro!",
      description: "Unlimited items, collections, and Pro-only features are unlocked.",
    });
    router.replace(pathname);
  }, [success, router, pathname]);

  return null;
}
