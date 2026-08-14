"use server";

import bcrypt from "bcryptjs";

import { signOut } from "@/auth";
import { handleActionError, requireSession } from "@/lib/actions";
import { prisma } from "@/lib/prisma";
import { changePasswordSchema, setPasswordSchema } from "@/lib/validations/auth";
import type { ActionResult } from "@/types/actions";

export async function changePassword(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
): Promise<ActionResult> {
  try {
    const session = await requireSession();

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
    return handleActionError(error, "Failed to change password:");
  }
}

export async function setPassword(
  newPassword: string,
  confirmPassword: string
): Promise<ActionResult> {
  try {
    const session = await requireSession();

    const { newPassword: validNewPassword } = await setPasswordSchema.parseAsync({
      newPassword,
      confirmPassword,
    });

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (user?.passwordHash) {
      return { success: false, error: "This account already has a password" };
    }

    const passwordHash = await bcrypt.hash(validNewPassword, 10);
    await prisma.user.update({ where: { id: session.user.id }, data: { passwordHash } });

    return { success: true };
  } catch (error) {
    return handleActionError(error, "Failed to set password:");
  }
}

export async function deleteAccount() {
  try {
    const session = await requireSession();
    await prisma.user.delete({ where: { id: session.user.id } });
  } catch (error) {
    return handleActionError(error, "Failed to delete account:");
  }

  await signOut({ redirectTo: "/" });
}
