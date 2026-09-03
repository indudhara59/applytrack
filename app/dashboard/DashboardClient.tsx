"use client";

import { useState } from "react";
import Link from "next/link";
import { BUTTON_PRIMARY } from "@/lib/ui";
import ApplicationActivity from "./ApplicationActivity";
import ApplicationsTable, { type ApplicationRecord } from "./ApplicationsTable";
import ShareModal from "./ShareModal";
import StatsSummary from "./StatsSummary";

type MutablePatch = Partial<Pick<ApplicationRecord, "status" | "followUpDone">>;

export default function DashboardClient({
  initialApplications,
}: {
  initialApplications: ApplicationRecord[];
}) {
  const [applications, setApplications] = useState(initialApplications);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [shareTarget, setShareTarget] = useState<ApplicationRecord | null>(
    null
  );

  async function updateApplication(id: string, patch: MutablePatch) {
    const previous = applications.find((a) => a._id === id);
    if (!previous) return;

    setPendingId(id);
    setApplications((prev) =>
      prev.map((a) => (a._id === id ? { ...a, ...patch } : a))
    );

    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error("Failed to update");
    } catch {
      setApplications((prev) =>
        prev.map((a) => (a._id === id ? previous : a))
      );
    } finally {
      setPendingId(null);
    }
  }

  return (
    <>
      <StatsSummary applications={applications} />
      <ApplicationActivity applications={applications} />

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
        <ApplicationsTable
          applications={applications}
          pendingId={pendingId}
          onStatusChange={(id, status) =>
            updateApplication(id, { status })
          }
          onToggleFollowUpDone={(id, next) =>
            updateApplication(id, { followUpDone: next })
          }
          onShare={setShareTarget}
        />
      )}

      <ShareModal
        application={shareTarget}
        onClose={() => setShareTarget(null)}
      />
    </>
  );
}
