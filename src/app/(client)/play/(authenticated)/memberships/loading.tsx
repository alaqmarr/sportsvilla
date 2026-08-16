export default function MembershipsLoading() {
  return (
    <div className="min-h-screen bg-[var(--play-bg)] text-[var(--play-text)] p-4 sm:p-6 pb-24">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-6 h-6 rounded-full bg-[var(--play-surface-alt)] animate-pulse"></div>
        <div className="h-8 w-40 bg-[var(--play-surface-alt)] animate-pulse rounded"></div>
      </div>

      <section className="mb-10">
        <div className="h-6 w-32 bg-[var(--play-surface-alt)] animate-pulse rounded mb-4"></div>
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-[var(--play-surface)] p-5 rounded-[var(--play-radius-lg)] border border-[var(--play-border)] h-40 animate-pulse"></div>
          ))}
        </div>
      </section>

      <section>
        <div className="h-6 w-40 bg-[var(--play-surface-alt)] animate-pulse rounded mb-4"></div>
        <div className="bg-[var(--play-surface)] rounded-[var(--play-radius-lg)] border border-[var(--play-border)] h-64 animate-pulse"></div>
      </section>
    </div>
  );
}
