"use client";

import { useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import { APPLICATION_STATUSES, type ApplicationStatus } from "@/lib/applicationStatus";
import { BUTTON_DANGER, BUTTON_PRIMARY, BUTTON_SECONDARY, CARD, INPUT } from "@/lib/ui";

export interface ApplicationFormValues {
  company: string;
  role: string;
  dateApplied: string;
  status: ApplicationStatus;
  resumeVersionLabel: string;
  resumeUrl: string;
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
  resumeUrl: "",
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
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = Boolean(applicationId);

  function update<K extends keyof ApplicationFormValues>(
    key: K,
    value: ApplicationFormValues[K]
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });
      update("resumeUrl", blob.url);
      if (!values.resumeVersionLabel) {
        update("resumeVersionLabel", file.name);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Resume upload failed");
    } finally {
      setUploading(false);
    }
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
    <form
      onSubmit={handleSubmit}
      className={`${CARD} flex flex-col gap-5 p-5 sm:p-6`}
    >
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-inset ring-red-600/15">
          {error}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Company">
          <input
            required
            value={values.company}
            onChange={(e) => update("company", e.target.value)}
            className={INPUT}
          />
        </Field>

        <Field label="Role">
          <input
            required
            value={values.role}
            onChange={(e) => update("role", e.target.value)}
            className={INPUT}
          />
        </Field>

        <Field label="Date Applied">
          <input
            type="date"
            value={values.dateApplied}
            onChange={(e) => update("dateApplied", e.target.value)}
            className={INPUT}
          />
        </Field>

        <Field label="Status">
          <select
            value={values.status}
            onChange={(e) => update("status", e.target.value as ApplicationStatus)}
            className={INPUT}
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
            className={INPUT}
          />
        </Field>

        <div className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          <label htmlFor="resume-file">Resume File</label>
          <input
            id="resume-file"
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileChange}
            disabled={uploading}
            className="text-sm text-slate-600 file:mr-3 file:rounded-lg file:border file:border-slate-300 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-50 disabled:opacity-50"
          />
          {uploading && (
            <p className="text-xs font-normal text-slate-500">Uploading…</p>
          )}
          {!uploading && values.resumeUrl && (
            <a
              href={values.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-fit text-xs font-normal text-indigo-600 hover:underline"
            >
              View uploaded resume
            </a>
          )}
        </div>

        <Field label="Job Posting URL">
          <input
            type="url"
            value={values.jobPostingUrl}
            onChange={(e) => update("jobPostingUrl", e.target.value)}
            className={INPUT}
          />
        </Field>

        <Field label="Contact">
          <input
            value={values.contact}
            onChange={(e) => update("contact", e.target.value)}
            className={INPUT}
          />
        </Field>

        <Field label="Follow-up Date">
          <input
            type="date"
            value={values.followUpDate}
            onChange={(e) => update("followUpDate", e.target.value)}
            className={INPUT}
          />
        </Field>

        <label className="flex items-center gap-2 self-end pb-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={values.followUpDone}
            onChange={(e) => update("followUpDone", e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/40"
          />
          Follow-up done
        </label>
      </div>

      <Field label="Notes">
        <textarea
          value={values.notes}
          onChange={(e) => update("notes", e.target.value)}
          rows={4}
          className={INPUT}
        />
      </Field>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={submitting || deleting || uploading}
            className={BUTTON_PRIMARY}
          >
            {submitting
              ? "Saving…"
              : isEditing
                ? "Save changes"
                : "Add Application"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className={BUTTON_SECONDARY}
          >
            Cancel
          </button>
        </div>

        {isEditing && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={submitting || deleting || uploading}
            className={BUTTON_DANGER}
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        )}
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
      {label}
      {children}
    </label>
  );
}
