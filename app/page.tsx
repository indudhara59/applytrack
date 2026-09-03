import Link from "next/link";
import { auth } from "@/auth";
import { STATUS_BADGE_STYLES } from "@/lib/applicationStatus";
import { BUTTON_PRIMARY, BUTTON_SECONDARY, CARD } from "@/lib/ui";
import FadeInSection from "./FadeInSection";

const FEATURES = [
  {
    title: "Track everything",
    description:
      "Company, role, dates, contact, and notes — every application in one organized table.",
    icon: ListIcon,
  },
  {
    title: "Resume versions",
    description:
      "Attach the exact resume you sent for each application, one click away from the dashboard.",
    icon: DocumentIcon,
  },
  {
    title: "Follow-up reminders",
    description:
      "See exactly which follow-ups are due in the next 7 days, so nothing falls through the cracks.",
    icon: BellIcon,
  },
  {
    title: "Status at a glance",
    description:
      "Color-coded badges and a stats dashboard show your whole pipeline in seconds.",
    icon: ChartIcon,
  },
] as const;

const STEPS = [
  {
    title: "Sign in with Google",
    description: "No passwords to manage — one click and you're in.",
  },
  {
    title: "Log an application",
    description:
      "Company, role, resume version, and a link to the posting — takes seconds.",
  },
  {
    title: "Stay on top of it",
    description:
      "Filter by status, sort by date, and check off follow-ups as you go.",
  },
] as const;

const PREVIEW_ROWS = [
  { company: "Northwind", role: "Product Manager", status: "Interview" },
  { company: "Globex", role: "Frontend Engineer", status: "Applied" },
  { company: "Initech", role: "Data Analyst", status: "Offer" },
] as const;

export default async function LandingPage() {
  const session = await auth();
  const isSignedIn = Boolean(session?.user?.id);
  const primaryHref = isSignedIn ? "/dashboard" : "/login";
  const primaryLabel = isSignedIn ? "Go to Dashboard" : "Get Started";

  return (
    <div className="flex min-h-screen flex-col">
      <nav className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-8">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-semibold text-white">
              A
            </span>
            <span className="text-sm font-semibold text-slate-900">
              ApplyTrack
            </span>
          </div>
          <div className="hidden items-center gap-8 sm:flex">
            <a
              href="#features"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              How it works
            </a>
          </div>
          <Link href={primaryHref} className={BUTTON_PRIMARY}>
            {isSignedIn ? "Dashboard" : "Log in"}
          </Link>
        </div>
      </nav>

      <main className="flex-1">
        <section className="bg-dot-grid relative overflow-hidden border-b border-slate-200">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-8 sm:py-28 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-600/15">
                Job search, organized
              </span>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
                Track every application.
                <br />
                Land the offer.
              </h1>
              <p className="mt-4 max-w-lg text-base text-slate-600 sm:text-lg">
                ApplyTrack keeps your entire job search in one place —
                company, role, status, resume version, and follow-ups — so
                you always know what to do next.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={primaryHref} className={BUTTON_PRIMARY}>
                  {primaryLabel}
                </Link>
                <a href="#features" className={BUTTON_SECONDARY}>
                  See how it works
                </a>
              </div>
            </div>

            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-indigo-300/30 blur-3xl"
              />
              <div
                aria-hidden="true"
                className="absolute -bottom-12 -left-10 h-56 w-56 rounded-full bg-violet-300/30 blur-3xl"
              />
              <div
                className={`${CARD} relative rotate-1 p-5 transition-transform hover:rotate-0`}
              >
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-400">
                  Your pipeline
                </p>
                <div className="flex flex-col gap-2">
                  {PREVIEW_ROWS.map((row) => (
                    <div
                      key={row.company}
                      className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {row.company}
                        </p>
                        <p className="text-xs text-slate-500">{row.role}</p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE_STYLES[row.status]}`}
                      >
                        {row.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-6xl px-4 py-20 sm:px-8">
          <FadeInSection className="mb-10 text-center">
            <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
              Everything your job search needs
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-slate-600">
              No spreadsheets, no sticky notes — just a clear view of where
              every application stands.
            </p>
          </FadeInSection>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature, i) => (
              <FadeInSection key={feature.title} delay={i * 80}>
                <div className={`${CARD} h-full p-5`}>
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <feature.icon />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    {feature.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-slate-600">
                    {feature.description}
                  </p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </section>

        <section
          id="how-it-works"
          className="border-y border-slate-200 bg-white"
        >
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-8">
            <FadeInSection className="mb-10 text-center">
              <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
                How it works
              </h2>
            </FadeInSection>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
              {STEPS.map((step, i) => (
                <FadeInSection key={step.title} delay={i * 100}>
                  <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
                      {i + 1}
                    </span>
                    <h3 className="mt-3 text-sm font-semibold text-slate-900">
                      {step.title}
                    </h3>
                    <p className="mt-1.5 text-sm text-slate-600">
                      {step.description}
                    </p>
                  </div>
                </FadeInSection>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-8">
          <FadeInSection>
            <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
              Ready to get organized?
            </h2>
            <p className="mx-auto mt-2 max-w-md text-slate-600">
              Sign in with Google and log your first application in under a
              minute.
            </p>
            <Link href={primaryHref} className={`mt-6 inline-flex ${BUTTON_PRIMARY}`}>
              {primaryLabel}
            </Link>
          </FadeInSection>
        </section>
      </main>

      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500">
        ApplyTrack — built with Next.js
      </footer>
    </div>
  );
}

function ListIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"
      />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"
      />
      <path
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        d="M14 3v5h5M9 13h6M9 17h6"
      />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9Z"
      />
      <path
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        d="M13.73 21a2 2 0 0 1-3.46 0"
      />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 20V10M12 20V4M20 20v-7"
      />
    </svg>
  );
}
