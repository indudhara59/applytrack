import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { BUTTON_SECONDARY } from "@/lib/ui";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-8">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-xs font-semibold text-white">
                A
              </span>
              <span className="text-sm font-semibold text-slate-900">
                ApplyTrack
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/shares"
                className="text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                Shared Jobs
              </Link>
            </div>
          </div>
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
      </nav>

      {children}
    </div>
  );
}
