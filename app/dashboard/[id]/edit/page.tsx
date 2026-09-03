import { isValidObjectId } from "mongoose";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import Application from "@/lib/models/Application";
import ApplicationForm from "../../ApplicationForm";

export default async function EditApplicationPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  if (!isValidObjectId(params.id)) notFound();

  await dbConnect();
  const doc = await Application.findOne({
    _id: params.id,
    userId: session.user.id,
  }).lean();

  if (!doc) notFound();

  return (
    <main className="mx-auto max-w-2xl p-4 sm:p-8">
      <h1 className="mb-6 text-2xl font-semibold">Edit Application</h1>
      <ApplicationForm
        applicationId={params.id}
        initialValues={{
          company: doc.company,
          role: doc.role,
          dateApplied: toDateInputValue(doc.dateApplied),
          status: doc.status,
          resumeVersionLabel: doc.resumeVersionLabel ?? "",
          resumeUrl: doc.resumeUrl ?? "",
          jobPostingUrl: doc.jobPostingUrl ?? "",
          contact: doc.contact ?? "",
          followUpDate: toDateInputValue(doc.followUpDate),
          followUpDone: Boolean(doc.followUpDone),
          notes: doc.notes ?? "",
        }}
      />
    </main>
  );
}

function toDateInputValue(date: Date | null | undefined) {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}
