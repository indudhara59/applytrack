import Link from "next/link";
import AuthCard from "../AuthCard";
import GoogleSignInButton from "../GoogleSignInButton";
import SignupForm from "./SignupForm";

export default function SignupPage() {
  return (
    <AuthCard
      title="Create your account"
      subtitle="Start tracking every job application in one place."
    >
      <div className="flex flex-col gap-4">
        <GoogleSignInButton />

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs font-medium text-slate-400">or</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <SignupForm />

        <p className="text-center text-xs text-slate-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-indigo-600 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}
