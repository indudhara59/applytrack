"use server";

import { randomBytes } from "crypto";
import { ObjectId } from "mongodb";
import { auth } from "@/auth";
import { getMongoClient } from "@/lib/mongodb";

/**
 * Generates a fresh API key for the signed-in user and overwrites any
 * existing one, so old keys (e.g. saved in the Chrome extension) stop
 * working the moment a new one is issued.
 */
export async function generateApiKey(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const apiKey = `atk_${randomBytes(24).toString("hex")}`;

  const client = await getMongoClient();
  await client
    .db()
    .collection("users")
    .updateOne(
      { _id: new ObjectId(session.user.id) },
      { $set: { apiKey } }
    );

  return apiKey;
}
