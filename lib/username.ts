/** Lowercase letters, numbers, and underscores — 3 to 20 characters. */
export const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;

export const USERNAME_HELP_TEXT =
  "3-20 characters: lowercase letters, numbers, and underscores.";

export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}
