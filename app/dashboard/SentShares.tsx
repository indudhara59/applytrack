import { STATUS_BADGE_STYLES, type ApplicationStatus } from "@/lib/applicationStatus";
import { CARD } from "@/lib/ui";

export interface SentShareRecord {
  _id: string;
  toUsername: string;
  company: string;
  role: string;
  jobPostingUrl: string;
  status: "pending" | "imported" | "dismissed";
  /** Current status of the resulting application, once the recipient has added it. */
  currentApplicationStatus: ApplicationStatus | null;
}

const SHARE_STATUS_LABELS: Record<SentShareRecord["status"], string> = {
  pending: "Pending",
  imported: "Added",
  dismissed: "Dismissed",
};

const SHARE_STATUS_STYLES: Record<SentShareRecord["status"], string> = {
  pending: "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/10",
  imported: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/15",
  dismissed: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/15",
};

export default function SentShares({ shares }: { shares: SentShareRecord[] }) {
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
      <p className="mb-1 text-sm font-medium text-slate-500">
        Jobs you&apos;ve shared
      </p>
      <p className="mb-4 text-xs text-slate-400">
        {total} shared · {applied} applied · {pending} pending ·{" "}
        {dismissed} dismissed
      </p>
      <ul className="flex flex-col gap-2">
        {shares.map((share) => (
          <li
            key={share._id}
            className="flex flex-col gap-1 rounded-lg border border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between"
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
                to @{share.toUsername}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${SHARE_STATUS_STYLES[share.status]}`}
              >
                {SHARE_STATUS_LABELS[share.status]}
              </span>
              {share.status === "imported" && share.currentApplicationStatus && (
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE_STYLES[share.currentApplicationStatus]}`}
                >
                  {share.currentApplicationStatus}
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
