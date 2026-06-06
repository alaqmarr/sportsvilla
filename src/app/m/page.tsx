"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function MemberEntryPage() {
  const router = useRouter();
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!mobile || mobile.length < 10) {
      toast.error("Please enter a valid mobile number");
      return;
    }

    setLoading(true);
    // Redirect to the dynamic mobile route
    router.push(`/m/${mobile}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f1117] p-4 font-['Inter']">
      <div className="bg-[#161923] border border-[#2a2d3e] rounded-2xl p-8 w-full max-w-md shadow-2xl relative overflow-hidden">
        
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none"></div>

        <div className="text-center mb-8 relative z-10">
          <h1 className="text-3xl font-black font-['Outfit'] text-orange-500 tracking-wider uppercase mb-2">
            SportsVilla
          </h1>
          <p className="text-gray-400 text-sm">Enter your registered mobile number to view your ID Card and attendance.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">
              Mobile Number
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">+91</span>
              <input
                type="tel"
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg pl-12 pr-4 py-3.5 text-white placeholder-gray-600 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-base font-semibold tracking-wide transition-all"
                placeholder="9876543210"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-5 py-3.5 text-sm font-bold tracking-wide transition-all cursor-pointer border-none mt-4 shadow-lg shadow-orange-500/20 flex justify-center items-center"
          >
            {loading ? "Locating Profile..." : "View ID Card"}
          </button>
        </form>
      </div>
    </div>
  );
}
