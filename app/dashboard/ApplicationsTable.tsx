"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  APPLICATION_STATUSES,
  STATUS_BADGE_STYLES,
  STATUS_ROW_STYLES,
  type ApplicationStatus,
} from "@/lib/applicationStatus";
import { CARD } from "@/lib/ui";

export interface ApplicationRecord {
  _id: string;
  company: string;
  role: string;
  dateApplied: string | null;
  status: ApplicationStatus;
  resumeVersionLabel: string | null;
  resumeUrl: string | null;
  jobPostingUrl: string | null;
  followUpDate: string | null;
  followUpDone: boolean;
  notes: string | null;
}

type SortDirection = "asc" | "desc";

export default function ApplicationsTable({
  applications,
  pendingId,
  onStatusChange,
  onToggleFollowUpDone,
}: {
  applications: ApplicationRecord[];
  pendingId: string | null;
  onStatusChange: (id: string, status: ApplicationStatus) => void;
  onToggleFollowUpDone: (id: string, next: boolean) => void;
}) {
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "All">(
    "All"
  );
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const visible = useMemo(() => {
    const filtered =
      statusFilter === "All"
        ? applications
        : applications.filter((a) => a.status === statusFilter);

    return [...filtered].sort((a, b) => {
      const aTime = a.dateApplied ? new Date(a.dateApplied).getTime() : 0;
      const bTime = b.dateApplied ? new Date(b.dateApplied).getTime() : 0;
      return sortDirection === "asc" ? aTime - bTime : bTime - aTime;
    });
  }, [applications, statusFilter, sortDirection]);

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <label
          htmlFor="status-filter"
          className="text-sm font-medium text-slate-700"
        >
          Filter by status
        </label>
        <select
          id="status-filter"
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as ApplicationStatus | "All")
          }
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          <option value="All">All</option>
          {APPLICATION_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div className={`${CARD} overflow-x-auto`}>
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Company
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Role
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <button
                  type="button"
                  onClick={() =>
                    setSortDirection((d) => (d === "asc" ? "desc" : "asc"))
                  }
                  className="flex items-center gap-1 hover:text-slate-700"
                >
                  Date Applied {sortDirection === "asc" ? "↑" : "↓"}
                </button>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Resume
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Follow-up Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Follow-up Done
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Notes
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {visible.map((application) => {
              const isPending = pendingId === application._id;
              const rowStyle =
                STATUS_ROW_STYLES[application.status] ?? "hover:bg-slate-50";
              const jobUrl = application.jobPostingUrl;

              return (
                <tr
                  key={application._id}
                  className={`transition-colors ${rowStyle} ${jobUrl ? "cursor-pointer" : ""}`}
                >
                  <td className="relative px-4 py-3 font-medium text-slate-900">
                    <RowLinkOverlay
                      href={jobUrl}
                      label={`Open job posting for ${application.company}`}
                    />
                    {application.company}
                  </td>
                  <td className="relative px-4 py-3 text-slate-700">
                    <RowLinkOverlay href={jobUrl} />
                    {application.role}
                  </td>
                  <td className="relative px-4 py-3 text-slate-700">
                    <RowLinkOverlay href={jobUrl} />
                    {formatDate(application.dateApplied)}
                  </td>
                  <td className="relative px-4 py-3">
                    <RowLinkOverlay href={jobUrl} />
                    <select
                      value={application.status}
                      disabled={isPending}
                      onChange={(e) =>
                        onStatusChange(
                          application._id,
                          e.target.value as ApplicationStatus
                        )
                      }
                      aria-label={`Status for ${application.company}`}
                      className={`relative cursor-pointer rounded-full border-0 py-0.5 pl-2.5 pr-6 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-60 ${STATUS_BADGE_STYLES[application.status]}`}
                    >
                      {APPLICATION_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="relative px-4 py-3">
                    <RowLinkOverlay href={jobUrl} />
                    {application.resumeUrl ? (
                      <a
                        href={application.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative font-medium text-indigo-600 hover:text-indigo-500 hover:underline"
                      >
                        {application.resumeVersionLabel || "Resume"}
                      </a>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="relative px-4 py-3 text-slate-700">
                    <RowLinkOverlay href={jobUrl} />
                    {formatDate(application.followUpDate)}
                  </td>
                  <td className="relative px-4 py-3">
                    <RowLinkOverlay href={jobUrl} />
                    <input
                      type="checkbox"
                      checked={application.followUpDone}
                      disabled={isPending}
                      onChange={(e) =>
                        onToggleFollowUpDone(
                          application._id,
                          e.target.checked
                        )
                      }
                      className="relative h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/40"
                      aria-label={`Follow-up done for ${application.company}`}
                    />
                  </td>
                  <td className="relative max-w-xs truncate px-4 py-3 text-slate-500">
                    <RowLinkOverlay href={jobUrl} />
                    {application.notes}
                  </td>
                  <td className="relative whitespace-nowrap px-4 py-3 text-right">
                    <RowLinkOverlay href={jobUrl} />
                    <Link
                      href={`/dashboard/${application._id}/edit`}
                      className="relative text-sm font-medium text-indigo-600 hover:text-indigo-500 hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              );
            })}
            {visible.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-8 text-center text-slate-400"
                >
                  No applications match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Invisible, full-bleed link filling its parent <td> (which must be
 * `relative`). A <tr> can't hold a stretched link directly — browsers strip
 * anything that isn't a <td>/<th> from a table row — so each cell gets its
 * own copy instead, giving the whole row one shared destination. Real
 * interactive elements in a cell (the status <select>, checkbox, Resume and
 * Edit links) are rendered after this and given `relative` themselves, which
 * — combined with DOM order — is what keeps them clickable on top of it.
 *
 * Exactly one link per row is left as a real, keyboard-reachable control
 * (via `label`); the rest are `aria-hidden`/untabbable mouse-only
 * conveniences, since they'd otherwise be many duplicate, unlabeled stops
 * in the tab order for the same destination.
 */
function RowLinkOverlay({ href, label }: { href: string | null; label?: string }) {
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      aria-hidden={label ? undefined : true}
      tabIndex={label ? undefined : -1}
      className="absolute inset-0"
    />
  );
}

function formatDate(value: string | null) {
  if (!value) return "—";
  // A pinned locale keeps server and client output identical — omitting it
  // uses the runtime's default locale, which differs between Node (SSR)
  // and the browser and causes a hydration mismatch.
  return new Date(value).toLocaleDateString("en-US");
}
