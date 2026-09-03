import {
  APPLICATION_STATUSES,
  STATUS_PLURAL_LABELS,
  type ApplicationStatus,
} from "@/lib/applicationStatus";
import { CARD } from "@/lib/ui";
import type { ApplicationRecord } from "./ApplicationsTable";

const UPCOMING_WINDOW_DAYS = 7;

export default function StatsSummary({
  applications,
}: {
  applications: ApplicationRecord[];
}) {
  const countsByStatus = applications.reduce(
    (counts, application) => {
      counts[application.status] = (counts[application.status] ?? 0) + 1;
      return counts;
    },
    {} as Record<ApplicationStatus, number>
  );

  const statusSummary = APPLICATION_STATUSES.filter(
    (status) => countsByStatus[status] > 0
  )
    .map((status) => {
      const count = countsByStatus[status];
      const label = count === 1 ? status : STATUS_PLURAL_LABELS[status];
      return `${count} ${label}`;
    })
    .join(", ");

  const now = Date.now();
  const windowEnd = now + UPCOMING_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const upcomingFollowUps = applications.filter((application) => {
    if (application.followUpDone || !application.followUpDate) return false;
    const time = new Date(application.followUpDate).getTime();
    return time >= now && time <= windowEnd;
  }).length;

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard label="Total Applications" value={applications.length} />
      <div className={`${CARD} p-4`}>
        <p className="text-sm font-medium text-slate-500">By Status</p>
        <p className="mt-1 text-sm text-slate-900">{statusSummary || "—"}</p>
      </div>
      <StatCard
        label={`Follow-ups Due (${UPCOMING_WINDOW_DAYS} days)`}
        value={upcomingFollowUps}
        accent={upcomingFollowUps > 0}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className={`${CARD} p-4`}>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p
        className={`mt-1 text-2xl font-semibold ${accent ? "text-amber-600" : "text-slate-900"}`}
      >
        {value}
      </p>
    </div>
  );
}
