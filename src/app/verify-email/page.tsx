import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthCard } from "@/components/auth/AuthCard";
import { ResendVerificationButton } from "@/components/auth/ResendVerificationButton";
import { VerifyEmailButton } from "@/components/auth/VerifyEmailButton";
import { Button } from "@/components/ui/button";
import { checkVerificationToken } from "@/lib/auth/verification-token";
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
        <Button render={<Link href="/sign-in" />} nativeButton={false} variant="ghost" className="w-full">
          Back to sign in
        </Button>
      </AuthCard>
    );
  }

  // Read-only check on render — actual consumption happens only when the user
  // clicks "Verify email", so link prefetchers (Outlook Safe Links, etc.) can't burn it.
  const result = await checkVerificationToken(token);

  if (result.status === "expired") {
    return (
      <AuthCard title="Link expired" description="This verification link has expired.">
        <p className="text-sm text-muted-foreground">Request a new link to verify your email.</p>
        <ResendVerificationButton email={result.email} />
      </AuthCard>
    );
  }

  if (result.status === "invalid") {
    return (
      <AuthCard title="Invalid link" description="This verification link is invalid.">
        <p className="text-sm text-muted-foreground">
          The link may have already been used. Try signing in, or register again if needed.
        </p>
        <Button render={<Link href="/sign-in" />} nativeButton={false} variant="ghost" className="w-full">
          Back to sign in
        </Button>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Verify your email" description="Confirm to finish verifying your account.">
      <VerifyEmailButton token={token} />
    </AuthCard>
  );
}
