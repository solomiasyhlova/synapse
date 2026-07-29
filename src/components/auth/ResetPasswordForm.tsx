"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { resetPassword } from "@/actions/auth";
import { resetPasswordSchema } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toastManager } from "@/lib/toast";

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const values = {
      password: String(formData.get("password") ?? ""),
      confirmPassword: String(formData.get("confirmPassword") ?? ""),
    };

    const parsed = resetPasswordSchema.safeParse(values);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    setIsPending(true);
    try {
      const result = await resetPassword(token, parsed.data.password, parsed.data.confirmPassword);

      if (!result.success) {
        setError(result.error ?? "Something went wrong. Please try again.");
        return;
      }

      toastManager.add({
        title: "Password reset",
        description: "You can now sign in with your new password.",
      });
      router.push("/sign-in");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        <div className="space-y-1">
          <label htmlFor="password" className="text-sm font-medium">
            New password
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="At least 8 characters"
            required
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirm password
          </label>
          <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="••••••••" required />
        </div>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Resetting..." : "Reset password"}
      </Button>
      <Button render={<Link href="/sign-in" />} nativeButton={false} variant="ghost" className="w-full">
        Back to sign in
      </Button>
    </form>
  );
}
