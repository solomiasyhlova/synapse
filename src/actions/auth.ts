"use server";

import { headers } from "next/headers";
import { AuthError, CredentialsSignin } from "next-auth";
import { ZodError } from "zod";

import { signIn, signOut } from "@/auth";
import { signInSchema, forgotPasswordSchema, resetPasswordSchema } from "@/lib/validations/auth";
import { prisma } from "@/lib/prisma";
import { createVerificationToken } from "@/lib/auth/verification-token";
import {
  createPasswordResetToken,
  consumePasswordResetToken,
} from "@/lib/auth/password-reset-token";
import { sendVerificationEmail } from "@/lib/email/send-verification-email";
import { sendPasswordResetEmail } from "@/lib/email/send-password-reset-email";
import { isEmailVerificationEnabled } from "@/lib/auth/email-verification";
import { checkRateLimit, getClientIp, rateLimitMessage, rateLimiters } from "@/lib/rate-limit";

interface ActionResult {
  success: boolean;
  error?: string;
  code?: string;
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

    const ip = getClientIp(await headers());
    const rateLimit = await checkRateLimit(rateLimiters.login, `${ip}:${email}`);
    if (!rateLimit.success) {
      return { success: false, error: rateLimitMessage(rateLimit.reset) };
    }

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
        case "CredentialsSignin": {
          const code = error instanceof CredentialsSignin ? error.code : undefined;
          if (code === "email_not_verified") {
            return {
              success: false,
              error: "Please verify your email before signing in.",
              code,
            };
          }
          return { success: false, error: "Invalid email or password" };
        }
        default:
          return { success: false, error: "Something went wrong. Please try again." };
      }
    }
    throw error;
  }
}

export async function resendVerificationEmail(email: string): Promise<ActionResult> {
  if (!isEmailVerificationEnabled()) return { success: true };

  try {
    const ip = getClientIp(await headers());
    const rateLimit = await checkRateLimit(rateLimiters.resendVerification, `${ip}:${email}`);
    if (!rateLimit.success) {
      return { success: false, error: rateLimitMessage(rateLimit.reset) };
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Don't reveal whether the account exists
    if (!user || user.emailVerified) {
      return { success: true };
    }

    const token = await createVerificationToken(email);
    await sendVerificationEmail(email, token);

    return { success: true };
  } catch (error) {
    console.error("Failed to resend verification email:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function requestPasswordReset(email: string): Promise<ActionResult> {
  try {
    const { email: validEmail } = await forgotPasswordSchema.parseAsync({ email });

    const ip = getClientIp(await headers());
    const rateLimit = await checkRateLimit(rateLimiters.forgotPassword, ip);
    if (!rateLimit.success) {
      return { success: false, error: rateLimitMessage(rateLimit.reset) };
    }

    // Don't reveal whether the account exists, or whether it's a GitHub-only account
    const user = await prisma.user.findUnique({ where: { email: validEmail } });
    if (user?.passwordHash) {
      const token = await createPasswordResetToken(validEmail);
      await sendPasswordResetEmail(validEmail, token);
    }

    return { success: true };
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: error.issues[0]?.message ?? "Invalid input" };
    }
    console.error("Failed to request password reset:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function resetPassword(
  token: string,
  password: string,
  confirmPassword: string
): Promise<ActionResult> {
  try {
    const { password: validPassword } = await resetPasswordSchema.parseAsync({
      password,
      confirmPassword,
    });

    const ip = getClientIp(await headers());
    const rateLimit = await checkRateLimit(rateLimiters.resetPassword, ip);
    if (!rateLimit.success) {
      return { success: false, error: rateLimitMessage(rateLimit.reset) };
    }

    const result = await consumePasswordResetToken(token, validPassword);

    if (result.status === "reset") return { success: true };
    if (result.status === "expired") {
      return {
        success: false,
        error: "This reset link has expired. Request a new one.",
        code: "expired",
      };
    }
    return { success: false, error: "This reset link is invalid.", code: "invalid" };
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: error.issues[0]?.message ?? "Invalid input" };
    }
    console.error("Failed to reset password:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function signInWithGitHub(callbackUrl: string) {
  await signIn("github", { redirectTo: callbackUrl || "/dashboard" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/sign-in" });
}
