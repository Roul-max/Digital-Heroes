import { StatsSkeleton, TableSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-8 w-32" />
      <StatsSkeleton />
      <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
        <Skeleton className="h-5 w-28" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-2 flex-1 rounded-full" />
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </div>
      </div>
      <TableSkeleton rows={5} cols={3} />
    </div>
  );
}
