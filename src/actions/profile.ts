"use server";

import bcrypt from "bcryptjs";
import { ZodError } from "zod";

import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { changePasswordSchema } from "@/lib/validations/auth";

interface ActionResult {
  success: boolean;
  error?: string;
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Not signed in" };

    const {
      currentPassword: validCurrentPassword,
      newPassword: validNewPassword,
    } = await changePasswordSchema.parseAsync({ currentPassword, newPassword, confirmPassword });

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user?.passwordHash) {
      return { success: false, error: "This account doesn't use a password" };
    }

    const isValid = await bcrypt.compare(validCurrentPassword, user.passwordHash);
    if (!isValid) {
      return { success: false, error: "Current password is incorrect" };
    }

    const passwordHash = await bcrypt.hash(validNewPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

    return { success: true };
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: error.issues[0]?.message ?? "Invalid input" };
    }
    console.error("Failed to change password:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function deleteAccount() {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Not signed in" };

  await prisma.user.delete({ where: { id: session.user.id } });
  await signOut({ redirectTo: "/" });
}
