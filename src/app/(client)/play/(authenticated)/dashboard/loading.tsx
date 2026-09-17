import { PlaySkeleton } from '@/components/play/ui/PlaySkeleton';

export default function DashboardLoading() {
  return (
    <div className="p-4 sm:p-6 space-y-6 bg-play-bg min-h-screen font-play max-w-7xl mx-auto w-full">
      <div className="flex items-center gap-4 bg-play-surface border border-play-border rounded-play-xl p-5">
        <PlaySkeleton variant="circular" width={64} height={64} />
        <div className="space-y-2 flex-1">
          <PlaySkeleton variant="rectangular" width={220} height={24} />
          <PlaySkeleton variant="text" width={320} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <PlaySkeleton variant="rectangular" height={220} className="rounded-play-xl w-full" />
        </div>
        <div className="lg:col-span-5">
          <PlaySkeleton variant="rectangular" height={220} className="rounded-play-xl w-full" />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <PlaySkeleton key={i} variant="rectangular" height={76} className="rounded-play-xl w-full" />
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <PlaySkeleton key={i} variant="rectangular" height={160} className="rounded-play-xl w-full" />
        ))}
      </div>
    </div>
  );
}
