import Link from "next/link";

import { AuthCard } from "@/components/auth/AuthCard";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { Button } from "@/components/ui/button";
import { checkPasswordResetToken } from "@/lib/auth/password-reset-token";

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <AuthCard title="Invalid link" description="This password reset link is invalid.">
        <p className="text-sm text-muted-foreground">
          Request a new password reset link to continue.
        </p>
        <Button render={<Link href="/forgot-password" />} nativeButton={false} className="w-full">
          Request new link
        </Button>
      </AuthCard>
    );
  }

  const status = await checkPasswordResetToken(token);

  if (status === "expired") {
    return (
      <AuthCard title="Link expired" description="This password reset link has expired.">
        <p className="text-sm text-muted-foreground">
          Request a new link to reset your password.
        </p>
        <Button render={<Link href="/forgot-password" />} nativeButton={false} className="w-full">
          Request new link
        </Button>
      </AuthCard>
    );
  }

  if (status === "invalid") {
    return (
      <AuthCard title="Invalid link" description="This password reset link is invalid.">
        <p className="text-sm text-muted-foreground">
          The link may have already been used. Request a new one, or sign in if you already reset
          your password.
        </p>
        <Button render={<Link href="/forgot-password" />} nativeButton={false} className="w-full">
          Request new link
        </Button>
        <Button render={<Link href="/sign-in" />} nativeButton={false} variant="ghost" className="w-full">
          Back to sign in
        </Button>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Reset password" description="Choose a new password for your account.">
      <ResetPasswordForm token={token} />
    </AuthCard>
  );
}
