export default function BookCourtLoading() {
  return (
    <div className="min-h-screen bg-[var(--play-bg)] text-[var(--play-text)] pb-24">
      <div className="p-4 flex items-center justify-between sticky top-0 bg-[var(--play-bg)]/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[var(--play-surface-alt)] animate-pulse"></div>
          <div className="h-6 w-32 bg-[var(--play-surface-alt)] animate-pulse rounded"></div>
        </div>
        <div className="w-24 h-10 bg-[var(--play-surface-alt)] animate-pulse rounded-xl"></div>
      </div>

      <div className="pt-4 px-4">
        <div className="h-20 w-full bg-[var(--play-surface-alt)] animate-pulse rounded-xl mb-8"></div>
        
        <div className="h-32 w-full bg-[var(--play-surface-alt)] animate-pulse rounded-xl mb-8"></div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-36 bg-[var(--play-surface)] border border-[var(--play-border)] animate-pulse rounded-[20px]"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
