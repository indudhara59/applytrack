"use client";

import { useState, type FormEvent } from "react";
import { BUTTON_PRIMARY, INPUT } from "@/lib/ui";
import { signUpWithCredentials } from "./actions";

export default function SignupForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const result = await signUpWithCredentials(
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
        name="name"
        type="text"
        autoComplete="name"
        placeholder="Full name (optional)"
        className={INPUT}
      />
      <input
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder="you@example.com"
        className={INPUT}
      />
      <input
        name="username"
        type="text"
        required
        autoComplete="username"
        placeholder="Username (e.g. jane_doe)"
        pattern="[a-z0-9_]{3,20}"
        title="3-20 characters: lowercase letters, numbers, and underscores"
        className={INPUT}
      />
      <input
        name="password"
        type="password"
        required
        autoComplete="new-password"
        placeholder="Password (min. 8 characters)"
        className={INPUT}
      />
      <input
        name="confirmPassword"
        type="password"
        required
        autoComplete="new-password"
        placeholder="Confirm password"
        className={INPUT}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={pending} className={BUTTON_PRIMARY}>
        {pending ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
