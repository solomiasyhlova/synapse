"use client";

import { useState } from "react";

import { resendVerificationEmail } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { toastManager } from "@/lib/toast";

interface ResendVerificationButtonProps {
  email: string;
}

export function ResendVerificationButton({ email }: ResendVerificationButtonProps) {
  const [isPending, setIsPending] = useState(false);

  async function handleClick() {
    setIsPending(true);
    try {
      await resendVerificationEmail(email);
      toastManager.add({
        title: "Verification email sent",
        description: "Check your inbox for the verification link.",
      });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Button type="button" variant="outline" className="w-full" disabled={isPending} onClick={handleClick}>
      {isPending ? "Sending..." : "Resend verification email"}
    </Button>
  );
}
