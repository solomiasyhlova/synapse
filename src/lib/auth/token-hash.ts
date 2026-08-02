import crypto from "crypto";

// Verification/reset tokens are bearer secrets, so only a hash is persisted —
// mirrors why passwords are bcrypt-hashed rather than stored raw.
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
