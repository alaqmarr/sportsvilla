"use client";

import { useState, useRef, useEffect } from "react";
import { lookupTicket, confirmTicketCheckin } from "@/app/checkin/actions";
import { useAlert } from "@/components/AlertProvider";
import { FiCheckCircle, FiXCircle, FiSearch, FiCamera, FiX } from "react-icons/fi";
import { formatIST } from "@/lib/dateUtils";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function CheckinScanner({ sports }: { sports: any[] }) {
  const { showAlert } = useAlert();
  const [selectedSportId, setSelectedSportId] = useState<string>(sports.length > 0 ? sports[0].id : "");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [scannedData, setScannedData] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);

  function startScanner() {
    setShowScanner(true);
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: {width: 250, height: 250} },
        false
      );
      scanner.render(
        (decodedText) => {
          scanner.clear();
          handleScan(decodedText);
        },
        (err) => {}
      );
    }, 100);
  }

  function closeScanner() {
    setShowScanner(false);
  }

  const playSound = (type: 'beep' | 'success' | 'error') => {
    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = context.createOscillator();
      const gainNode = context.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(context.destination);
      
      if (type === 'beep') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1000, context.currentTime);
        gainNode.gain.setValueAtTime(0.1, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1);
        osc.start(context.currentTime);
        osc.stop(context.currentTime + 0.1);
      } else if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, context.currentTime); // A5
        osc.frequency.setValueAtTime(1108.73, context.currentTime + 0.1); // C#6
        osc.frequency.setValueAtTime(1318.51, context.currentTime + 0.2); // E6
        
        gainNode.gain.setValueAtTime(0, context.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.2, context.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.4);
        osc.start(context.currentTime);
        osc.stop(context.currentTime + 0.4);
      } else if (type === 'error') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, context.currentTime);
        osc.frequency.linearRampToValueAtTime(150, context.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0, context.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.2, context.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);
        osc.start(context.currentTime);
        osc.stop(context.currentTime + 0.3);
      }
    } catch (e) {
      // Audio context might be blocked if no user interaction yet
    }
  };

  // Removed autoFocus useEffect to prevent mobile keyboard from popping up by default

  async function performSearch(searchQuery: string) {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const results = await lookupTicket(searchQuery.trim());
      if (results.length === 0) {
        playSound('error');
        showAlert("Not Found", "No valid tickets found for this query.", "error");
      } else {
        playSound('beep');
        setScannedData(results);
        setShowModal(true);
      }
    } catch (err: any) {
      playSound('error');
      showAlert("Error", err.message, "error");
    } finally {
      setLoading(false);
      setQuery("");
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    await performSearch(query);
  }

  function handleScan(codeData: string) {
    setShowScanner(false);
    playSound('beep');
    try {
       const json = JSON.parse(codeData);
       // Fetch real-time status from DB instead of relying solely on encoded data
       performSearch(json.id);
    } catch(e) {
       // Legacy ticket ID
       performSearch(codeData);
    }
  }

  async function handleCheckin(ticketId: string) {
    try {
      const res = await confirmTicketCheckin(ticketId, selectedSportId);
      
      if (res && res.error) {
        playSound('error');
        showAlert("Check-in Failed", res.error, "error");
        return;
      }

      playSound('success');
      showAlert("Checked In", "Ticket successfully verified!", "success");
      
      const updatedData = scannedData.filter((t: any) => t.id !== ticketId);
      if (updatedData.length === 0) {
        setShowModal(false);
        setScannedData(null);
      } else {
        setScannedData(updatedData);
      }
      
    } catch (err: any) {
      playSound('error');
      showAlert("Check-in Failed", err.message, "error");
    }
  }

  return (
    <div className="bg-[#0f1117] border border-[#2a2d3e] rounded-xl p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold font-['Outfit'] text-white flex items-center gap-2">
          <FiCamera className="text-emerald-500" /> Fast Check-in
        </h2>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-sm text-gray-400 whitespace-nowrap">Gate for:</label>
          <select
            value={selectedSportId}
            onChange={(e) => setSelectedSportId(e.target.value)}
            className="bg-[#1c1f2e] border border-[#2a2d3e] text-white rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500 w-full md:w-48 cursor-pointer"
          >
            {sports.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      <form onSubmit={handleSearch} className="mb-6 relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (query.trim()) performSearch(query);
                }
              }}
              placeholder="Scan QR or Enter Mobile Number (Press Enter)"
              className="w-full bg-[#1c1f2e] border border-[#2a2d3e] text-white rounded-xl pl-11 pr-4 py-4 focus:outline-none focus:border-emerald-500 text-lg shadow-inner"
            />
          </div>
          <button 
            type="button" 
            onClick={startScanner}
            className="bg-[#1c1f2e] border border-[#2a2d3e] text-white px-4 rounded-xl hover:border-emerald-500 hover:text-emerald-500 transition-colors cursor-pointer"
            title="Scan QR Code"
          >
            <FiCamera size={24} className={showScanner ? 'text-emerald-500' : ''} />
          </button>
        </div>
        
        {showScanner && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100]">
            <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-8 w-full max-w-md shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold font-['Outfit'] text-white">Scan QR Code</h2>
                <button type="button" className="text-gray-400 hover:text-white bg-[#1c1f2e] hover:bg-[#2a2d3e] rounded-lg p-2 transition-colors cursor-pointer border-none" onClick={closeScanner}><FiX /></button>
              </div>
              <div id="reader" className="w-full bg-black rounded-xl overflow-hidden border border-[#2a2d3e] html5-qrcode-custom"></div>
              <p className="text-center text-gray-500 mt-6 text-sm">Point camera at the ticket's Digital QR</p>
            </div>
          </div>
        )}
      </form>

      {/* Check-in Modal */}
      {showModal && scannedData && scannedData.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#161923] border border-[#2a2d3e] rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-[#2a2d3e]">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FiCheckCircle className="text-emerald-500" /> Ticket Details
              </h2>
              <button onClick={() => { setShowModal(false); setScannedData(null); }} className="text-gray-400 hover:text-white transition-colors cursor-pointer p-1">
                <FiX size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-4">
              {scannedData.map((ticket: any) => (
                <div key={ticket.id} className="bg-[#1c1f2e] border border-emerald-500/30 rounded-xl p-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full -mr-4 -mt-4"></div>
                  
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-emerald-400 font-bold uppercase tracking-wider text-xs mb-1">
                        {ticket.booking.sport.name} • {ticket.booking.turf.name}
                      </p>
                      <h3 className="text-white font-bold text-2xl mb-1">
                        {ticket.guestName || ticket.booking.member.name}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        Phone: {ticket.booking.member.mobile}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-[#0f1117] rounded-lg p-3 mb-5 border border-[#2a2d3e]">
                    <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Scheduled For</div>
                    <div className="text-white font-medium flex items-center gap-2 flex-wrap">
                      {formatIST(new Date(ticket.booking.startTime), 'MMM d, yyyy h:mm a')}
                      {ticket.booking?.turf?.bookingValidityDays > 0 && (
                        <span className="text-[10px] bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded uppercase font-bold tracking-wider">Multi-day Valid</span>
                      )}
                    </div>
                  </div>
                  
                  {ticket.status === "CHECKED_IN" ? (
                    <div className="w-full bg-red-500/10 border border-red-500/30 text-red-400 py-3.5 rounded-lg font-bold flex items-center justify-center gap-2 cursor-not-allowed">
                      <FiXCircle size={20} /> Already Checked In {ticket.usedAt && `(${formatIST(new Date(ticket.usedAt), 'h:mm a')})`}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleCheckin(ticket.id)}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-500/20 cursor-pointer"
                    >
                      <FiCheckCircle size={20} /> Verify & Confirm Entry
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
