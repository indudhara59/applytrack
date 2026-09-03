import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import dbConnect from "@/lib/mongodb";
import Application from "@/lib/models/Application";
import { BUTTON_PRIMARY, BUTTON_SECONDARY } from "@/lib/ui";
import ApplicationActivity from "./ApplicationActivity";
import ApplicationsTable, { type ApplicationRecord } from "./ApplicationsTable";
import StatsSummary from "./StatsSummary";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  await dbConnect();
  const docs = await Application.find({ userId: session.user.id })
    .sort({ dateApplied: -1 })
    .lean();

  const applications: ApplicationRecord[] = docs.map((doc) => ({
    _id: String(doc._id),
    company: doc.company,
    role: doc.role,
    dateApplied: doc.dateApplied ? doc.dateApplied.toISOString() : null,
    status: doc.status,
    resumeVersionLabel: doc.resumeVersionLabel ?? null,
    resumeUrl: doc.resumeUrl ?? null,
    followUpDate: doc.followUpDate ? doc.followUpDate.toISOString() : null,
    followUpDone: Boolean(doc.followUpDone),
    notes: doc.notes ?? null,
  }));

  const displayName = session.user.name ?? session.user.email ?? "there";

  return (
    <main className="mx-auto max-w-6xl p-4 sm:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Welcome, {displayName}
          </h1>
          <p className="text-sm text-slate-500">Your job applications</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/dashboard/new" className={BUTTON_PRIMARY}>
            Add Application
          </Link>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button type="submit" className={BUTTON_SECONDARY}>
              Sign out
            </button>
          </form>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <p className="text-lg font-medium text-slate-900">
            No applications yet
          </p>
          <p className="max-w-sm text-sm text-slate-500">
            Track every job you apply to in one place — company, status,
            resume version, and follow-ups.
          </p>
          <Link href="/dashboard/new" className={`mt-2 ${BUTTON_PRIMARY}`}>
            Add your first application
          </Link>
        </div>
      ) : (
        <>
          <StatsSummary applications={applications} />
          <ApplicationActivity applications={applications} />
          <ApplicationsTable applications={applications} />
        </>
      )}
    </main>
  );
}
