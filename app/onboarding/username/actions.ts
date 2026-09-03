"use server";

import { ObjectId } from "mongodb";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { clientPromise } from "@/lib/mongodb";
import { normalizeUsername, USERNAME_HELP_TEXT, USERNAME_PATTERN } from "@/lib/username";

export async function setUsername(
  formData: FormData
): Promise<string | undefined> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const username = normalizeUsername(String(formData.get("username") ?? ""));
  if (!USERNAME_PATTERN.test(username)) {
    return USERNAME_HELP_TEXT;
  }

  const client = await clientPromise;
  const users = client.db().collection("users");

  const existing = await users.findOne({ username });
  if (existing) {
    return "That username is already taken.";
  }

  await users.updateOne(
    { _id: new ObjectId(session.user.id) },
    { $set: { username } }
  );

  redirect("/dashboard");
}
