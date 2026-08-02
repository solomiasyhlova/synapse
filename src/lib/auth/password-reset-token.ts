import crypto from "crypto";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/auth/token-hash";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

// VerificationToken has no "purpose" column and is shared with email verification.
// Namespacing the identifier keeps the two flows from deleting each other's tokens.
const IDENTIFIER_PREFIX = "password-reset:";

export async function createPasswordResetToken(email: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + TOKEN_TTL_MS);
  const identifier = `${IDENTIFIER_PREFIX}${email}`;

  await prisma.verificationToken.deleteMany({ where: { identifier } });
  await prisma.verificationToken.create({
    data: { identifier, token: hashToken(token), expires },
  });

  return token;
}

export type PasswordResetTokenStatus = "valid" | "expired" | "invalid";

export async function checkPasswordResetToken(token: string): Promise<PasswordResetTokenStatus> {
  const verificationToken = await prisma.verificationToken.findFirst({
    where: { token: hashToken(token) },
  });
  if (!verificationToken || !verificationToken.identifier.startsWith(IDENTIFIER_PREFIX)) {
    return "invalid";
  }

  return verificationToken.expires < new Date() ? "expired" : "valid";
}

export type ConsumePasswordResetTokenResult =
  | { status: "reset" }
  | { status: "expired" }
  | { status: "invalid" };

export async function consumePasswordResetToken(
  token: string,
  newPassword: string
): Promise<ConsumePasswordResetTokenResult> {
  const hashedToken = hashToken(token);
  const verificationToken = await prisma.verificationToken.findFirst({
    where: { token: hashedToken },
  });
  if (!verificationToken || !verificationToken.identifier.startsWith(IDENTIFIER_PREFIX)) {
    return { status: "invalid" };
  }

  const email = verificationToken.identifier.slice(IDENTIFIER_PREFIX.length);
  const { expires } = verificationToken;

  await prisma.verificationToken.delete({
    where: { identifier_token: { identifier: verificationToken.identifier, token: hashedToken } },
  });

  if (expires < new Date()) return { status: "expired" };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { status: "invalid" };

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { email }, data: { passwordHash } });

  return { status: "reset" };
}
