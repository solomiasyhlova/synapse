"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { verifyEmail } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { toastManager } from "@/lib/toast";

interface VerifyEmailButtonProps {
  token: string;
}

export function VerifyEmailButton({ token }: VerifyEmailButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleClick() {
    setError(null);
    setIsPending(true);
    try {
      const result = await verifyEmail(token);

      if (!result.success) {
        setError(result.error ?? "Something went wrong. Please try again.");
        return;
      }

      toastManager.add({
        title: "Email verified",
        description: "You can now sign in to your account.",
      });
      router.push("/sign-in");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="button" className="w-full" disabled={isPending} onClick={handleClick}>
        {isPending ? "Verifying..." : "Verify email"}
      </Button>
      <Button render={<Link href="/sign-in" />} nativeButton={false} variant="ghost" className="w-full">
        Back to sign in
      </Button>
    </div>
  );
}
