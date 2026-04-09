function NeighborPageContentSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="space-y-2">
        <div className="h-3 w-40 animate-pulse rounded bg-muted" />
        <div className="h-4 max-w-xl animate-pulse rounded bg-muted" />
      </div>
      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="space-y-3 p-5">
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-[92%] animate-pulse rounded bg-muted" />
          <div className="h-4 w-[78%] animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}

/** Full segment placeholder while neighbor shell (header + tabs) resolves. */
export function NeighborDetailShellSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-4 w-28 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-8 max-w-md animate-pulse rounded bg-muted" />
      </div>
      <div className="flex gap-1 border-b border-border pb-0">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="mb-[-1px] h-10 w-20 shrink-0 animate-pulse rounded-t bg-muted sm:w-24"
          />
        ))}
      </div>
      <div className="pt-2">
        <NeighborPageContentSkeleton />
      </div>
    </div>
  );
}

/** Page slot while a sub-route (visits, assistance, …) loads; shell stays mounted. */
export function NeighborPageSkeleton() {
  return <NeighborPageContentSkeleton />;
}
