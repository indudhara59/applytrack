export type ShareStatus = "pending" | "imported" | "dismissed";

export const SHARE_STATUS_LABELS: Record<ShareStatus, string> = {
  pending: "Pending",
  imported: "Added",
  dismissed: "Dismissed",
};

export const SHARE_STATUS_STYLES: Record<ShareStatus, string> = {
  pending: "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/10",
  imported: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/15",
  dismissed: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/15",
};
