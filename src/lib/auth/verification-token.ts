import crypto from "crypto";

import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/auth/token-hash";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function createVerificationToken(email: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + TOKEN_TTL_MS);

  // Drop any outstanding tokens for this email so only the latest link works
  await prisma.verificationToken.deleteMany({ where: { identifier: email } });

  await prisma.verificationToken.create({
    data: { identifier: email, token: hashToken(token), expires },
  });

  return token;
}

export type CheckVerificationTokenResult =
  | { status: "valid"; email: string }
  | { status: "expired"; email: string }
  | { status: "invalid" };

// Read-only check, safe to call from a GET page render (link prefetchers won't burn the token).
export async function checkVerificationToken(token: string): Promise<CheckVerificationTokenResult> {
  const verificationToken = await prisma.verificationToken.findFirst({
    where: { token: hashToken(token) },
  });
  if (!verificationToken) return { status: "invalid" };

  const { identifier: email, expires } = verificationToken;
  return expires < new Date() ? { status: "expired", email } : { status: "valid", email };
}

export type ConsumeVerificationTokenResult =
  | { status: "verified"; email: string }
  | { status: "already-verified"; email: string }
  | { status: "expired"; email: string }
  | { status: "invalid" };

// Single-use: only call this from a user-initiated action (e.g. clicking "Verify email"), never on GET render.
export async function consumeVerificationToken(
  token: string
): Promise<ConsumeVerificationTokenResult> {
  const hashedToken = hashToken(token);
  const verificationToken = await prisma.verificationToken.findFirst({
    where: { token: hashedToken },
  });
  if (!verificationToken) return { status: "invalid" };

  const { identifier: email, expires } = verificationToken;

  await prisma.verificationToken.delete({
    where: { identifier_token: { identifier: email, token: hashedToken } },
  });

  if (expires < new Date()) return { status: "expired", email };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { status: "invalid" };
  if (user.emailVerified) return { status: "already-verified", email };

  await prisma.user.update({ where: { email }, data: { emailVerified: new Date() } });

  return { status: "verified", email };
}
