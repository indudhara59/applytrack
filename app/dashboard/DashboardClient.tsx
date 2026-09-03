"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BUTTON_PRIMARY } from "@/lib/ui";
import ApplicationActivity from "./ApplicationActivity";
import ApplicationsTable, { type ApplicationRecord } from "./ApplicationsTable";
import ShareModal from "./ShareModal";
import SharedWithYou, { type SharedJobRecord } from "./SharedWithYou";
import StatsSummary from "./StatsSummary";

type MutablePatch = Partial<Pick<ApplicationRecord, "status" | "followUpDone">>;

const SHARES_POLL_INTERVAL_MS = 15000;

function toApplicationRecord(raw: {
  _id: string;
  company: string;
  role: string;
  dateApplied?: string | null;
  status: ApplicationRecord["status"];
  resumeVersionLabel?: string | null;
  resumeUrl?: string | null;
  jobPostingUrl?: string | null;
  followUpDate?: string | null;
  followUpDone?: boolean;
  notes?: string | null;
}): ApplicationRecord {
  return {
    _id: raw._id,
    company: raw.company,
    role: raw.role,
    dateApplied: raw.dateApplied ?? null,
    status: raw.status,
    resumeVersionLabel: raw.resumeVersionLabel ?? null,
    resumeUrl: raw.resumeUrl ?? null,
    jobPostingUrl: raw.jobPostingUrl ?? null,
    followUpDate: raw.followUpDate ?? null,
    followUpDone: Boolean(raw.followUpDone),
    notes: raw.notes ?? null,
  };
}

export default function DashboardClient({
  initialApplications,
  initialShares,
}: {
  initialApplications: ApplicationRecord[];
  initialShares: SharedJobRecord[];
}) {
  const [applications, setApplications] = useState(initialApplications);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [shareTarget, setShareTarget] = useState<ApplicationRecord | null>(
    null
  );

  const [shares, setShares] = useState(initialShares);
  const [busyShareId, setBusyShareId] = useState<string | null>(null);

  // Poll for incoming shares so a job someone else shares with you shows up
  // without needing to reload the page.
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/shares");
        if (!res.ok) return;
        const data: SharedJobRecord[] = await res.json();
        setShares(data);
      } catch {
        // transient network error — next poll will retry
      }
    }, SHARES_POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

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

  async function handleImportShare(id: string) {
    setBusyShareId(id);
    try {
      const res = await fetch(`/api/shares/${id}/import`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to add this application");
      const created = await res.json();

      setApplications((prev) => [toApplicationRecord(created), ...prev]);
      setShares((prev) => prev.filter((s) => s._id !== id));
    } catch {
      // leave the share in place so the user can retry
    } finally {
      setBusyShareId(null);
    }
  }

  async function handleDismissShare(id: string) {
    setBusyShareId(id);
    try {
      const res = await fetch(`/api/shares/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to dismiss");
      setShares((prev) => prev.filter((s) => s._id !== id));
    } catch {
      // leave the share in place so the user can retry
    } finally {
      setBusyShareId(null);
    }
  }

  return (
    <>
      <SharedWithYou
        shares={shares}
        busyId={busyShareId}
        onImport={handleImportShare}
        onDismiss={handleDismissShare}
      />

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
