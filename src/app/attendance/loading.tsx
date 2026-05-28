export default function AttendanceLoading() {
  return (
    <div className="animate-pulse">
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="h-8 w-48 bg-[#1c1f2e] rounded-lg mb-2"></div>
          <div className="h-4 w-64 bg-[#161923] rounded-lg"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Kiosk Scanner Skeleton */}
        <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-8 flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-16 h-16 rounded-2xl bg-[#1c1f2e] mb-6"></div>
          <div className="h-6 w-48 bg-[#1c1f2e] rounded-lg mb-3"></div>
          <div className="h-4 w-64 bg-[#1c1f2e] rounded-lg mb-8"></div>
          <div className="h-14 w-full max-w-sm bg-[#1c1f2e] rounded-xl mb-4"></div>
          <div className="h-14 w-full max-w-sm bg-[#1c1f2e] rounded-xl"></div>
        </div>

        {/* Recent Check-ins Skeleton */}
        <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-[#2a2d3e] flex justify-between items-center bg-[#1c1f2e]">
            <div className="h-6 w-32 bg-[#2a2d3e] rounded-lg"></div>
            <div className="h-6 w-6 bg-[#2a2d3e] rounded-lg"></div>
          </div>
          <div className="p-4">
            <div className="flex flex-col gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-[#1c1f2e] border border-[#2a2d3e]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#2a2d3e]"></div>
                    <div>
                      <div className="h-4 w-24 bg-[#2a2d3e] rounded-lg mb-2"></div>
                      <div className="h-3 w-32 bg-[#2a2d3e] rounded-lg"></div>
                    </div>
                  </div>
                  <div className="h-6 w-16 bg-[#2a2d3e] rounded-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
