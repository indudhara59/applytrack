import type { ReactNode } from "react";

export default function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <main className="bg-dot-grid relative flex min-h-screen flex-col items-center justify-center gap-8 overflow-hidden p-6">
      <div
        aria-hidden="true"
        className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-indigo-300/40 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-violet-300/30 blur-3xl"
      />
      <svg
        aria-hidden="true"
        viewBox="0 0 200 200"
        className="pointer-events-none absolute left-10 top-16 hidden h-24 w-24 text-indigo-200 sm:block"
      >
        <circle
          cx="100"
          cy="100"
          r="90"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="6 10"
        />
      </svg>
      <svg
        aria-hidden="true"
        viewBox="0 0 200 200"
        className="pointer-events-none absolute bottom-16 right-14 hidden h-16 w-16 text-violet-200 sm:block"
      >
        <rect
          x="10"
          y="10"
          width="180"
          height="180"
          rx="28"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>

      <div className="relative flex flex-col items-center gap-2 text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-lg font-semibold text-white shadow-sm">
          A
        </div>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">
          {title}
        </h1>
        <p className="max-w-xs text-sm text-slate-500">{subtitle}</p>
      </div>

      <div className="relative w-full max-w-sm rounded-xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
        {children}
      </div>
    </main>
  );
}
