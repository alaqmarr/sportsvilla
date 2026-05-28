export default function DashboardLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-10">
        <div className="h-8 w-64 bg-[#1c1f2e] rounded-lg mb-3"></div>
        <div className="h-4 w-96 bg-[#161923] rounded-lg"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-6 flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-[#1c1f2e]"></div>
            <div>
              <div className="h-8 w-16 bg-[#1c1f2e] rounded-lg mb-2"></div>
              <div className="h-4 w-24 bg-[#1c1f2e] rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-6">
        <div className="h-6 w-48 bg-[#1c1f2e] rounded-lg mb-5"></div>
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between items-center p-4 rounded-lg bg-[#1c1f2e] border border-[#2a2d3e]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#2a2d3e]"></div>
                <div>
                  <div className="h-4 w-32 bg-[#2a2d3e] rounded-lg mb-2"></div>
                  <div className="h-3 w-24 bg-[#2a2d3e] rounded-lg"></div>
                </div>
              </div>
              <div className="text-right">
                <div className="h-4 w-24 bg-[#2a2d3e] rounded-lg mb-2"></div>
                <div className="h-3 w-20 bg-[#2a2d3e] rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
