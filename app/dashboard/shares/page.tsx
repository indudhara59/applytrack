import { redirect } from "next/navigation";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import SharedJob from "@/lib/models/SharedJob";
import { getResultingStatusMap } from "@/lib/shares";
import SharesPageClient from "./SharesPageClient";
import type { ReceivedShareRecord } from "../ReceivedShares";
import type { SentShareRecord } from "../SentShares";

export default async function SharesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  await dbConnect();
  const [receivedDocs, sentDocs] = await Promise.all([
    SharedJob.find({ toUserId: session.user.id })
      .sort({ createdAt: -1 })
      .lean(),
    SharedJob.find({ fromUserId: session.user.id })
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  const statusByApplicationId = await getResultingStatusMap([
    ...receivedDocs,
    ...sentDocs,
  ]);

  const receivedShares: ReceivedShareRecord[] = receivedDocs.map((doc) => ({
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
  }));

  const sentShares: SentShareRecord[] = sentDocs.map((doc) => ({
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

  return (
    <main className="mx-auto max-w-6xl p-4 sm:p-8">
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">
        Shared Jobs
      </h1>
      <SharesPageClient
        initialReceivedShares={receivedShares}
        initialSentShares={sentShares}
      />
    </main>
  );
}
