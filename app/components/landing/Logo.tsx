export function LogoMark({ className }: { className?: string }) {
  return (
    <div
      className={[
        "grid size-9 place-items-center rounded-xl border border-border bg-white shadow-sm",
        className ?? "",
      ].join(" ")}
      aria-hidden="true"
    >
      <div className="grid size-6 place-items-center rounded-lg bg-accent text-accent-foreground">
        <span className="text-xs font-semibold tracking-tight">C</span>
      </div>
    </div>
  );
}

export function LogoWordmark({ className }: { className?: string }) {
  return (
    <div className={["flex items-center gap-3", className ?? ""].join(" ")}>
      <LogoMark />
      <div className="leading-none">
        <div className="text-sm font-semibold tracking-tight">Charitably</div>
        <div className="text-xs text-muted">For SVdP conferences</div>
      </div>
    </div>
  );
}

