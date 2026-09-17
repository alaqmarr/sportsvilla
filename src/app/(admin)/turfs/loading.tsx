import { Skeleton, SkeletonCard } from "@/components/admin/ui";

export default function TurfsLoading() {
  return (
    <div className="space-y-6 pb-12 font-sans">
      <div className="flex justify-between items-center pb-6 border-b border-sv-border-subtle">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 rounded-sv-md" />
          <Skeleton className="h-4 w-64 rounded-sv-sm" />
        </div>
        <Skeleton className="h-10 w-32 rounded-sv-sm" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <SkeletonCard key={i} className="min-h-[180px]" />
        ))}
      </div>
    </div>
  );
}
