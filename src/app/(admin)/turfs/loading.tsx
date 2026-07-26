export default function TurfsLoading() {
  return (
    <div className="animate-pulse">
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="h-8 w-48 bg-[#1c1f2e] rounded-lg mb-2"></div>
          <div className="h-4 w-64 bg-[#161923] rounded-lg"></div>
        </div>
        <div className="h-10 w-32 bg-[#1c1f2e] rounded-lg"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="w-11 h-11 rounded-lg bg-[#1c1f2e]"></div>
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#1c1f2e]"></div>
                <div className="w-8 h-8 rounded-lg bg-[#1c1f2e]"></div>
              </div>
            </div>
            <div className="h-6 w-32 bg-[#1c1f2e] rounded-lg mb-3"></div>
            <div className="h-4 w-48 bg-[#1c1f2e] rounded-lg mb-4"></div>
            <div className="h-8 w-24 bg-[#1c1f2e] rounded-full"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
