import ApplicationForm from "../ApplicationForm";

export default function NewApplicationPage() {
  return (
    <main className="mx-auto max-w-2xl p-6 sm:p-8">
      <h1 className="mb-6 text-2xl font-semibold">Add Application</h1>
      <ApplicationForm />
    </main>
  );
}
