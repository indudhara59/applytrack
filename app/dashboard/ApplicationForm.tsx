"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { APPLICATION_STATUSES, type ApplicationStatus } from "@/lib/applicationStatus";

export interface ApplicationFormValues {
  company: string;
  role: string;
  dateApplied: string;
  status: ApplicationStatus;
  resumeVersionLabel: string;
  jobPostingUrl: string;
  contact: string;
  followUpDate: string;
  followUpDone: boolean;
  notes: string;
}

const EMPTY_VALUES: ApplicationFormValues = {
  company: "",
  role: "",
  dateApplied: "",
  status: "Applied",
  resumeVersionLabel: "",
  jobPostingUrl: "",
  contact: "",
  followUpDate: "",
  followUpDone: false,
  notes: "",
};

export default function ApplicationForm({
  applicationId,
  initialValues,
}: {
  applicationId?: string;
  initialValues?: Partial<ApplicationFormValues>;
}) {
  const router = useRouter();
  const [values, setValues] = useState<ApplicationFormValues>({
    ...EMPTY_VALUES,
    ...initialValues,
  });
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = Boolean(applicationId);

  function update<K extends keyof ApplicationFormValues>(
    key: K,
    value: ApplicationFormValues[K]
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(
        isEditing ? `/api/applications/${applicationId}` : "/api/applications",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Something went wrong");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!applicationId) return;
    if (!window.confirm("Delete this application? This cannot be undone.")) {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/applications/${applicationId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Company">
          <input
            required
            value={values.company}
            onChange={(e) => update("company", e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="Role">
          <input
            required
            value={values.role}
            onChange={(e) => update("role", e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="Date Applied">
          <input
            type="date"
            value={values.dateApplied}
            onChange={(e) => update("dateApplied", e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="Status">
          <select
            value={values.status}
            onChange={(e) => update("status", e.target.value as ApplicationStatus)}
            className={inputClass}
          >
            {APPLICATION_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Resume Version Label">
          <input
            value={values.resumeVersionLabel}
            onChange={(e) => update("resumeVersionLabel", e.target.value)}
            placeholder="Resume_Google_PM.pdf"
            className={inputClass}
          />
        </Field>

        <Field label="Job Posting URL">
          <input
            type="url"
            value={values.jobPostingUrl}
            onChange={(e) => update("jobPostingUrl", e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="Contact">
          <input
            value={values.contact}
            onChange={(e) => update("contact", e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="Follow-up Date">
          <input
            type="date"
            value={values.followUpDate}
            onChange={(e) => update("followUpDate", e.target.value)}
            className={inputClass}
          />
        </Field>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={values.followUpDone}
            onChange={(e) => update("followUpDone", e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
          Follow-up done
        </label>
      </div>

      <Field label="Notes">
        <textarea
          value={values.notes}
          onChange={(e) => update("notes", e.target.value)}
          rows={4}
          className={inputClass}
        />
      </Field>

      <div className="flex items-center justify-between pt-2">
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting || deleting}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
          >
            {isEditing ? "Save changes" : "Add Application"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>

        {isEditing && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={submitting || deleting}
            className="rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
      {label}
      {children}
    </label>
  );
}

const inputClass =
  "rounded-md border border-gray-300 px-3 py-2 text-sm font-normal text-gray-900 focus:border-gray-500 focus:outline-none";
