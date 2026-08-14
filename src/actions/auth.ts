"use server";

import { headers } from "next/headers";
import { AuthError, CredentialsSignin } from "next-auth";
import { ZodError } from "zod";

import { signIn, signOut } from "@/auth";
import { handleActionError, zodErrorMessage } from "@/lib/actions";
import { signInSchema, forgotPasswordSchema, resetPasswordSchema } from "@/lib/validations/auth";
import { prisma } from "@/lib/prisma";
import { createVerificationToken, consumeVerificationToken } from "@/lib/auth/verification-token";
import {
  createPasswordResetToken,
  consumePasswordResetToken,
} from "@/lib/auth/password-reset-token";
import { sendVerificationEmail } from "@/lib/email/send-verification-email";
import { sendPasswordResetEmail } from "@/lib/email/send-password-reset-email";
import { isEmailVerificationEnabled } from "@/lib/auth/email-verification";
import { checkRateLimit, getClientIp, rateLimitMessage, rateLimiters } from "@/lib/rate-limit";
import type { ActionResult as BaseActionResult } from "@/types/actions";

interface ActionResult extends BaseActionResult {
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
      return { success: false, error: zodErrorMessage(error) };
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
    return handleActionError(error, "Failed to resend verification email:");
  }
}

export async function verifyEmail(token: string): Promise<ActionResult> {
  try {
    const result = await consumeVerificationToken(token);

    if (result.status === "verified" || result.status === "already-verified") {
      return { success: true };
    }
    if (result.status === "expired") {
      return {
        success: false,
        error: "This verification link has expired. Request a new one.",
        code: "expired",
      };
    }
    return { success: false, error: "This verification link is invalid.", code: "invalid" };
  } catch (error) {
    return handleActionError(error, "Failed to verify email:");
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
    return handleActionError(error, "Failed to request password reset:");
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
    return handleActionError(error, "Failed to reset password:");
  }
}

export async function signInWithGitHub(callbackUrl: string) {
  await signIn("github", { redirectTo: callbackUrl || "/dashboard" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/sign-in" });
}
