import { STATUS_BADGE_STYLES, type ApplicationStatus } from "@/lib/applicationStatus";
import { CARD } from "@/lib/ui";
import { SHARE_STATUS_LABELS, SHARE_STATUS_STYLES, type ShareStatus } from "./shareStatus";

export interface ReceivedShareRecord {
  _id: string;
  fromUsername: string;
  company: string;
  role: string;
  jobPostingUrl: string;
  note: string | null;
  status: ShareStatus;
  /** Current status of the resulting application, once you've added it. */
  currentApplicationStatus: ApplicationStatus | null;
}

export default function ReceivedShares({
  shares,
}: {
  shares: ReceivedShareRecord[];
}) {
  if (shares.length === 0) return null;

  const total = shares.length;
  const pending = shares.filter((s) => s.status === "pending").length;
  const dismissed = shares.filter((s) => s.status === "dismissed").length;
  const applied = shares.filter(
    (s) =>
      s.currentApplicationStatus && s.currentApplicationStatus !== "Not Applied"
  ).length;

  return (
    <div className={`${CARD} mb-6 p-5`}>
      <p className="mb-1 text-sm font-medium text-slate-500">Jobs received</p>
      <p className="mb-4 text-xs text-slate-400">
        {total} received · {applied} applied · {pending} pending ·{" "}
        {dismissed} dismissed
      </p>

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Company
              </th>
              <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Role
              </th>
              <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                From
              </th>
              <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </th>
              <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Applied Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {shares.map((share) => (
              <tr key={share._id}>
                <td className="px-4 py-2 font-medium text-slate-900">
                  <a
                    href={share.jobPostingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-indigo-600 hover:underline"
                  >
                    {share.company}
                  </a>
                </td>
                <td className="px-4 py-2 text-slate-700">{share.role}</td>
                <td className="px-4 py-2 text-slate-700">
                  @{share.fromUsername}
                </td>
                <td className="px-4 py-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${SHARE_STATUS_STYLES[share.status]}`}
                  >
                    {SHARE_STATUS_LABELS[share.status]}
                  </span>
                </td>
                <td className="px-4 py-2">
                  {share.currentApplicationStatus ? (
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE_STYLES[share.currentApplicationStatus]}`}
                    >
                      {share.currentApplicationStatus}
                    </span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
