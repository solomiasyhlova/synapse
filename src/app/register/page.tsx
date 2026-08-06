import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AuthCard } from "@/components/auth/AuthCard";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Navbar } from "@/components/homepage/Navbar";

export default async function RegisterPage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <Navbar />
      <div className="h-18 shrink-0" aria-hidden="true" />
      <AuthCard title="Create an account" description="Start building your Synapse knowledge hub.">
        <RegisterForm />
      </AuthCard>
    </div>
  );
}
