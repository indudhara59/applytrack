import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import dbConnect from "@/lib/mongodb";
import Application from "@/lib/models/Application";
import ApplicationsTable, { type ApplicationRecord } from "./ApplicationsTable";

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
    followUpDate: doc.followUpDate ? doc.followUpDate.toISOString() : null,
    followUpDone: Boolean(doc.followUpDone),
    notes: doc.notes ?? null,
  }));

  const displayName = session.user.name ?? session.user.email ?? "there";

  return (
    <main className="mx-auto max-w-6xl p-6 sm:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Welcome, {displayName}</h1>
          <p className="text-sm text-gray-500">Your job applications</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/new"
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            Add Application
          </Link>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button
              type="submit"
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>

      <ApplicationsTable applications={applications} />
    </main>
  );
}
