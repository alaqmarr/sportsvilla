import { PlaySkeleton } from '@/components/play/ui/PlaySkeleton';

export default function BookCourtLoading() {
  return (
    <div className="min-h-screen bg-play-bg text-play-text pb-24 font-play max-w-7xl mx-auto w-full px-4 sm:px-6 pt-4 space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-play-border">
        <div className="flex items-center gap-3">
          <PlaySkeleton variant="circular" width={40} height={40} />
          <PlaySkeleton variant="rectangular" width={140} height={24} />
        </div>
        <PlaySkeleton variant="rectangular" width={120} height={36} className="rounded-play-pill" />
      </div>

      <div className="space-y-6">
        <PlaySkeleton variant="rectangular" height={88} className="rounded-play-xl w-full" />
        <PlaySkeleton variant="rectangular" height={400} className="rounded-play-xl w-full" />
      </div>
    </div>
  );
}
