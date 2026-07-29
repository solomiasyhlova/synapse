"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { registerSchema } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toastManager } from "@/lib/toast";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const values = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      confirmPassword: String(formData.get("confirmPassword") ?? ""),
    };

    const parsed = registerSchema.safeParse(values);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    setIsPending(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const result = await response.json();

      if (!result.success) {
        setError(result.error ?? "Something went wrong. Please try again.");
        return;
      }

      if (result.data?.emailVerificationRequired) {
        toastManager.add({
          title: "Account created",
          description: "Check your email to verify your account before signing in.",
        });
        router.push(`/verify-email?email=${encodeURIComponent(values.email)}`);
      } else {
        toastManager.add({
          title: "Account created",
          description: "You can now sign in.",
        });
        router.push("/sign-in");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        <div className="space-y-1">
          <label htmlFor="name" className="text-sm font-medium">
            Name
          </label>
          <Input id="name" name="name" type="text" placeholder="Jane Doe" required />
        </div>
        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input id="email" name="email" type="email" placeholder="you@example.com" required />
        </div>
        <div className="space-y-1">
          <label htmlFor="password" className="text-sm font-medium">
            Password
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
        {isPending ? "Creating account..." : "Create account"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-foreground underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </form>
  );
}
