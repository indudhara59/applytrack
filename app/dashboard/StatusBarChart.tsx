import {
  APPLICATION_STATUSES,
  STATUS_BAR_COLORS,
  type ApplicationStatus,
} from "@/lib/applicationStatus";

export default function StatusBarChart({
  counts,
  total,
}: {
  counts: Record<ApplicationStatus, number>;
  total: number;
}) {
  const statuses = APPLICATION_STATUSES.filter((status) => counts[status] > 0);

  if (statuses.length === 0) {
    return <p className="text-sm text-slate-400">No data yet.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {statuses.map((status) => {
        const count = counts[status];
        const percentage = total > 0 ? (count / total) * 100 : 0;

        return (
          <div key={status} className="flex items-center gap-3">
            <span className="w-28 shrink-0 text-xs font-medium text-slate-600 sm:w-32">
              {status}
            </span>
            <div
              className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100"
              role="img"
              aria-label={`${status}: ${count} of ${total}`}
            >
              <div
                className={`h-full rounded-full ${STATUS_BAR_COLORS[status]}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="w-6 shrink-0 text-right text-xs font-medium text-slate-500">
              {count}
            </span>
          </div>
        );
      })}
    </div>
  );
}
