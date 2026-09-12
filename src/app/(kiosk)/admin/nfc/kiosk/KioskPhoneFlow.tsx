"use client";

import React, { useState, useEffect } from "react";
import { findMembersByMobile } from "./actions";
import { FiDelete, FiUser, FiArrowLeft, FiCheck } from "react-icons/fi";
import { useAlert } from "@/components/AlertProvider";

export default function KioskPhoneFlow({
  onSuccess,
  onCancel,
}: {
  onSuccess: (member: any) => void;
  onCancel: () => void;
}) {
  const [mobile, setMobile] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const { showAlert } = useAlert();

  const handleNumpadClick = (num: string) => {
    if (mobile.length < 10) {
      setMobile((prev) => prev + num);
    }
  };

  const handleDelete = () => {
    setMobile((prev) => prev.slice(0, -1));
  };

  useEffect(() => {
    if (mobile.length === 10) {
      handleSearch();
    }
  }, [mobile]);

  const handleSearch = async () => {
    if (mobile.length < 10) {
      showAlert("Invalid", "Please enter a 10-digit mobile number.", "error");
      return;
    }
    setIsLoading(true);
    try {
      const results = await findMembersByMobile(mobile);
      let allMembers: any[] = [];
      results.forEach((r: any) => {
        allMembers.push({ ...r, walletBalanceRupees: r.walletBalance / 100 });
        if (r.family && r.family.members) {
          r.family.members.forEach((fm: any) => {
            if (fm.id !== r.id) {
              allMembers.push({ ...fm, walletBalanceRupees: fm.walletBalance / 100 });
            }
          });
        }
      });
      // deduplicate
      const uniqueMembers = Array.from(new Map(allMembers.map(m => [m.id, m])).values());
      
      setMembers(uniqueMembers);
      
      if (uniqueMembers.length === 0) {
        showAlert("Not Found", "No account found with this number. Please register at the front desk.", "error");
        setTimeout(() => {
          setMobile("");
          setMembers([]);
        }, 3000);
      } else if (uniqueMembers.length === 1) {
        onSuccess(uniqueMembers[0]);
      }
    } catch (err: any) {
      showAlert("Error", "Failed to search members", "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (members.length > 1) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8 animate-in fade-in zoom-in duration-300 w-full h-full">
        <div className="w-full max-w-2xl bg-[#1c1f2e] border border-[#34384e] rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-amber-500" />
          
          <button onClick={() => setMembers([])} className="mb-6 flex items-center text-slate-400 hover:text-white transition">
            <FiArrowLeft className="mr-2" /> Back to Phone
          </button>
          
          <h2 className="text-3xl font-black text-white mb-2">Select Member</h2>
          <p className="text-slate-400 mb-8">Multiple profiles found under this number. Who is booking?</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {members.map((m) => (
              <button
                key={m.id}
                onClick={() => onSuccess(m)}
                className="flex items-center p-4 bg-[#161824] border border-[#34384e] rounded-xl hover:border-orange-500 transition text-left group"
              >
                <div className="w-12 h-12 rounded-full bg-orange-500/10 text-orange-400 flex items-center justify-center mr-4 group-hover:bg-orange-500 group-hover:text-white transition">
                  <FiUser className="text-xl" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">{m.name}</h3>
                  <p className="text-sm text-slate-400 font-mono">ID: {m.id.substring(m.id.length - 6).toUpperCase()}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8 animate-in fade-in zoom-in duration-300 w-full h-full">
      <div className="w-full max-w-md bg-[#1c1f2e] border border-[#34384e] rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-amber-500" />
        
        <button onClick={onCancel} className="mb-6 flex items-center text-slate-400 hover:text-white transition">
          <FiArrowLeft className="mr-2" /> Back
        </button>
        
        <h2 className="text-3xl font-black text-white mb-2 text-center">Phone Booking</h2>
        <p className="text-slate-400 mb-8 text-center">Enter your registered mobile number</p>
        
        <div className="mb-8">
          <div className="bg-[#0f111a] border border-[#34384e] rounded-2xl p-4 text-center">
            <span className="text-4xl font-mono font-bold tracking-widest text-white">
              {mobile || <span className="text-slate-600">__________</span>}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumpadClick(num.toString())}
              className="py-4 text-2xl font-bold text-white bg-[#161824] hover:bg-white/10 rounded-xl transition active:scale-95"
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => setMobile("")}
            className="py-4 text-sm font-bold text-slate-400 bg-[#161824] hover:bg-white/10 rounded-xl transition active:scale-95 uppercase"
          >
            Clear
          </button>
          <button
            onClick={() => handleNumpadClick("0")}
            className="py-4 text-2xl font-bold text-white bg-[#161824] hover:bg-white/10 rounded-xl transition active:scale-95"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="py-4 flex justify-center items-center text-2xl text-slate-400 bg-[#161824] hover:bg-white/10 rounded-xl transition active:scale-95"
          >
            <FiDelete />
          </button>
        </div>
        
        <button
          onClick={handleSearch}
          disabled={mobile.length < 10 || isLoading}
          className="w-full py-4 rounded-xl font-bold text-lg transition-all flex justify-center items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(249,115,22,0.4)] disabled:opacity-50 disabled:pointer-events-none text-white"
        >
          {isLoading ? "Searching..." : <><FiCheck /> Verify</>}
        </button>
      </div>
    </div>
  );
}
