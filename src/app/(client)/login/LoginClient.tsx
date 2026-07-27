"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";

export default function LoginClient({ magicVerified }: { magicVerified?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        toast.error("Invalid email or password");
      } else {
        toast.success("Logged in successfully!");
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f1117] p-4">
      <div className="bg-[#161923] border border-[#2a2d3e] rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <div className="text-center mb-8 flex flex-col items-center">
          <h1 className="mb-4">
            <Image src="/long-logo.png" alt="SportsVilla" width={200} height={50} unoptimized className="h-12 w-auto object-contain mx-auto" />
          </h1>
          <p className="text-gray-400 text-sm">
            {magicVerified 
              ? "Download the app to log in" 
              : "Sign in to admin dashboard"}
          </p>
        </div>

        {magicVerified ? (
          <div className="space-y-6 text-center">
            <div className="bg-[#1e2333] p-4 rounded-xl border border-[#2a2d3e]">
              <p className="text-white text-sm mb-2">
                We tried to open the SportsVilla app, but it seems you don't have it installed yet.
              </p>
              <p className="text-orange-400 text-xs font-semibold">
                Please download the app to continue your login.
              </p>
            </div>
            
            <div className="flex flex-col gap-3">
              <a 
                href="/android/download" 
                className="w-full bg-[#16a34a] hover:bg-[#15803d] text-white rounded-lg px-5 py-3.5 text-sm font-semibold transition-colors flex justify-center items-center"
              >
                Download for Android
              </a>
              <a 
                href="/ios/download" 
                className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-lg px-5 py-3.5 text-sm font-semibold transition-colors flex justify-center items-center"
              >
                Download for iOS
              </a>
            </div>
            
            <button
              onClick={() => router.push("/login")}
              className="mt-6 text-xs text-gray-500 hover:text-white transition-colors"
            >
              I'm an admin
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-sm transition-all"
                placeholder="admin@sportsvilla.com"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-sm transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-5 py-3.5 text-sm font-semibold transition-colors cursor-pointer border-none mt-4 flex justify-center items-center"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
