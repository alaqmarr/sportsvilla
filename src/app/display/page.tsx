"use client";

import { useEffect, useState } from "react";
import { getDisplaySession } from "../bookings/actions";
import { FiCheckCircle } from "react-icons/fi";

export default function DisplayPage() {
  const [session, setSession] = useState<any>(null);
  const [showIdle, setShowIdle] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  // Polling logic
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const data = await getDisplaySession();
        setSession(data);
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 2000); // poll every 2 seconds

    return () => clearInterval(interval);
  }, []);

  // Time Logic
  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }) + " IST");
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }) + " IST");
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Idle Timer Logic
  useEffect(() => {
    if (session?.status === 'PAID') {
       const t = setTimeout(() => setShowIdle(true), 5000);
       return () => clearTimeout(t);
    } else if (session?.status === 'AWAITING_PAYMENT') {
       setShowIdle(false);
    }
  }, [session?.status]);

  if (!session || session.status === "IDLE" || showIdle) {
    return (
      <div className="min-h-screen bg-[#0f1117] relative flex flex-col items-center justify-center overflow-hidden">
        {/* Dynamic Background */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#161923] via-[#0f1117] to-[#161923] z-0"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 blur-[120px] rounded-full pointer-events-none z-0"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none z-0"></div>

        {/* Content */}
        <div className="z-10 text-center animate-in fade-in duration-1000 slide-in-from-bottom-10">
          <h2 className="text-4xl font-['Outfit'] font-light text-gray-400 mb-4 tracking-[0.2em] uppercase">Welcome to</h2>
          <h1 className="text-[140px] leading-none font-['Outfit'] font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600 mb-8 tracking-widest drop-shadow-2xl">
            SPORTSVILLA
          </h1>
          <div className="w-48 h-1 bg-gradient-to-r from-transparent via-gray-500 to-transparent mx-auto mb-16 opacity-50"></div>
          <div className="text-7xl font-['Outfit'] font-semibold text-white tracking-wider drop-shadow-lg opacity-90">
            {currentTime}
          </div>
        </div>
      </div>
    );
  }

  if (session.status === "PAID") {
    return (
      <div className="min-h-screen bg-emerald-500 flex flex-col items-center justify-center text-white p-8 text-center animate-in zoom-in duration-500">
        <FiCheckCircle className="text-9xl mb-8 opacity-90" />
        <h1 className="text-7xl font-black mb-4">Payment Successful!</h1>
        <p className="text-4xl opacity-90 font-medium">Thank you, {session.memberName || 'Member'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1117] text-white flex animate-in slide-in-from-bottom-8 duration-500">
      {/* Left side: Branding & Details */}
      <div className="flex-1 p-16 flex flex-col justify-center border-r border-[#2a2d3e] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-emerald-500/5 blur-[100px] pointer-events-none rounded-full"></div>
        
        <h2 className="text-3xl font-bold text-gray-400 uppercase tracking-widest mb-4">Total Amount Due</h2>
        <div className="text-8xl font-black text-emerald-400 mb-12">₹{session.amount}</div>
        
        <div className="text-3xl font-semibold text-white mb-2">{session.memberName || "Guest"}</div>
        <div className="text-xl text-gray-500">Scan the QR code to complete your booking.</div>
      </div>

      {/* Right side: QR Code */}
      <div className="w-1/2 bg-[#161923] flex flex-col items-center justify-center p-16 relative">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 blur-[100px] pointer-events-none rounded-full"></div>
        
        <div className="bg-white p-8 rounded-3xl shadow-[0_0_80px_rgba(16,185,129,0.3)] mb-8 relative z-10">
          {session.qrData ? (
            <img src={session.qrData} alt="UPI QR" className="w-[400px] h-[400px]" />
          ) : (
            <div className="w-[400px] h-[400px] flex items-center justify-center bg-gray-100 rounded-2xl text-gray-400">
              Generating QR...
            </div>
          )}
        </div>
        <p className="text-3xl font-bold tracking-widest text-emerald-500 uppercase relative z-10">Scan to Pay via UPI</p>
      </div>
    </div>
  );
}
