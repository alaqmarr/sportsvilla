export default function MembersLoading() {
  return (
    <div className="animate-pulse">
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="h-8 w-48 bg-[#1c1f2e] rounded-lg mb-2"></div>
          <div className="h-4 w-64 bg-[#161923] rounded-lg"></div>
        </div>
        <div className="h-10 w-32 bg-[#1c1f2e] rounded-lg"></div>
      </div>

      <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-[#2a2d3e]">
          <div className="h-10 w-full bg-[#1c1f2e] rounded-lg"></div>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-[#1c1f2e] border border-[#2a2d3e] rounded-xl p-5">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#2a2d3e]"></div>
                  <div>
                    <div className="h-5 w-32 bg-[#2a2d3e] rounded-lg mb-2"></div>
                    <div className="h-4 w-24 bg-[#2a2d3e] rounded-lg"></div>
                  </div>
                </div>
                <div className="h-8 w-8 bg-[#2a2d3e] rounded-lg"></div>
              </div>
              <div className="h-4 w-full bg-[#2a2d3e] rounded-lg mb-2"></div>
              <div className="h-4 w-3/4 bg-[#2a2d3e] rounded-lg mb-4"></div>
              <div className="h-8 w-full bg-[#2a2d3e] rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
