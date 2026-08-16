export default function DashboardLoading() {
  return (
    <div className="p-4 space-y-6 bg-[var(--play-bg)] min-h-screen">
      <div className="h-8 bg-[var(--play-surface-alt)] animate-pulse rounded w-1/2 mt-6"></div>
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="h-28 bg-[var(--play-surface)] border border-[var(--play-border)] animate-pulse rounded-[var(--play-radius-md)]"></div>
        <div className="h-28 bg-[var(--play-surface)] border border-[var(--play-border)] animate-pulse rounded-[var(--play-radius-md)]"></div>
        <div className="h-28 bg-[var(--play-surface)] border border-[var(--play-border)] animate-pulse rounded-[var(--play-radius-md)]"></div>
        <div className="h-28 bg-[var(--play-surface)] border border-[var(--play-border)] animate-pulse rounded-[var(--play-radius-md)]"></div>
      </div>
      <div className="h-48 bg-[var(--play-surface)] border border-[var(--play-border)] animate-pulse rounded-[var(--play-radius-lg)] mt-6"></div>
      <div className="h-48 bg-[var(--play-surface)] border border-[var(--play-border)] animate-pulse rounded-[var(--play-radius-lg)] mt-6"></div>
    </div>
  );
}
