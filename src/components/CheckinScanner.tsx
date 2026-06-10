"use client";

import { useState, useRef, useEffect } from "react";
import { lookupTicket, confirmTicketCheckin } from "@/app/checkin/actions";
import { useAlert } from "@/components/AlertProvider";
import { FiCheckCircle, FiXCircle, FiSearch, FiCamera } from "react-icons/fi";
import { formatIST } from "@/lib/dateUtils";

export default function CheckinScanner({ sports }: { sports: any[] }) {
  const { showAlert } = useAlert();
  const [selectedSportId, setSelectedSportId] = useState<string>(sports.length > 0 ? sports[0].id : "");
  const [query, setQuery] = useState("");
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    let scanner: any = null;
    if (showScanner) {
      import('html5-qrcode').then(({ Html5QrcodeScanner }) => {
        setTimeout(() => {
          if (document.getElementById("qr-reader")) {
            scanner = new Html5QrcodeScanner(
              "qr-reader",
              { fps: 10, qrbox: { width: 250, height: 250 } },
              false
            );
            scannerRef.current = scanner;
            scanner.render(
              (decodedText: string) => {
                setQuery(decodedText);
                setShowScanner(false);
                performSearch(decodedText);
              },
              (error: any) => {
                // ignore
              }
            );
          }
        }, 100);
      });
    } else {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    }
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, [showScanner]);

  // Keep input focused for scanner
  useEffect(() => {
    inputRef.current?.focus();
  }, [tickets, selectedSportId]);

  async function performSearch(searchQuery: string) {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const results = await lookupTicket(query.trim());
      setTickets(results);
      if (results.length === 0) {
        showAlert("Not Found", "No valid tickets found for this query.", "error");
      }
    } catch (err: any) {
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

  async function handleCheckin(ticketId: string) {
    try {
      await confirmTicketCheckin(ticketId, selectedSportId);
      showAlert("Checked In", "Ticket successfully verified!", "success");
      setTickets(tickets.filter(t => t.id !== ticketId));
      inputRef.current?.focus();
    } catch (err: any) {
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
            className="bg-[#1c1f2e] border border-[#2a2d3e] text-white rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500 w-full md:w-48"
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
              onChange={(e) => {
                setQuery(e.target.value);
                // If it's exactly 10 digits (mobile) or starts with TKT (QR), we could auto-search,
                // but standard barcode scanners send an Enter key, which is caught below.
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (query.trim()) {
                    performSearch(query);
                  }
                }
              }}
              placeholder="Scan QR or Enter Mobile Number (Press Enter)"
              className="w-full bg-[#1c1f2e] border border-[#2a2d3e] text-white rounded-xl pl-11 pr-4 py-4 focus:outline-none focus:border-emerald-500 text-lg shadow-inner"
              autoFocus
            />
          </div>
          <button 
            type="button" 
            onClick={() => setShowScanner(!showScanner)}
            className="bg-[#1c1f2e] border border-[#2a2d3e] text-white px-4 rounded-xl hover:border-emerald-500 transition-colors"
            title="Scan with Camera"
          >
            <FiCamera size={24} className={showScanner ? 'text-emerald-500' : 'text-gray-400'} />
          </button>
        </div>
        
        {showScanner && (
          <div className="mt-4 p-4 bg-[#0f1117] rounded-xl border border-[#2a2d3e]">
            <div id="qr-reader" className="w-full max-w-md mx-auto overflow-hidden rounded-lg"></div>
            <button 
              type="button" 
              onClick={() => setShowScanner(false)}
              className="mt-4 w-full bg-red-500/10 text-red-500 hover:bg-red-500/20 py-2 rounded-lg font-medium transition-colors text-sm"
            >
              Close Camera
            </button>
          </div>
        )}
      </form>

      {tickets.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-gray-400 font-medium mb-3">Found Valid Tickets ({tickets.length})</h3>
          {tickets.map(ticket => (
            <div key={ticket.id} className="bg-[#1c1f2e] border border-[#2a2d3e] rounded-xl p-5 flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <p className="text-white font-bold text-lg">
                  {ticket.guestName || ticket.booking.member.name}
                  {ticket.guestName ? (
                    <span className="text-gray-400 text-sm font-normal ml-2">(Guest of {ticket.booking.member.name})</span>
                  ) : (
                    <span className="text-gray-400 text-sm font-normal ml-2">({ticket.booking.member.mobile})</span>
                  )}
                </p>
                <div className="flex gap-4 text-sm mt-1">
                  <span className="text-emerald-400">{ticket.booking.sport.name}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-300">{ticket.booking.turf.name}</span>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Slot: {formatIST(new Date(ticket.booking.startTime), 'MMM d, yyyy h:mm a')}
                  {ticket.booking.turf.bookingValidityDays > 0 && " (Multi-day Valid)"}
                </div>
              </div>
              <button
                onClick={() => handleCheckin(ticket.id)}
                className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <FiCheckCircle /> Confirm Entry
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
