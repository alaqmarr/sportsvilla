import { PlaySkeleton } from '@/components/play/ui/PlaySkeleton';

export default function BookingDetailLoading() {
  return (
    <div className="min-h-screen bg-play-bg text-play-text pb-24 font-play max-w-4xl mx-auto w-full px-4 sm:px-6 pt-4 space-y-6">
      <div className="p-4 flex items-center gap-4 bg-play-surface border border-play-border rounded-play-xl">
        <PlaySkeleton variant="circular" width={40} height={40} />
        <PlaySkeleton variant="rectangular" width={160} height={24} />
      </div>

      <div className="flex flex-col items-center">
        <PlaySkeleton variant="card" height={520} className="w-full max-w-lg" />
      </div>
    </div>
  );
}
