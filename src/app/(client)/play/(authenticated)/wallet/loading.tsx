export default function WalletLoading() {
  return (
    <div className="text-[var(--play-text)] pb-32 min-h-screen bg-[var(--play-bg)]">
      <div className="bg-[var(--play-surface)] px-4 py-4 flex items-center justify-between sticky top-0 z-10 border-b border-[var(--play-border)]">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-[var(--play-surface-alt)] animate-pulse"></div>
          <div className="w-20 h-6 bg-[var(--play-surface-alt)] animate-pulse rounded"></div>
        </div>
        <div className="w-24 h-8 bg-[var(--play-surface-alt)] animate-pulse rounded-[var(--play-radius-sm)]"></div>
      </div>

      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="bg-[var(--play-surface)] rounded-[var(--play-radius-lg)] p-5 h-32 animate-pulse border border-[var(--play-border)]"></div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-24 h-10 bg-[var(--play-surface-alt)] animate-pulse rounded-[var(--play-radius-md)] shrink-0"></div>
          ))}
        </div>

        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-[var(--play-surface)] p-4 rounded-[var(--play-radius-md)] border border-[var(--play-border)] flex items-center justify-between h-20 animate-pulse">
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
