import { Skeleton, SkeletonCard, TableSkeleton } from "@/components/admin/ui";

export default function AdminLoading() {
  return (
    <div className="w-full max-w-7xl mx-auto p-6 lg:p-8 space-y-8 font-sans">
      <div className="space-y-3 pb-6 border-b border-sv-border-subtle">
        <Skeleton className="h-8 w-64 rounded-sv-md" />
        <Skeleton className="h-4 w-96 rounded-sv-sm" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <SkeletonCard key={i} className="min-h-[120px]" />
        ))}
      </div>

      <TableSkeleton rows={4} columns={4} />
    </div>
  );
}
