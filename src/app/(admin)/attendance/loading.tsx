import { Skeleton, SkeletonCard, TableSkeleton } from "@/components/admin/ui";

export default function AttendanceLoading() {
  return (
    <div className="space-y-6 pb-12 font-sans">
      <div className="flex justify-between items-center pb-6 border-b border-sv-border-subtle">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 rounded-sv-md" />
          <Skeleton className="h-4 w-64 rounded-sv-sm" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SkeletonCard className="min-h-[380px] flex flex-col items-center justify-center p-8 space-y-6" />
        <TableSkeleton rows={6} columns={3} />
      </div>
    </div>
  );
}
