import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

/**
 * Edge-safe config for middleware: no Prisma, no Credentials (Credentials + DB live in auth.ts).
 * Same session/callbacks so JWTs issued by auth.ts decode correctly here.
 */
export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isDashboard = nextUrl.pathname.startsWith("/dashboard");
      if (isDashboard && !auth) return false;
      return true;
    },
    async jwt({ token, user }) {
      if (user?.id) token.userId = user.id;
      else if (token.sub) token.userId = token.userId ?? token.sub;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.userId as string;
      }
      return session;
    }
  },
  pages: {
    signIn: "/auth/signin"
  },
  trustHost: true
};

/** Used by middleware (edge); no Prisma. */
export const auth = NextAuth(authConfig).auth;
