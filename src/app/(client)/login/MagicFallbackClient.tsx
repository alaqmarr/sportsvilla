"use client";

import Image from "next/image";

export default function MagicFallbackClient() {
  return (
    <div className="min-h-screen bg-[#0f1117] flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-[#161922] rounded-3xl p-8 border border-[#2a2d3e]">
        <div className="text-center mb-8">
          <h1 className="mb-4">
            <Image src="/long-logo.png" alt="SportsVilla" width={200} height={50} unoptimized className="h-12 w-auto object-contain mx-auto" />
          </h1>
          <p className="text-gray-400 text-sm">Download the app to log in</p>
        </div>

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
          
          <a
            href="/onelogin"
            className="mt-6 block text-xs text-gray-500 hover:text-white transition-colors"
          >
            I'm an admin
          </a>
        </div>
      </div>
    </div>
  );
}
