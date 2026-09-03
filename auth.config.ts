import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe subset of the Auth.js config. Consumed by middleware.ts, which
 * runs in the Edge runtime and cannot bundle the MongoDB adapter or the
 * `mongodb`/`mongoose` packages. The full config (adapter, providers) lives
 * in auth.ts and runs in the Node.js runtime.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isProtected =
        nextUrl.pathname.startsWith("/dashboard") ||
        nextUrl.pathname.startsWith("/onboarding");
      return isProtected ? isLoggedIn : true;
    },
  },
} satisfies NextAuthConfig;
