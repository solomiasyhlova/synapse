"use client";

import Link from "next/link";
import { useActionState } from "react";

import { signInWithCredentials, signInWithGitHub } from "@/actions/auth";
import { GitHubIcon } from "@/components/auth/GitHubIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState = { success: false, error: undefined as string | undefined };

interface SignInFormProps {
  callbackUrl?: string;
}

export function SignInForm({ callbackUrl }: SignInFormProps) {
  const [state, formAction, isPending] = useActionState(signInWithCredentials, initialState);

  async function handleGitHubSignIn() {
    await signInWithGitHub(callbackUrl ?? "");
  }

  return (
    <div className="space-y-4">
      <form action={formAction} className="space-y-3">
        <input type="hidden" name="callbackUrl" value={callbackUrl ?? ""} />
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
          <Input id="password" name="password" type="password" placeholder="••••••••" required />
        </div>
        {state.error && <p className="text-sm text-destructive">{state.error}</p>}
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <div className="h-px flex-1 bg-border" />
        or
        <div className="h-px flex-1 bg-border" />
      </div>

      <form action={handleGitHubSignIn}>
        <Button type="submit" variant="outline" className="w-full">
          <GitHubIcon className="size-4" />
          Sign in with GitHub
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-foreground underline underline-offset-4">
          Register
        </Link>
      </p>
    </div>
  );
}
