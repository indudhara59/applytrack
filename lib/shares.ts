import Application from "@/lib/models/Application";
import type { ApplicationStatus } from "@/lib/applicationStatus";

/**
 * For shares that have been imported, looks up the current status of the
 * resulting application — shared by both the "received" and "sent" share
 * views so each side can see whether the job has actually been applied to.
 */
export async function getResultingStatusMap(
  docs: { status: string; resultingApplicationId?: string | null }[]
): Promise<Map<string, ApplicationStatus>> {
  const ids = docs
    .filter((doc) => doc.status === "imported" && doc.resultingApplicationId)
    .map((doc) => doc.resultingApplicationId as string);

  if (ids.length === 0) return new Map();

  const applications = await Application.find({ _id: { $in: ids } })
    .select("status")
    .lean();

  return new Map(applications.map((doc) => [String(doc._id), doc.status]));
}
