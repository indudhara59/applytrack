"use client";

import { useState } from "react";
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
      <ShareModal
        application={shareTarget}
        onClose={() => setShareTarget(null)}
      />
    </>
  );
}
