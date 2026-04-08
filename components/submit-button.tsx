"use client";

import { useFormStatus } from "react-dom";

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={`inline-block size-4 animate-spin text-current ${className ?? ""}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Shown while the form action is running (server actions). */
  pendingLabel?: string;
};

/**
 * Submit button that shows a spinner and optional label while the parent &lt;form&gt; server action runs.
 * Must be rendered inside the same &lt;form&gt; as the action.
 */
export function SubmitButton({
  children,
  className,
  pendingLabel = "Working…",
  disabled,
  ...rest
}: Props) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled ?? pending}
      className={className}
      aria-busy={pending}
      {...rest}
    >
      {pending ? (
        <span className="inline-flex items-center justify-center gap-2">
          <Spinner />
          {pendingLabel ? <span>{pendingLabel}</span> : null}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
