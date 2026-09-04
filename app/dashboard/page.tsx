import { ObjectId } from "mongodb";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import dbConnect, { getMongoClient } from "@/lib/mongodb";
import Application from "@/lib/models/Application";
import SharedJob from "@/lib/models/SharedJob";
import { BUTTON_PRIMARY, BUTTON_SECONDARY } from "@/lib/ui";
import DashboardClient from "./DashboardClient";
import type { SharedJobRecord } from "./SharedWithYou";
import type { SentShareRecord } from "./SentShares";
import type { ReceivedShareRecord } from "./ReceivedShares";
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
  const [docs, receivedShareDocs, sentShareDocs] = await Promise.all([
    Application.find({ userId: session.user.id })
      .sort({ dateApplied: -1 })
      .lean(),
    // All history — pending/imported/dismissed — powers both the
    // actionable pending-only inbox and the full "Jobs received" record.
    SharedJob.find({ toUserId: session.user.id })
      .sort({ createdAt: -1 })
      .lean(),
    SharedJob.find({ fromUserId: session.user.id })
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  const resultingApplicationIds = [...sentShareDocs, ...receivedShareDocs]
    .filter((doc) => doc.status === "imported" && doc.resultingApplicationId)
    .map((doc) => doc.resultingApplicationId as string);

  const resultingApplications =
    resultingApplicationIds.length > 0
      ? await Application.find({ _id: { $in: resultingApplicationIds } })
          .select("status")
          .lean()
      : [];

  const statusByApplicationId = new Map(
    resultingApplications.map((doc) => [String(doc._id), doc.status])
  );

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

  const pendingShares: SharedJobRecord[] = receivedShareDocs
    .filter((doc) => doc.status === "pending")
    .map((doc) => ({
      _id: String(doc._id),
      fromUsername: doc.fromUsername,
      company: doc.company,
      role: doc.role,
      jobPostingUrl: doc.jobPostingUrl,
      note: doc.note ?? null,
    }));

  const receivedShares: ReceivedShareRecord[] = receivedShareDocs.map(
    (doc) => ({
      _id: String(doc._id),
      fromUsername: doc.fromUsername,
      company: doc.company,
      role: doc.role,
      jobPostingUrl: doc.jobPostingUrl,
      note: doc.note ?? null,
      status: doc.status,
      currentApplicationStatus: doc.resultingApplicationId
        ? (statusByApplicationId.get(doc.resultingApplicationId) ?? null)
        : null,
    })
  );

  const sentShares: SentShareRecord[] = sentShareDocs.map((doc) => ({
    _id: String(doc._id),
    toUsername: doc.toUsername,
    company: doc.company,
    role: doc.role,
    jobPostingUrl: doc.jobPostingUrl,
    status: doc.status,
    currentApplicationStatus: doc.resultingApplicationId
      ? (statusByApplicationId.get(doc.resultingApplicationId) ?? null)
      : null,
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

      <DashboardClient
        initialApplications={applications}
        initialShares={pendingShares}
        initialReceivedShares={receivedShares}
        initialSentShares={sentShares}
      />
    </main>
  );
}
