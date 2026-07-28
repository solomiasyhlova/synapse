"use server";

import { AuthError } from "next-auth";
import { ZodError } from "zod";

import { signIn, signOut } from "@/auth";
import { signInSchema } from "@/lib/validations/auth";

interface ActionResult {
  success: boolean;
  error?: string;
}

export async function signInWithCredentials(
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  try {
    const { email, password } = await signInSchema.parseAsync({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    const callbackUrl = formData.get("callbackUrl");

    await signIn("credentials", {
      email,
      password,
      redirectTo: typeof callbackUrl === "string" && callbackUrl ? callbackUrl : "/dashboard",
    });

    return { success: true };
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: error.issues[0]?.message ?? "Invalid input" };
    }
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { success: false, error: "Invalid email or password" };
        default:
          return { success: false, error: "Something went wrong. Please try again." };
      }
    }
    throw error;
  }
}

export async function signInWithGitHub(callbackUrl: string) {
  await signIn("github", { redirectTo: callbackUrl || "/dashboard" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/sign-in" });
}
