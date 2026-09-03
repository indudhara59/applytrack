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
  shares,
  busyId,
  onImport,
  onDismiss,
}: {
  shares: SharedJobRecord[];
  busyId: string | null;
  onImport: (id: string) => void;
  onDismiss: (id: string) => void;
}) {
  if (shares.length === 0) return null;

  return (
    <div className={`${CARD} mb-6 p-5`}>
      <p className="mb-3 text-sm font-medium text-slate-500">
        Shared with you
      </p>
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
                  onClick={() => onImport(share._id)}
                  disabled={isBusy}
                  className={BUTTON_PRIMARY}
                >
                  Add to my applications
                </button>
                <button
                  type="button"
                  onClick={() => onDismiss(share._id)}
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
