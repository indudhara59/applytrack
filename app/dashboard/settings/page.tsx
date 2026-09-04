import { ObjectId } from "mongodb";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getMongoClient } from "@/lib/mongodb";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const client = await getMongoClient();
  const userDoc = await client
    .db()
    .collection("users")
    .findOne({ _id: new ObjectId(session.user.id) });

  return (
    <main className="mx-auto max-w-3xl p-4 sm:p-8">
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Settings</h1>
      <SettingsClient initialApiKey={(userDoc?.apiKey as string) ?? null} />
    </main>
  );
}
