"use client";

import { useState, type FormEvent } from "react";
import { BUTTON_PRIMARY, BUTTON_SECONDARY, CARD, INPUT } from "@/lib/ui";
import type { ApplicationRecord } from "./ApplicationsTable";

export default function ShareModal({
  application,
  suggestions,
  onClose,
  onShared,
}: {
  application: ApplicationRecord | null;
  suggestions: string[];
  onClose: () => void;
  onShared: (toUsername: string) => void;
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

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error ?? "Failed to share");
      }

      onShared(data.toUsername as string);
      setSharedWith(data.toUsername as string);
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

            {suggestions.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                <span className="text-xs text-slate-400">
                  Shared with before:
                </span>
                {suggestions.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setUsername(name)}
                    className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 hover:bg-slate-200"
                  >
                    @{name}
                  </button>
                ))}
              </div>
            )}

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
