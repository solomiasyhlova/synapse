import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AuthCard } from "@/components/auth/AuthCard";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default async function RegisterPage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <AuthCard title="Create an account" description="Start building your Synapse knowledge hub.">
      <RegisterForm />
    </AuthCard>
  );
}
