import Link from "next/link";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
      <h1 className="text-center text-xl font-semibold text-foreground">
        Charitably
      </h1>
      <p className="mt-1 text-center text-sm text-muted">
        Sign in to your SVdP conference workspace
      </p>
      <LoginForm />
      <p className="mt-6 text-center text-xs text-muted">
        New volunteer?{" "}
        <Link href="/signup" className="text-accent underline-offset-2 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
