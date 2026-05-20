export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
      <div className="h-3 w-24 animate-pulse rounded bg-slate-800" />
      <div className="mt-5 flex items-end justify-between">
        <div className="h-9 w-16 animate-pulse rounded bg-slate-800" />
        <div className="h-3 w-20 animate-pulse rounded bg-slate-800" />
      </div>
    </div>
  );
}

export function ListSkeleton({ rows = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="rounded-2xl border border-slate-800 bg-slate-900/45 p-4">
          <div className="h-4 w-2/3 animate-pulse rounded bg-slate-800" />
          <div className="mt-3 h-3 w-full animate-pulse rounded bg-slate-800" />
          <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-slate-800" />
        </div>
      ))}
    </div>
  );
}
