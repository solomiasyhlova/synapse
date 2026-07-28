import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";

export default {
  providers: [
    GitHub,
    // Real authorize logic lives in auth.ts (bcrypt/Prisma aren't edge-compatible)
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: () => null,
    }),
  ],
} satisfies NextAuthConfig;
