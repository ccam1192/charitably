import Link from "next/link";
import { SignupForm } from "@/components/signup-form";

export default function SignupPage() {
  return (
    <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
      <h1 className="text-center text-xl font-semibold text-foreground">
        Join your conference
      </h1>
      <p className="mt-1 text-center text-sm text-muted">
        If an admin invited you by email, use the link they sent—no conference ID needed. Otherwise ask your
        coordinator for the conference ID below.
      </p>
      <SignupForm />
      <p className="mt-6 text-center text-xs text-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-accent underline-offset-2 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
