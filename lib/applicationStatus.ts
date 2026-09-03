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
  "Not Applied": "bg-gray-100 text-gray-600",
  Applied: "bg-gray-100 text-gray-700",
  "Phone Screen": "bg-purple-100 text-purple-700",
  Interview: "bg-blue-100 text-blue-700",
  Offer: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
  Withdrawn: "bg-yellow-100 text-yellow-700",
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
