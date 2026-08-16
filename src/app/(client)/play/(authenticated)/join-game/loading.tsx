export default function JoinGameLoading() {
  return (
    <div className="min-h-screen bg-[var(--play-bg)] text-[var(--play-text)] pb-24">
      <div className="p-4 sm:p-6 lg:p-8 bg-[var(--play-surface)] sticky top-0 z-10 border-b border-[var(--play-border)] shadow-sm">
        <h1 className="text-2xl font-bold font-outfit mb-4">Join a Game</h1>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-12 bg-[var(--play-surface-alt)] animate-pulse rounded-xl"></div>
          <div className="w-24 h-12 bg-[var(--play-surface-alt)] animate-pulse rounded-xl"></div>
        </div>
      </div>

      <div className="p-4 sm:px-6 flex gap-2">
        <div className="h-10 w-20 bg-[var(--play-surface-alt)] animate-pulse rounded-full"></div>
        <div className="h-10 w-24 bg-[var(--play-surface-alt)] animate-pulse rounded-full"></div>
        <div className="h-10 w-24 bg-[var(--play-surface-alt)] animate-pulse rounded-full"></div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 bg-[var(--play-surface)] border border-[var(--play-border)] animate-pulse rounded-[20px]"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
