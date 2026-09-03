"use client";

import { useEffect } from "react";
import { BUTTON_PRIMARY } from "@/lib/ui";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex max-w-2xl flex-col items-center gap-3 p-8 text-center">
      <p className="text-lg font-medium text-slate-900">
        Something went wrong
      </p>
      <p className="text-sm text-slate-500">
        We couldn&apos;t load your applications. Please try again.
      </p>
      <button type="button" onClick={reset} className={`mt-2 ${BUTTON_PRIMARY}`}>
        Try again
      </button>
    </main>
  );
}
