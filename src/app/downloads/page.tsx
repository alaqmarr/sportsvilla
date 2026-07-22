import React from 'react';
import { FaApple, FaGooglePlay, FaDownload, FaStar, FaBolt, FaCalendarCheck } from 'react-icons/fa';
import Link from 'next/link';

export const metadata = {
  title: "Download Sportsvilla App",
  description: "Download the official Sportsvilla mobile app for iOS and Android.",
};

export default function DownloadsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <FaBolt className="text-white w-4 h-4" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Sportsvilla
            </span>
          </div>
          <Link href="/" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
            Back to Home
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
          
          {/* Left Text Section */}
          <div className="lg:col-span-6 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              Now Available
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900">
              Your Game, <br />
              <span className="text-blue-600">Your Rules.</span>
            </h1>
            
            <p className="text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0">
              Download the official Sportsvilla app today. Book turfs instantly, manage your memberships, track attendance, and compete on the leaderboard—all from your pocket.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              {/* Android Button */}
              <a 
                href="#android" 
                className="flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 text-white px-6 py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 group"
              >
                <FaGooglePlay className="w-8 h-8 group-hover:text-green-400 transition-colors" />
                <div className="text-left">
                  <div className="text-xs text-slate-300 uppercase tracking-wider font-semibold">GET IT ON</div>
                  <div className="text-lg font-bold leading-tight">Google Play</div>
                </div>
              </a>

              {/* iOS Button */}
              <a 
                href="#ios" 
                className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl transition-all shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 hover:-translate-y-1 group"
              >
                <FaApple className="w-8 h-8" />
                <div className="text-left">
                  <div className="text-xs text-blue-100 uppercase tracking-wider font-semibold">Download on the</div>
                  <div className="text-lg font-bold leading-tight">App Store</div>
                </div>
              </a>
            </div>

            {/* Social Proof */}
            <div className="pt-8 flex items-center justify-center lg:justify-start gap-4 text-sm text-slate-500 font-medium">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => <span key={i}><FaStar /></span>)}
              </div>
              <span>Trusted by 10,000+ athletes</span>
            </div>
          </div>

          {/* Right Image/Mockup Section */}
          <div className="lg:col-span-6 mt-16 lg:mt-0 relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-indigo-50 rounded-[3rem] transform rotate-3 scale-105 -z-10"></div>
            
            <div className="relative mx-auto w-full max-w-[320px] rounded-[2.5rem] bg-white p-2 shadow-2xl border-4 border-slate-900 overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-6 bg-slate-900 rounded-b-3xl w-40 mx-auto z-20"></div>
              
              <div className="bg-slate-50 h-[600px] w-full rounded-[2rem] overflow-hidden relative flex flex-col items-center justify-center p-6 text-center space-y-6">
                
                <div className="w-20 h-20 bg-blue-600 rounded-2xl shadow-lg flex items-center justify-center rotate-12">
                   <FaCalendarCheck className="text-white w-10 h-10" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-slate-900">Book Instantly</h3>
                  <p className="text-slate-500 text-sm">Find your favorite turf and lock in your slot with just a few taps.</p>
                </div>

                <div className="w-full bg-white rounded-xl p-4 shadow-sm border border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-24 bg-slate-200 rounded animate-pulse"></div>
                    <div className="h-4 w-12 bg-blue-100 rounded animate-pulse"></div>
                  </div>
                  <div className="h-10 w-full bg-blue-50 rounded-lg flex items-center px-3">
                    <div className="h-4 w-32 bg-blue-200 rounded animate-pulse"></div>
                  </div>
                </div>

                <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                   <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                   <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                </div>
              </div>
            </div>

            {/* Decorative blobs */}
            <div className="absolute top-1/4 -right-8 w-24 h-24 bg-indigo-500 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob"></div>
            <div className="absolute top-1/3 -left-8 w-24 h-24 bg-blue-500 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-1/2 w-24 h-24 bg-purple-500 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob animation-delay-4000"></div>
          </div>

        </div>
      </main>

      {/* Footer Features */}
      <footer className="bg-slate-900 text-slate-400 py-12 mt-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <FaDownload className="w-8 h-8 mx-auto text-blue-500 mb-4" />
                <h4 className="text-white font-bold mb-2">Fast Installation</h4>
                <p className="text-sm">Small app size with instant over-the-air updates.</p>
              </div>
              <div>
                <FaCalendarCheck className="w-8 h-8 mx-auto text-green-500 mb-4" />
                <h4 className="text-white font-bold mb-2">Real-Time Sync</h4>
                <p className="text-sm">Never double-book. Real-time availability tracking.</p>
              </div>
              <div>
                <FaStar className="w-8 h-8 mx-auto text-yellow-500 mb-4" />
                <h4 className="text-white font-bold mb-2">Member Rewards</h4>
                <p className="text-sm">Earn loyalty points and check your leaderboard rank.</p>
              </div>
           </div>
           <div className="mt-12 text-center text-sm">
             &copy; {new Date().getFullYear()} Sportsvilla. All rights reserved.
           </div>
        </div>
      </footer>
    </div>
  );
}
