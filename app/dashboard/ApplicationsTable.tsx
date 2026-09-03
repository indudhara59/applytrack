"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  APPLICATION_STATUSES,
  STATUS_BADGE_STYLES,
  type ApplicationStatus,
} from "@/lib/applicationStatus";

export interface ApplicationRecord {
  _id: string;
  company: string;
  role: string;
  dateApplied: string | null;
  status: ApplicationStatus;
  followUpDate: string | null;
  followUpDone: boolean;
  notes: string | null;
}

type SortDirection = "asc" | "desc";

export default function ApplicationsTable({
  applications,
}: {
  applications: ApplicationRecord[];
}) {
  const [items, setItems] = useState(applications);
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "All">(
    "All"
  );
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [pendingId, setPendingId] = useState<string | null>(null);

  const visible = useMemo(() => {
    const filtered =
      statusFilter === "All"
        ? items
        : items.filter((a) => a.status === statusFilter);

    return [...filtered].sort((a, b) => {
      const aTime = a.dateApplied ? new Date(a.dateApplied).getTime() : 0;
      const bTime = b.dateApplied ? new Date(b.dateApplied).getTime() : 0;
      return sortDirection === "asc" ? aTime - bTime : bTime - aTime;
    });
  }, [items, statusFilter, sortDirection]);

  async function toggleFollowUpDone(id: string, next: boolean) {
    setPendingId(id);
    setItems((prev) =>
      prev.map((a) => (a._id === id ? { ...a, followUpDone: next } : a))
    );

    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followUpDone: next }),
      });
      if (!res.ok) throw new Error("Failed to update");
    } catch {
      setItems((prev) =>
        prev.map((a) => (a._id === id ? { ...a, followUpDone: !next } : a))
      );
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <label
          htmlFor="status-filter"
          className="text-sm font-medium text-gray-700"
        >
          Filter by status
        </label>
        <select
          id="status-filter"
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as ApplicationStatus | "All")
          }
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        >
          <option value="All">All</option>
          {APPLICATION_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500">
                Company
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">
                Role
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">
                <button
                  type="button"
                  onClick={() =>
                    setSortDirection((d) => (d === "asc" ? "desc" : "asc"))
                  }
                  className="flex items-center gap-1"
                >
                  Date Applied {sortDirection === "asc" ? "↑" : "↓"}
                </button>
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">
                Status
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">
                Follow-up Date
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">
                Follow-up Done
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">
                Notes
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-500" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {visible.map((application) => (
              <tr key={application._id}>
                <td className="px-4 py-3 font-medium text-gray-900">
                  {application.company}
                </td>
                <td className="px-4 py-3">{application.role}</td>
                <td className="px-4 py-3">
                  {formatDate(application.dateApplied)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE_STYLES[application.status]}`}
                  >
                    {application.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {formatDate(application.followUpDate)}
                </td>
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={application.followUpDone}
                    disabled={pendingId === application._id}
                    onChange={(e) =>
                      toggleFollowUpDone(application._id, e.target.checked)
                    }
                    className="h-4 w-4 rounded border-gray-300"
                    aria-label={`Follow-up done for ${application.company}`}
                  />
                </td>
                <td className="max-w-xs truncate px-4 py-3 text-gray-500">
                  {application.notes}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <Link
                    href={`/dashboard/${application._id}/edit`}
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-8 text-center text-gray-400"
                >
                  No applications yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}
