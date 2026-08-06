import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AuthCard } from "@/components/auth/AuthCard";
import { SignInForm } from "@/components/auth/SignInForm";
import { Navbar } from "@/components/homepage/Navbar";

interface SignInPageProps {
  searchParams: Promise<{ callbackUrl?: string }>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const session = await auth();
  if (session) redirect("/dashboard");

  const { callbackUrl } = await searchParams;

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <Navbar />
      <div className="h-18 shrink-0" aria-hidden="true" />
      <AuthCard title="Sign in" description="Sign in to access your Synapse hub.">
        <SignInForm callbackUrl={callbackUrl} />
      </AuthCard>
    </div>
  );
}
