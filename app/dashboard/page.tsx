import { ObjectId } from "mongodb";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import dbConnect, { getMongoClient } from "@/lib/mongodb";
import Application from "@/lib/models/Application";
import SharedJob from "@/lib/models/SharedJob";
import { BUTTON_PRIMARY, BUTTON_SECONDARY } from "@/lib/ui";
import DashboardClient from "./DashboardClient";
import SharedWithYou, { type SharedJobRecord } from "./SharedWithYou";
import type { ApplicationRecord } from "./ApplicationsTable";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const client = await getMongoClient();
  const userDoc = await client
    .db()
    .collection("users")
    .findOne({ _id: new ObjectId(session.user.id) });

  if (!userDoc?.username) redirect("/onboarding/username");

  await dbConnect();
  const [docs, shareDocs] = await Promise.all([
    Application.find({ userId: session.user.id })
      .sort({ dateApplied: -1 })
      .lean(),
    SharedJob.find({ toUserId: session.user.id })
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  const applications: ApplicationRecord[] = docs.map((doc) => ({
    _id: String(doc._id),
    company: doc.company,
    role: doc.role,
    dateApplied: doc.dateApplied ? doc.dateApplied.toISOString() : null,
    status: doc.status,
    resumeVersionLabel: doc.resumeVersionLabel ?? null,
    resumeUrl: doc.resumeUrl ?? null,
    jobPostingUrl: doc.jobPostingUrl ?? null,
    followUpDate: doc.followUpDate ? doc.followUpDate.toISOString() : null,
    followUpDone: Boolean(doc.followUpDone),
    notes: doc.notes ?? null,
  }));

  const shares: SharedJobRecord[] = shareDocs.map((doc) => ({
    _id: String(doc._id),
    fromUsername: doc.fromUsername,
    company: doc.company,
    role: doc.role,
    jobPostingUrl: doc.jobPostingUrl,
    note: doc.note ?? null,
  }));

  const displayName = session.user.name ?? session.user.email ?? "there";

  return (
    <main className="mx-auto max-w-6xl p-4 sm:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Welcome, {displayName}
          </h1>
          <p className="text-sm text-slate-500">
            Your job applications ·{" "}
            <span className="font-medium text-slate-600">
              @{userDoc.username}
            </span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/dashboard/new" className={BUTTON_PRIMARY}>
            Add Application
          </Link>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button type="submit" className={BUTTON_SECONDARY}>
              Sign out
            </button>
          </form>
        </div>
      </div>

      <SharedWithYou shares={shares} />

      {applications.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <p className="text-lg font-medium text-slate-900">
            No applications yet
          </p>
          <p className="max-w-sm text-sm text-slate-500">
            Track every job you apply to in one place — company, status,
            resume version, and follow-ups.
          </p>
          <Link href="/dashboard/new" className={`mt-2 ${BUTTON_PRIMARY}`}>
            Add your first application
          </Link>
        </div>
      ) : (
        <DashboardClient initialApplications={applications} />
      )}
    </main>
  );
}
