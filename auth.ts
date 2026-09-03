import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { clientPromise, getMongoClient } from "@/lib/mongodb";
import { verifyPassword } from "@/lib/password";
import { authConfig } from "@/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email =
          typeof credentials?.email === "string"
            ? credentials.email.trim().toLowerCase()
            : null;
        const password =
          typeof credentials?.password === "string"
            ? credentials.password
            : null;
        if (!email || !password) return null;

        const client = await getMongoClient();
        const user = await client
          .db()
          .collection("users")
          .findOne({ email });

        if (!user?.passwordHash) return null;

        const valid = await verifyPassword(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name ?? null,
          image: user.image ?? null,
        };
      },
    }),
  ],
  // JWT sessions keep middleware Edge-compatible (it can't bundle the
  // MongoDB adapter), and are required for the Credentials provider. The
  // adapter still persists users/accounts from the Google sign-in.
  session: {
    strategy: "jwt",
  },
  callbacks: {
    ...authConfig.callbacks,
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});
