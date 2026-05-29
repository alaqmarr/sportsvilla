"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { createInitialAdmin } from "./actions";

export default function SetupClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await createInitialAdmin(formData);

    if (res.error) {
      toast.error(res.error);
      setLoading(false);
    } else {
      toast.success("Master Admin created successfully!");
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f1117] p-4">
      <div className="bg-[#161923] border border-[#2a2d3e] rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black font-['Outfit'] text-emerald-500 tracking-wider uppercase mb-2">
            Welcome
          </h1>
          <p className="text-gray-400 text-sm">Create the first master administrator account to secure the portal.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              required
              className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none text-sm transition-all"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none text-sm transition-all"
              placeholder="admin@sportsvilla.com"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">
              Master Password
            </label>
            <input
              type="password"
              name="password"
              required
              className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none text-sm transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-5 py-3.5 text-sm font-semibold transition-colors cursor-pointer border-none mt-4 flex justify-center items-center"
          >
            {loading ? "Securing System..." : "Complete Setup"}
          </button>
        </form>
      </div>
    </div>
  );
}
