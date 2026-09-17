import { Skeleton, SkeletonCard } from "@/components/admin/ui";

export default function MembersLoading() {
  return (
    <div className="space-y-6 pb-12 font-sans">
      <div className="flex justify-between items-center pb-6 border-b border-sv-border-subtle">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32 rounded-sv-sm" />
      </div>

      <div className="bg-sv-surface border border-sv-border rounded-sv-lg overflow-hidden p-6 space-y-6">
        <Skeleton className="h-10 w-full rounded-sv-sm" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonCard key={i} hasFooter />
          ))}
        </div>
      </div>
    </div>
  );
}
