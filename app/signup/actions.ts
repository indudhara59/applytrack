"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { clientPromise } from "@/lib/mongodb";
import { hashPassword } from "@/lib/password";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function signUpWithCredentials(
  formData: FormData
): Promise<string | undefined> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!EMAIL_PATTERN.test(email)) {
    return "Enter a valid email address.";
  }
  if (password.length < 8) {
    return "Password must be at least 8 characters.";
  }
  if (password !== confirmPassword) {
    return "Passwords don't match.";
  }

  const client = await clientPromise;
  const users = client.db().collection("users");

  const existing = await users.findOne({ email });
  if (existing) {
    return "An account with this email already exists.";
  }

  const passwordHash = await hashPassword(password);
  await users.insertOne({
    name: name || null,
    email,
    emailVerified: null,
    image: null,
    passwordHash,
    createdAt: new Date(),
  });

  try {
    await signIn("credentials", { email, password, redirectTo: "/dashboard" });
  } catch (error) {
    if (error instanceof AuthError) {
      return "Account created — please sign in.";
    }
    throw error;
  }
}
