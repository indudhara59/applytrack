export default function DashboardLoading() {
  return (
    <main className="mx-auto max-w-6xl animate-pulse p-4 sm:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="h-7 w-48 rounded bg-slate-200" />
          <div className="h-4 w-32 rounded bg-slate-200" />
        </div>
        <div className="h-9 w-36 rounded-lg bg-slate-200" />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-20 rounded-xl border border-slate-200 bg-slate-100"
          />
        ))}
      </div>

      <div className="h-64 rounded-xl border border-slate-200 bg-slate-100" />
    </main>
  );
}
