"use client";

import { useEffect, useState } from "react";
import ReceivedShares, { type ReceivedShareRecord } from "../ReceivedShares";
import SentShares, { type SentShareRecord } from "../SentShares";

const POLL_INTERVAL_MS = 3000;

export default function SharesPageClient({
  initialReceivedShares,
  initialSentShares,
}: {
  initialReceivedShares: ReceivedShareRecord[];
  initialSentShares: SentShareRecord[];
}) {
  const [receivedShares, setReceivedShares] = useState(initialReceivedShares);
  const [sentShares, setSentShares] = useState(initialSentShares);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const [receivedRes, sentRes] = await Promise.all([
          fetch("/api/shares"),
          fetch("/api/shares/sent"),
        ]);
        if (receivedRes.ok) setReceivedShares(await receivedRes.json());
        if (sentRes.ok) setSentShares(await sentRes.json());
      } catch {
        // transient network error — next poll will retry
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  if (receivedShares.length === 0 && sentShares.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
        <p className="text-lg font-medium text-slate-900">
          No shared jobs yet
        </p>
        <p className="max-w-sm text-sm text-slate-500">
          Share a job posting with another ApplyTrack user by their
          username, or check back here once someone shares one with you.
        </p>
      </div>
    );
  }

  return (
    <>
      <ReceivedShares shares={receivedShares} />
      <SentShares shares={sentShares} />
    </>
  );
}
