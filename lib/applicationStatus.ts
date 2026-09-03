/**
 * Client-safe status constants shared between the Mongoose schema and the
 * UI. Kept out of lib/models/Application.ts so components can import it
 * without pulling mongoose into the browser bundle.
 */
export const APPLICATION_STATUSES = [
  "Not Applied",
  "Applied",
  "Pending",
  "Phone Screen",
  "Interview",
  "Offer",
  "Accepted",
  "Rejected",
  "Withdrawn",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const STATUS_BADGE_STYLES: Record<ApplicationStatus, string> = {
  "Not Applied": "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/10",
  Applied: "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-500/10",
  Pending: "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-600/15",
  "Phone Screen": "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-600/15",
  Interview: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/15",
  Offer: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/15",
  Accepted: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/15",
  Rejected: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/15",
  Withdrawn: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/15",
};

/** Solid fill colors for the status bar charts (badges above use soft tints instead). */
export const STATUS_BAR_COLORS: Record<ApplicationStatus, string> = {
  "Not Applied": "bg-slate-300",
  Applied: "bg-slate-400",
  Pending: "bg-sky-500",
  "Phone Screen": "bg-violet-500",
  Interview: "bg-blue-500",
  Offer: "bg-emerald-500",
  Accepted: "bg-green-600",
  Rejected: "bg-red-500",
  Withdrawn: "bg-amber-500",
};

/** Whole-row tint for statuses that should stand out in the applications table. */
export const STATUS_ROW_STYLES: Partial<Record<ApplicationStatus, string>> = {
  Accepted: "bg-green-50 hover:bg-green-100/70",
  Rejected: "bg-red-50 hover:bg-red-100/70",
};
