"use client";

import { useState, type FormEvent } from "react";
import { BUTTON_PRIMARY, BUTTON_SECONDARY, CARD, INPUT } from "@/lib/ui";
import type { ApplicationRecord } from "./ApplicationsTable";

export default function ShareModal({
  application,
  onClose,
}: {
  application: ApplicationRecord | null;
  onClose: () => void;
}) {
  const [username, setUsername] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sharedWith, setSharedWith] = useState<string | null>(null);

  if (!application) return null;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/shares", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toUsername: username,
          company: application!.company,
          role: application!.role,
          jobPostingUrl: application!.jobPostingUrl,
          note,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to share");
      }

      setSharedWith(username.trim().toLowerCase());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to share");
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    setUsername("");
    setNote("");
    setError(null);
    setSharedWith(null);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className={`${CARD} w-full max-w-sm p-5`}>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">Share job</p>
            <p className="truncate text-xs text-slate-500">
              {application.company}
              {application.role ? ` — ${application.role}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="shrink-0 text-slate-400 hover:text-slate-700"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {sharedWith ? (
          <div className="flex flex-col gap-3">
            <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700 ring-1 ring-inset ring-green-600/15">
              Shared with @{sharedWith}
            </p>
            <button
              type="button"
              onClick={handleClose}
              className={BUTTON_SECONDARY}
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              Username
              <input
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. jane_doe"
                className={INPUT}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              Note (optional)
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                className={INPUT}
              />
            </label>
            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-inset ring-red-600/15">
                {error}
              </p>
            )}
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={handleClose}
                className={BUTTON_SECONDARY}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className={BUTTON_PRIMARY}
              >
                {submitting ? "Sharing…" : "Share"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
