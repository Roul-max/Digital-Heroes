import { TableSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function RepLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-28" />
      <TableSkeleton rows={6} cols={4} />
    </div>
  );
}
