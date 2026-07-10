import { TableSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function LeadsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-9 w-64 rounded-md" />
        <Skeleton className="h-9 w-32 rounded-md" />
        <Skeleton className="h-9 w-20 rounded-lg" />
      </div>
      <TableSkeleton rows={8} cols={6} />
    </div>
  );
}
