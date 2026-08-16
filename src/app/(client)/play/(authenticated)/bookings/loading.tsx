export default function BookingsLoading() {
  return (
    <div className="text-[var(--play-text)] pb-24 bg-[var(--play-bg)] min-h-screen">
      <div className="p-4 sm:p-6 lg:p-8 bg-[var(--play-surface)] sticky top-0 z-10 border-b border-[var(--play-border)]">
        <h1 className="text-2xl font-bold text-[var(--play-text)] mb-4">My Purchases</h1>
        <div className="flex gap-2">
          <div className="h-10 w-24 bg-[var(--play-surface-alt)] animate-pulse rounded-full"></div>
          <div className="h-10 w-24 bg-[var(--play-surface-alt)] animate-pulse rounded-full"></div>
          <div className="h-10 w-24 bg-[var(--play-surface-alt)] animate-pulse rounded-full"></div>
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-[var(--play-surface)] animate-pulse rounded-[var(--play-radius-lg)] border border-[var(--play-border)] shadow-sm"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
