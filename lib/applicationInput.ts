const APPLICATION_FIELDS = [
  "company",
  "role",
  "dateApplied",
  "status",
  "resumeVersionLabel",
  "resumeUrl",
  "jobPostingUrl",
  "contact",
  "followUpDate",
  "followUpDone",
  "notes",
] as const;

const DATE_FIELDS = new Set(["dateApplied", "followUpDate"]);

/**
 * Picks the allowed application fields out of a request body and coerces
 * date strings ("" -> null, otherwise -> Date) and followUpDone to a
 * boolean. Only keys present in `body` are included, so this also works for
 * PATCH partial updates.
 */
export function pickApplicationFields(
  body: Record<string, unknown>
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const field of APPLICATION_FIELDS) {
    if (!(field in body)) continue;
    const value = body[field];
    if (DATE_FIELDS.has(field)) {
      result[field] = value ? new Date(value as string) : null;
    } else if (field === "followUpDone") {
      result[field] = Boolean(value);
    } else {
      result[field] = value;
    }
  }
  return result;
}
