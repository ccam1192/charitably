import type { ReactNode } from "react";

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={["mx-auto w-full max-w-6xl px-6", className ?? ""].join(" ")}>{children}</div>;
}

export function Section({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={["py-16 sm:py-20", className ?? ""].join(" ")}>
      {children}
    </section>
  );
}

