import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-neutral-200", className)}
      aria-hidden="true"
    />
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
      <div className="bg-neutral-50 border-b border-neutral-200 px-4 py-3 flex gap-8">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-20" />
        ))}
      </div>
      <div className="divide-y divide-neutral-100">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-4 py-3 flex gap-8 items-center">
            {Array.from({ length: cols }).map((_, j) => (
              <Skeleton key={j} className={cn("h-4", j === 0 ? "w-32" : "w-20")} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-neutral-200 p-6 space-y-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  );
}
