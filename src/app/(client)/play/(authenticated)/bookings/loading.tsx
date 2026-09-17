import { PlaySkeleton } from '@/components/play/ui/PlaySkeleton';

export default function BookingsLoading() {
  return (
    <div className="text-play-text pb-24 bg-play-bg min-h-screen font-play space-y-6 max-w-7xl mx-auto w-full">
      <div className="p-5 sm:p-6 bg-play-surface rounded-play-xl border border-play-border shadow-play-sm space-y-4">
        <PlaySkeleton variant="rectangular" width={200} height={28} />
        <PlaySkeleton variant="text" width={300} />
      </div>

      <div className="flex gap-2">
        <PlaySkeleton variant="rectangular" width={90} height={36} className="rounded-play-pill" />
        <PlaySkeleton variant="rectangular" width={100} height={36} className="rounded-play-pill" />
        <PlaySkeleton variant="rectangular" width={90} height={36} className="rounded-play-pill" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[...Array(6)].map((_, i) => (
          <PlaySkeleton key={i} variant="card" height={160} className="w-full" />
        ))}
      </div>
    </div>
  );
}
