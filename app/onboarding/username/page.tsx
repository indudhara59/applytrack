import { ObjectId } from "mongodb";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getMongoClient } from "@/lib/mongodb";
import AuthCard from "@/app/AuthCard";
import UsernameForm from "./UsernameForm";

export default async function UsernameOnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const client = await getMongoClient();
  const user = await client
    .db()
    .collection("users")
    .findOne({ _id: new ObjectId(session.user.id) });

  if (user?.username) redirect("/dashboard");

  return (
    <AuthCard
      title="Choose a username"
      subtitle="Other ApplyTrack users can share job links with you by this username."
    >
      <UsernameForm />
    </AuthCard>
  );
}
