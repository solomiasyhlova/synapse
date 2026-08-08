import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { signInSchema } from "@/lib/validations/auth";
import { EmailNotVerifiedError } from "@/lib/auth/errors";
import { isEmailVerificationEnabled } from "@/lib/auth/email-verification";
import authConfig from "./auth.config";

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.sub = user.id;
      if (token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { isPro: true },
        });
        token.isPro = dbUser?.isPro ?? false;
      }
      return token;
    },
    session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }
      if (typeof token.isPro === "boolean") {
        session.user.isPro = token.isPro;
      }
      return session;
    },
  },
  ...authConfig,
  providers: [
    ...authConfig.providers.filter(
      (provider) => typeof provider === "function" || provider.id !== "credentials"
    ),
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (credentials) => {
        try {
          const { email, password } = await signInSchema.parseAsync(credentials);

          const user = await prisma.user.findUnique({ where: { email } });
          if (!user?.passwordHash) return null;

          const isValid = await bcrypt.compare(password, user.passwordHash);
          if (!isValid) return null;

          if (isEmailVerificationEnabled() && !user.emailVerified) {
            throw new EmailNotVerifiedError();
          }

          return user;
        } catch (error) {
          if (error instanceof ZodError) return null;
          throw error;
        }
      },
    }),
  ],
});
