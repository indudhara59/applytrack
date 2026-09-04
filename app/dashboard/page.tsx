import { ObjectId } from "mongodb";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import dbConnect, { getMongoClient } from "@/lib/mongodb";
import Application from "@/lib/models/Application";
import SharedJob from "@/lib/models/SharedJob";
import { BUTTON_PRIMARY } from "@/lib/ui";
import DashboardClient from "./DashboardClient";
import type { SharedJobRecord } from "./SharedWithYou";
import type { ApplicationRecord } from "./ApplicationsTable";

const MAX_RECIPIENT_SUGGESTIONS = 8;

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
  const [docs, receivedShareDocs, previousRecipients] = await Promise.all([
    Application.find({ userId: session.user.id })
      .sort({ dateApplied: -1 })
      .lean(),
    // Pending only — the full share history lives on the /dashboard/shares
    // page; this is just the actionable inbox.
    SharedJob.find({ toUserId: session.user.id, status: "pending" })
      .sort({ createdAt: -1 })
      .lean(),
    SharedJob.distinct("toUsername", {
      fromUserId: session.user.id,
    }) as Promise<string[]>,
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

  const pendingShares: SharedJobRecord[] = receivedShareDocs.map((doc) => ({
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
        <Link href="/dashboard/new" className={BUTTON_PRIMARY}>
          Add Application
        </Link>
      </div>

      <DashboardClient
        initialApplications={applications}
        initialShares={pendingShares}
        initialRecipientSuggestions={previousRecipients.slice(
          0,
          MAX_RECIPIENT_SUGGESTIONS
        )}
      />
    </main>
  );
}
