export default function BookingDetailLoading() {
  return (
    <div className="min-h-screen bg-[var(--play-bg)] text-[var(--play-text)] pb-24">
      <div className="p-4 flex items-center gap-4 bg-[var(--play-surface)] border-b border-[var(--play-border)] sticky top-0 z-10">
        <div className="w-10 h-10 rounded-full bg-[var(--play-surface-alt)] animate-pulse"></div>
        <div className="h-6 w-40 bg-[var(--play-surface-alt)] animate-pulse rounded"></div>
      </div>

      <div className="p-4 sm:p-6 flex flex-col items-center">
        <div className="w-full max-w-md h-[500px] bg-[var(--play-surface)] animate-pulse rounded-[var(--play-radius-lg)] border border-[var(--play-border)]"></div>
      </div>
    </div>
  );
}
