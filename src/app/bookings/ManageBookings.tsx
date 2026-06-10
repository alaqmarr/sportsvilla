"use client";
import React, { useState, useEffect, useMemo } from "react";
import { fetchAllBookingsByDate, cancelBooking, updateBookingPayment, previewExtension, confirmExtension, getUpiId, addPayment, updateDisplaySession } from "./actions";
import { useAlert } from "@/components/AlertProvider";
import QRCodeLib from "qrcode";
import { formatIST } from "../../lib/dateUtils";
import { FiXCircle, FiCheckCircle, FiClock, FiCreditCard, FiTrash2, FiMaximize2, FiUser, FiMapPin, FiX, FiCheck, FiMonitor, FiPrinter } from "react-icons/fi";

export default function ManageBookings() {
  const { showAlert } = useAlert();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [upiSettings, setUpiSettings] = useState({ upiId: "", businessName: "" });
  const [payModal, setPayModal] = useState<{ show: boolean, booking: any | null, qrData: string }>({ show: false, booking: null, qrData: "" });
  const [cashAmount, setCashAmount] = useState<number | "">(0);
  const [onlineAmount, setOnlineAmount] = useState<number | "">(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Extension Modal State
  const [extModal, setExtModal] = useState<{
    show: boolean;
    bookingId: string;
    duration: number;
    preview: any;
    loading: boolean;
    confirming: boolean;
  }>({ show: false, bookingId: "", duration: 30, preview: null, loading: false, confirming: false });

  useEffect(() => {
    getUpiId().then(setUpiSettings);
  }, []);

  useEffect(() => {
    loadBookings();
  }, [date]);

  async function loadBookings() {
    setLoading(true);
    try {
      const data = await fetchAllBookingsByDate(date);
      setBookings(data);
    } catch (e) {
      showAlert("Error", "Failed to load bookings", "error");
    }
    setLoading(false);
  }

  async function handleCancel(id: string) {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await cancelBooking(id);
      showAlert("Cancelled", "Booking has been cancelled.", "success");
      loadBookings();
    } catch (e: any) {
      showAlert("Error", e.message || "Failed to cancel booking", "error");
    }
  }

  async function handleTogglePayment(id: string, currentStatus: string) {
    if (currentStatus === "PAID") {
      showAlert("Notice", "A fully paid booking cannot be marked as unpaid.", "error");
      return;
    }
    const b = bookings.find(b => b.id === id);
    if (b) openPayModal(b);
  }

  async function openExtensionModal(id: string) {
    setExtModal({ show: true, bookingId: id, duration: 30, preview: null, loading: true, confirming: false });
    try {
      const res = await previewExtension(id, 30);
      setExtModal(prev => ({ ...prev, preview: res, loading: false }));
    } catch (e: any) {
      showAlert("Error", e.message, "error");
      setExtModal(prev => ({ ...prev, show: false }));
    }
  }

  async function handleDurationChange(mins: number) {
    setExtModal(prev => ({ ...prev, duration: mins, loading: true }));
    try {
      const res = await previewExtension(extModal.bookingId, mins);
      setExtModal(prev => ({ ...prev, preview: res, loading: false }));
    } catch (e: any) {
      showAlert("Error", e.message, "error");
      setExtModal(prev => ({ ...prev, loading: false }));
    }
  }

  async function confirmExtensionAction() {
    if (!extModal.preview || !extModal.preview.available) return;
    setExtModal(prev => ({ ...prev, confirming: true }));
    try {
      await confirmExtension(extModal.bookingId, extModal.preview.allocations);
      showAlert("Success", "Booking extended successfully.", "success");
      setExtModal({ show: false, bookingId: "", duration: 30, preview: null, loading: false, confirming: false });
      loadBookings();
    } catch (e: any) {
      showAlert("Error", e.message, "error");
      setExtModal(prev => ({ ...prev, confirming: false }));
    }
  }

  async function openPayModal(booking: any) {
    setCashAmount(0);
    setOnlineAmount(0);
    let qrUrl = "";
    
    const totalPaid = booking.payments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0;
    const balance = Math.max(0, booking.price - totalPaid);

    if (upiSettings.upiId && balance > 0) {
      const transactionNote = `Booking: ${booking.turf?.name}`;
      const upiUrl = `upi://pay?pa=${upiSettings.upiId}&pn=${encodeURIComponent(upiSettings.businessName)}&am=${balance}&tn=${encodeURIComponent(transactionNote)}&cu=INR`;
      qrUrl = await QRCodeLib.toDataURL(upiUrl, { width: 300, margin: 1 });
    }
    setPayModal({ show: true, booking, qrData: qrUrl });
  }

  function closePayModal() {
    updateDisplaySession({ status: "IDLE" }).catch(() => {});
    setPayModal({ show: false, booking: null, qrData: "" });
  }

  useEffect(() => {
    if (!payModal.show || !payModal.booking || !upiSettings.upiId) return;

    const generateDynamicQR = async () => {
      const totalPaid = payModal.booking.payments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0;
      const initialBalance = Math.max(0, payModal.booking.price - totalPaid);
      
      const amountForQR = (Number(onlineAmount) || 0) > 0 
        ? (Number(onlineAmount) || 0) 
        : Math.max(0, initialBalance - (Number(cashAmount) || 0));

      if (amountForQR > 0) {
        const transactionNote = `Booking: ${payModal.booking.turf?.name}`;
        const upiUrl = `upi://pay?pa=${upiSettings.upiId}&pn=${encodeURIComponent(upiSettings.businessName)}&am=${amountForQR}&tn=${encodeURIComponent(transactionNote)}&cu=INR`;
        const qrUrl = await QRCodeLib.toDataURL(upiUrl, { width: 300, margin: 1 });
        setPayModal(prev => ({ ...prev, qrData: qrUrl }));
      } else {
        setPayModal(prev => ({ ...prev, qrData: "" }));
      }
    };

    generateDynamicQR();
  }, [cashAmount, onlineAmount, payModal.booking, payModal.show, upiSettings]);

  async function handleRecordPayment() {
    if (!payModal.booking) return;
    if ((Number(cashAmount) || 0) === 0 && (Number(onlineAmount) || 0) === 0) return showAlert("Error", "Please enter an amount.", "error");

    setIsProcessing(true);
    try {
      if ((Number(cashAmount) || 0) > 0) await addPayment(payModal.booking.id, Number(cashAmount), "CASH");
      if ((Number(onlineAmount) || 0) > 0) await addPayment(payModal.booking.id, Number(onlineAmount), "ONLINE");

      const totalPaid = payModal.booking.payments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0;
      const initialBalance = Math.max(0, payModal.booking.price - totalPaid);
      
      if ((Number(cashAmount) || 0) + (Number(onlineAmount) || 0) >= initialBalance) {
        await updateDisplaySession({
          status: "PAID",
          memberName: payModal.booking.member?.name || "Member"
        });
      } else {
        await updateDisplaySession({ status: "IDLE" });
      }

      showAlert("Success", "Payment recorded successfully.", "success");
      setPayModal({ show: false, booking: null, qrData: "" });
      loadBookings();
    } catch (e: any) {
      showAlert("Error", "Failed to record payment.", "error");
    }
    setIsProcessing(false);
  }

  async function handleCastToDisplay() {
    if (!payModal.booking) return;
    const totalPaid = payModal.booking.payments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0;
    const balance = Math.max(0, payModal.booking.price - totalPaid);
    
    await updateDisplaySession({
      status: "AWAITING_PAYMENT",
      amount: balance,
      memberName: payModal.booking.member?.name || "Member",
      qrData: payModal.qrData
    });
    showAlert("Cast to Screen", "Updated Customer Facing Display.", "success");
  }

  const groupedBookings = useMemo(() => {
    const groups: { [key: string]: any[] } = {
      'ONGOING': [],
      'UPCOMING': [],
      'COMPLETED': [],
      'CANCELLED': []
    };
    
    const now = new Date().getTime();
    
    [...bookings].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()).forEach(b => {
      const start = new Date(b.startTime).getTime();
      const end = new Date(b.endTime).getTime();
      
      if (b.status === 'CANCELLED') {
        groups['CANCELLED'].push(b);
      } else if (now > end) {
        groups['COMPLETED'].push(b);
      } else if (now >= start && now <= end) {
        groups['ONGOING'].push(b);
      } else {
        groups['UPCOMING'].push(b);
      }
    });
    
    return groups;
  }, [bookings]);

  function getDisplayStatus(b: any) {
    if (b.status === 'CANCELLED') return { text: 'CANCELLED', color: 'bg-red-500/10 text-red-400 border-red-500/20' };
    
    const now = new Date().getTime();
    const start = new Date(b.startTime).getTime();
    const end = new Date(b.endTime).getTime();

    if (now > end) return { text: 'COMPLETED', color: 'bg-gray-500/10 text-gray-500 border-gray-500/20' };
    if (now >= start && now <= end) return { text: 'ONGOING', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.15)]' };
    return { text: 'UPCOMING', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
  }

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-['Outfit'] text-white">Manage Bookings</h2>
          <p className="text-gray-500 text-sm mt-1">View and manage all bookings for a specific day.</p>
        </div>
        <input 
          type="date" 
          value={date}
          onChange={e => setDate(e.target.value)}
          className="bg-[#161923] border border-[#2a2d3e] rounded-lg px-4 py-2.5 text-white focus:border-emerald-500/50 focus:outline-none"
        />
      </div>

      <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1c1f2e] border-b border-[#2a2d3e]">
                <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-gray-500">Time & Court</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-gray-500">Member</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-gray-500">Status</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-gray-500">Payment</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2d3e]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                    <div className="flex justify-center mb-2">
                      <div className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
                    </div>
                    Loading bookings...
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">No bookings found for this date.</td>
                </tr>
              ) : (
                [
                  { title: "Ongoing Bookings", key: "ONGOING", color: "text-blue-400" },
                  { title: "Upcoming Bookings", key: "UPCOMING", color: "text-emerald-400" },
                  { title: "Completed Bookings", key: "COMPLETED", color: "text-gray-400" },
                  { title: "Cancelled Bookings", key: "CANCELLED", color: "text-red-400" }
                ].map(section => {
                  const sectionBookings = groupedBookings[section.key];
                  if (sectionBookings.length === 0) return null;
                  
                  return (
                    <React.Fragment key={section.key}>
                      <tr className="bg-[#13151d] border-y border-[#2a2d3e]">
                        <td colSpan={5} className="px-6 py-3 font-bold text-sm">
                          <span className={section.color}>{section.title}</span> 
                          <span className="ml-2 text-xs bg-[#2a2d3e] px-2 py-0.5 rounded-full text-gray-400">{sectionBookings.length}</span>
                        </td>
                      </tr>
                      {sectionBookings.map((b) => (
                        <tr key={b.id} className="hover:bg-[#1c1f2e] transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold text-white mb-1 flex items-center gap-2">
                              <FiClock className="text-gray-400" />
                              {new Date(b.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(b.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                            <div className="text-sm text-gray-400 flex items-center gap-1.5">
                              <FiMapPin className="text-emerald-400" /> {b.turf?.name} ({b.sport?.name})
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-white flex items-center gap-2">
                              <FiUser className="text-gray-400" /> {b.member?.name}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">{b.member?.mobile}</div>
                            {b.tickets && b.tickets.length > 0 && (
                              <div className="text-[10px] font-bold mt-2 px-2 py-1 rounded bg-[#1c1f2e] border border-[#2a2d3e] inline-block text-gray-300">
                                {b.tickets.filter((t:any) => t.status === "CHECKED_IN").length} / {b.tickets.length} CHECKED IN
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase border ${getDisplayStatus(b).color}`}>
                              {getDisplayStatus(b).text}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button 
                              onClick={() => b.paymentStatus !== 'PAID' && handleTogglePayment(b.id, b.paymentStatus)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors border ${
                                b.paymentStatus === 'PAID' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 cursor-default' :
                                b.paymentStatus === 'PARTIAL' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20 cursor-pointer' :
                                'bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/20 cursor-pointer'
                              }`}
                            >
                              {b.paymentStatus} (₹{Number((b.payments?.reduce((s:number,p:any)=>s+p.amount,0) || 0).toFixed(2))} / ₹{Number(b.price.toFixed(2))})
                            </button>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {b.status !== 'CANCELLED' && (
                                <>
                                  {(b.paymentStatus === 'UNPAID' || b.paymentStatus === 'PARTIAL') && (
                                    <button 
                                      onClick={() => openPayModal(b)}
                                      className="p-2 bg-[#0f1117] border border-[#2a2d3e] text-emerald-400 hover:border-emerald-500/50 rounded-lg transition-colors"
                                      title="Receive Payment"
                                    >
                                      <FiCreditCard size={16} />
                                    </button>
                                  )}
                                  <button 
                                    onClick={() => window.open(`/print/ticket/${b.id}`, '_blank')}
                                    className="p-2 bg-[#0f1117] border border-[#2a2d3e] text-purple-400 hover:border-purple-500/50 rounded-lg transition-colors"
                                    title="Print Ticket"
                                  >
                                    <FiPrinter size={16} />
                                  </button>
                                  <button 
                                    onClick={() => openExtensionModal(b.id)}
                                    className="p-2 bg-[#0f1117] border border-[#2a2d3e] text-blue-400 hover:border-blue-500/50 rounded-lg transition-colors"
                                    title="Extend Slot"
                                  >
                                    <FiMaximize2 size={16} />
                                  </button>
                                  <button 
                                    onClick={() => handleCancel(b.id)}
                                    className="p-2 bg-[#0f1117] border border-[#2a2d3e] text-red-400 hover:border-red-500/50 rounded-lg transition-colors"
                                    title="Cancel Booking"
                                  >
                                    <FiTrash2 size={16} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      {payModal.show && payModal.booking && (() => {
        const totalPaid = payModal.booking.payments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0;
        const balance = Math.max(0, payModal.booking.price - totalPaid);
        return (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="absolute inset-0" onClick={closePayModal} />
            <div className="bg-[#161923] border border-[#2a2d3e] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row my-8 relative z-10">
              <button 
                onClick={closePayModal}
                className="absolute top-4 right-4 text-gray-500 hover:text-white z-10"
              >
                <FiX size={24} />
              </button>
              
              <div className="flex-1 p-6 border-b md:border-b-0 md:border-r border-[#2a2d3e]">
                <h3 className="text-xl font-bold font-['Outfit'] text-white mb-2">Record Payment</h3>
                <p className="text-sm text-gray-400 mb-6">{payModal.booking.member?.name}</p>
                
                <div className="bg-[#0f1117] border border-[#2a2d3e] rounded-xl p-4 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400 font-medium text-sm">Total Booking Value</span>
                    <span className="text-white font-bold">₹{Number(payModal.booking.price.toFixed(2))}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-emerald-400 font-medium text-sm">Amount Paid</span>
                    <span className="text-emerald-400 font-bold">₹{Number(totalPaid.toFixed(2))}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-[#2a2d3e]">
                    <span className="text-orange-400 font-bold">Remaining Balance</span>
                    <span className="text-orange-400 font-bold text-xl">₹{Number(balance.toFixed(2))}</span>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Cash (₹)</label>
                      <input 
                        type="text" 
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="w-full bg-[#1c1f2e] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white focus:border-emerald-500/50 focus:outline-none"
                        value={cashAmount}
                        onChange={e => {
                          const valStr = e.target.value.replace(/\D/g, '');
                          if (valStr === '') {
                            setCashAmount('');
                            return;
                          }
                          const val = parseInt(valStr, 10);
                          setCashAmount(val);
                          if (val + (Number(onlineAmount) || 0) > balance) {
                            setOnlineAmount(Math.max(0, balance - val));
                          }
                        }}
                        placeholder="0"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Online (₹)</label>
                      <input 
                        type="text" 
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="w-full bg-[#1c1f2e] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white focus:border-emerald-500/50 focus:outline-none"
                        value={onlineAmount}
                        onChange={e => {
                          const valStr = e.target.value.replace(/\D/g, '');
                          if (valStr === '') {
                            setOnlineAmount('');
                            return;
                          }
                          const val = parseInt(valStr, 10);
                          setOnlineAmount(val);
                          if (val + (Number(cashAmount) || 0) > balance) {
                            setCashAmount(Math.max(0, balance - val));
                          }
                        }}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={handleCastToDisplay}
                    className="flex-1 bg-[#1c1f2e] border border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-400 rounded-lg py-3 font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    <FiMonitor /> Cast
                  </button>
                  <button 
                    onClick={handleRecordPayment}
                    disabled={isProcessing}
                    className="flex-[2] bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg py-3 font-bold transition-colors border-none disabled:opacity-50"
                  >
                    {isProcessing ? "Saving..." : "Record Payment"}
                  </button>
                </div>
              </div>

              {/* Right Side: QR Code */}
              <div className="flex-1 bg-[#0f1117] p-6 flex flex-col items-center justify-center text-center">
                {upiSettings.upiId && balance > 0 ? (
                  <>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Scan to Pay via UPI</p>
                    {payModal.qrData ? (
                      <div className="bg-white p-3 rounded-xl mb-4">
                        <img src={payModal.qrData} alt="UPI QR Code" className="w-48 h-48" />
                      </div>
                    ) : (
                      <div className="w-48 h-48 bg-gray-200 animate-pulse rounded-xl mb-4"></div>
                    )}
                    <p className="text-sm font-semibold text-gray-300">{upiSettings.businessName}</p>
                    <p className="text-xs text-gray-500">{upiSettings.upiId}</p>
                  </>
                ) : balance <= 0 ? (
                  <div className="text-emerald-500 flex flex-col items-center">
                    <FiCheckCircle size={64} className="mb-4" />
                    <p className="text-xl font-bold">Fully Paid</p>
                  </div>
                ) : (
                  <p className="text-sm text-orange-400">UPI not configured.</p>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Extension Modal */}
      {extModal.show && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 overflow-y-auto">
          <div className="bg-[#161923] border border-[#2a2d3e] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col my-8">
            <div className="p-6 border-b border-[#2a2d3e] flex justify-between items-center">
              <h2 className="text-xl font-bold font-['Outfit'] text-white">Extend Booking</h2>
              <button className="text-gray-500 hover:text-white" onClick={() => setExtModal(prev => ({ ...prev, show: false }))}><FiX size={24} /></button>
            </div>
            
            <div className="p-6">
              <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-3">Extension Duration</label>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[30, 60, 90, 120].map(mins => (
                  <button
                    key={mins}
                    onClick={() => handleDurationChange(mins)}
                    className={`py-2 rounded-lg font-bold text-sm border transition-colors ${extModal.duration === mins ? 'bg-blue-500/10 border-blue-500/50 text-blue-400' : 'bg-[#0f1117] border-[#2a2d3e] text-gray-400 hover:bg-[#1c1f2e]'}`}
                  >
                    {mins} mins
                  </button>
                ))}
              </div>

              {extModal.loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                </div>
              ) : extModal.preview ? (
                extModal.preview.available ? (
                  <div className="space-y-4 mb-6">
                    <div className="p-4 rounded-xl border bg-emerald-500/10 border-emerald-500/20">
                      <p className="text-sm font-semibold mb-1 text-white">Court Available</p>
                      <p className="text-xs text-emerald-400">
                        We found availability for your extension. Review the court breakdown below.
                      </p>
                    </div>

                    <div className="space-y-2">
                      {extModal.preview.allocations.map((alloc: any, idx: number) => (
                        <div key={idx} className="bg-[#0f1117] rounded-xl p-4 border border-[#2a2d3e]">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-white font-bold">{alloc.turfName}</span>
                            <span className="text-xs px-2 py-1 bg-[#1c1f2e] rounded text-gray-400 border border-[#2a2d3e]">
                              {alloc.isSameCourt ? 'Current' : 'Alternative'}
                            </span>
                          </div>
                          <div className="text-sm text-emerald-400 font-semibold mb-2">
                            {new Date(alloc.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(alloc.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                          <div className="text-xs text-gray-500">
                            Amount: ₹{Number(alloc.price.toFixed(2))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-[#2a2d3e]">
                      <span className="text-gray-400 text-sm">Total Additional Amount</span>
                      <span className="text-xl font-bold text-emerald-400">₹{Number(extModal.preview.totalPrice.toFixed(2))}</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
                    <p className="text-red-400 text-sm text-center font-semibold">{extModal.preview.message}</p>
                  </div>
                )
              ) : null}

              <button 
                onClick={confirmExtensionAction}
                disabled={extModal.loading || extModal.confirming || !extModal.preview?.available}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg py-3.5 font-bold text-lg transition-colors border-none cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {extModal.confirming ? "Confirming..." : <><FiCheck /> Confirm Extension</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
