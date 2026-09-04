"use client";

import { useState, useTransition } from "react";
import { BUTTON_PRIMARY, BUTTON_SECONDARY, CARD } from "@/lib/ui";
import { generateApiKey } from "./actions";

function maskKey(key: string): string {
  return `${key.slice(0, 8)}${"•".repeat(20)}`;
}

export default function SettingsClient({
  initialApiKey,
}: {
  initialApiKey: string | null;
}) {
  const [apiKey, setApiKey] = useState(initialApiKey);
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleGenerate() {
    if (apiKey) {
      const confirmed = window.confirm(
        "Generate a new key? The current key will stop working immediately, including in any extension where it's saved."
      );
      if (!confirmed) return;
    }

    startTransition(async () => {
      const newKey = await generateApiKey();
      setApiKey(newKey);
      setRevealed(true);
      setCopied(false);
    });
  }

  async function handleCopy() {
    if (!apiKey) return;
    await navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={`${CARD} p-6`}>
      <h2 className="text-lg font-semibold text-slate-900">
        ApplyTrack API key
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Paste this key into the ApplyTrack Chrome extension settings so it
        can automatically log jobs you apply to on LinkedIn.
      </p>

      <div className="mt-4">
        {apiKey ? (
          <div className="flex flex-wrap items-center gap-2">
            <code className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-800">
              {revealed ? apiKey : maskKey(apiKey)}
            </code>
            <button
              type="button"
              onClick={() => setRevealed((r) => !r)}
              className={BUTTON_SECONDARY}
            >
              {revealed ? "Hide" : "Reveal"}
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className={BUTTON_SECONDARY}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            You don&apos;t have an API key yet. Generate one to connect the
            Chrome extension.
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={handleGenerate}
        disabled={isPending}
        className={`${BUTTON_PRIMARY} mt-4`}
      >
        {isPending
          ? "Generating…"
          : apiKey
            ? "Generate New Key"
            : "Generate Key"}
      </button>
      {apiKey && (
        <p className="mt-2 text-xs text-slate-500">
          Generating a new key immediately invalidates the current one.
        </p>
      )}
    </div>
  );
}
