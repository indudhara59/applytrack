"use client";

import { useState, type FormEvent } from "react";
import { BUTTON_PRIMARY, INPUT } from "@/lib/ui";
import { setUsername } from "./actions";

export default function UsernameForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const result = await setUsername(new FormData(event.currentTarget));

    if (result) {
      setError(result);
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        name="username"
        type="text"
        required
        autoComplete="username"
        placeholder="e.g. jane_doe"
        pattern="[a-z0-9_]{3,20}"
        title="3-20 characters: lowercase letters, numbers, and underscores"
        className={INPUT}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={pending} className={BUTTON_PRIMARY}>
        {pending ? "Saving…" : "Continue"}
      </button>
    </form>
  );
}
