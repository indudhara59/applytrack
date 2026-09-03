"use client";

import { useState, type FormEvent } from "react";
import { BUTTON_PRIMARY, INPUT } from "@/lib/ui";
import { authenticateWithCredentials } from "./actions";

export default function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const result = await authenticateWithCredentials(
      new FormData(event.currentTarget)
    );

    if (result) {
      setError(result);
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder="you@example.com"
        className={INPUT}
      />
      <input
        name="password"
        type="password"
        required
        autoComplete="current-password"
        placeholder="Password"
        className={INPUT}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={pending} className={BUTTON_PRIMARY}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
