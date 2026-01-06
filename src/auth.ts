import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import speakeasy from "speakeasy";

// Helper for Prisma types
const db = prisma as any;

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      twoFactorEnabled: boolean;
    } & DefaultSession["user"]
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        code: { label: "2FA Code", type: "text" },
      },
      async authorize(credentials) {
        const parsed = z
          .object({
            email: z.string().email(),
            password: z.string(),
            code: z.string().optional()
          })
          .safeParse(credentials);

        if (!parsed.success) return null;
        const { email, password, code } = parsed.data;

        // 1. Find user
        const user = (await db.adminUser.findUnique({
          where: { email },
        })) as any;

        if (!user) return null;

        // 2. Verify password
        const passwordsMatch = await bcrypt.compare(password, user.password);
        if (!passwordsMatch) return null;

        // 3. Handle 2FA
        if (user.twoFactorEnabled) {
          if (!code) {
            throw new Error("OTP_REQUIRED");
          }

          const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: "base32",
            token: code,
          });

          if (!verified) {
            throw new Error("INVALID_OTP");
          }
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          twoFactorEnabled: user.twoFactorEnabled,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.twoFactorEnabled = (user as any).twoFactorEnabled;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string;
      }
      session.user.twoFactorEnabled = token.twoFactorEnabled as boolean;
      return session;
    },
  },
});
