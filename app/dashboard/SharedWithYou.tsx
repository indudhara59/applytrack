"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BUTTON_PRIMARY, BUTTON_SECONDARY, CARD } from "@/lib/ui";

export interface SharedJobRecord {
  _id: string;
  fromUsername: string;
  company: string;
  role: string;
  jobPostingUrl: string;
  note: string | null;
}

export default function SharedWithYou({
  shares: initialShares,
}: {
  shares: SharedJobRecord[];
}) {
  const router = useRouter();
  const [shares, setShares] = useState(initialShares);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (shares.length === 0) return null;

  async function handleImport(id: string) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/shares/${id}/import`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to add this application");
      setShares((prev) => prev.filter((s) => s._id !== id));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDismiss(id: string) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/shares/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to dismiss");
      setShares((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className={`${CARD} mb-6 p-5`}>
      <p className="mb-3 text-sm font-medium text-slate-500">
        Shared with you
      </p>
      {error && (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-inset ring-red-600/15">
          {error}
        </p>
      )}
      <ul className="flex flex-col gap-3">
        {shares.map((share) => {
          const isBusy = busyId === share._id;
          return (
            <li
              key={share._id}
              className="flex flex-col gap-2 rounded-lg border border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <a
                  href={share.jobPostingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-slate-900 hover:text-indigo-600 hover:underline"
                >
                  {share.company}
                  {share.role ? ` — ${share.role}` : ""}
                </a>
                <p className="truncate text-xs text-slate-500">
                  from @{share.fromUsername}
                  {share.note ? ` · "${share.note}"` : ""}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => handleImport(share._id)}
                  disabled={isBusy}
                  className={BUTTON_PRIMARY}
                >
                  Add to my applications
                </button>
                <button
                  type="button"
                  onClick={() => handleDismiss(share._id)}
                  disabled={isBusy}
                  className={BUTTON_SECONDARY}
                >
                  Dismiss
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
