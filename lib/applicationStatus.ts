/**
 * Client-safe status constants shared between the Mongoose schema and the
 * UI. Kept out of lib/models/Application.ts so components can import it
 * without pulling mongoose into the browser bundle.
 */
export const APPLICATION_STATUSES = [
  "Not Applied",
  "Applied",
  "Phone Screen",
  "Interview",
  "Offer",
  "Rejected",
  "Withdrawn",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const STATUS_BADGE_STYLES: Record<ApplicationStatus, string> = {
  "Not Applied": "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/10",
  Applied: "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-500/10",
  "Phone Screen": "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-600/15",
  Interview: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/15",
  Offer: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/15",
  Rejected: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/15",
  Withdrawn: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/15",
};

/** Plural form for counts != 1 in the dashboard stats summary. */
export const STATUS_PLURAL_LABELS: Record<ApplicationStatus, string> = {
  "Not Applied": "Not Applied",
  Applied: "Applied",
  "Phone Screen": "Phone Screens",
  Interview: "Interviews",
  Offer: "Offers",
  Rejected: "Rejected",
  Withdrawn: "Withdrawn",
};
