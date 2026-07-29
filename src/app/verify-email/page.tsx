import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthCard } from "@/components/auth/AuthCard";
import { ResendVerificationButton } from "@/components/auth/ResendVerificationButton";
import { Button } from "@/components/ui/button";
import { consumeVerificationToken } from "@/lib/auth/verification-token";
import { isEmailVerificationEnabled } from "@/lib/auth/email-verification";

interface VerifyEmailPageProps {
  searchParams: Promise<{ token?: string; email?: string }>;
}

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  if (!isEmailVerificationEnabled()) redirect("/sign-in");

  const { token, email } = await searchParams;

  if (!token) {
    return (
      <AuthCard title="Check your email" description="We sent you a verification link.">
        <p className="text-sm text-muted-foreground">
          {email
            ? `Click the link we sent to ${email} to verify your account.`
            : "Click the link we sent you to verify your account."}
        </p>
        {email && <ResendVerificationButton email={email} />}
        <Button render={<Link href="/sign-in" />} variant="ghost" className="w-full">
          Back to sign in
        </Button>
      </AuthCard>
    );
  }

  const result = await consumeVerificationToken(token);

  if (result.status === "verified" || result.status === "already-verified") {
    return (
      <AuthCard title="Email verified" description="Your email has been verified.">
        <p className="text-sm text-muted-foreground">You can now sign in to your account.</p>
        <Button render={<Link href="/sign-in" />} className="w-full">
          Sign in
        </Button>
      </AuthCard>
    );
  }

  if (result.status === "expired") {
    return (
      <AuthCard title="Link expired" description="This verification link has expired.">
        <p className="text-sm text-muted-foreground">Request a new link to verify your email.</p>
        <ResendVerificationButton email={result.email} />
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Invalid link" description="This verification link is invalid.">
      <p className="text-sm text-muted-foreground">
        The link may have already been used. Try signing in, or register again if needed.
      </p>
      <Button render={<Link href="/sign-in" />} variant="ghost" className="w-full">
        Back to sign in
      </Button>
    </AuthCard>
  );
}
