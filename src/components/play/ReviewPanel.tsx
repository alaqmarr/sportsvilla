'use client';

import React, { useState, useRef } from 'react';
import useSWR from 'swr';
import { Tag, Shield, FileText, CalendarDays, X, ChevronRight, Check, Coins, Loader2 } from 'lucide-react';

interface ReviewPanelProps {
  selectedSlots: string[];
  selectedTurf: string;
  price: number;
  walletBalance: number;
  pointsBalance: number;
  onApplyCoupon: (code: string) => void;
  onRedeemPoints: () => void;
  onConfirm: (promoCode: string, walletDeduction: number, pointsDeduction: number, walletOtp?: string) => void;
  onClose?: () => void;
  timeDisplayOverride?: string;
}

const fetcher = (url: string) => fetch(url).then(r => r.json());

export const ReviewPanel: React.FC<ReviewPanelProps> = ({
  selectedSlots,
  selectedTurf,
  price,
  walletBalance,
  pointsBalance,
  onApplyCoupon,
  onConfirm,
  onClose,
  timeDisplayOverride
}) => {
  const [useWallet, setUseWallet] = useState(false);
  const [selectedCouponCode, setSelectedCouponCode] = useState<string>('');
  const [isOffersOpen, setIsOffersOpen] = useState(false);

  // OTP State
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { data, isLoading } = useSWR('/api/client/v1/coupons', fetcher);
  const coupons = data?.coupons || [];

  const timeDisplay = timeDisplayOverride || (selectedSlots.length > 0 
    ? `${selectedSlots[0]} - ${selectedSlots[selectedSlots.length-1]}`
    : '--');

  if (selectedSlots.length === 0) {
    return null;
  }

  // Calculate Discount
  let discount = 0;
  const selectedCoupon = coupons.find((c: any) => c.code === selectedCouponCode);
  
  if (selectedCoupon) {
    if (selectedCoupon.discountPercentage) {
      discount = (price * selectedCoupon.discountPercentage) / 100;
      if (selectedCoupon.maxDiscount && discount > selectedCoupon.maxDiscount) {
        discount = selectedCoupon.maxDiscount;
      }
    } else if (selectedCoupon.discountAmount) {
      discount = selectedCoupon.discountAmount;
    }
  }

  const priceAfterDiscount = Math.max(0, price - discount);

  // Calculate Points Deduction (Disabled per user request)
  let pointsDeduction = 0;
  const priceAfterPoints = priceAfterDiscount;

  // Calculate Wallet Deduction
  let walletDeduction = 0;
  if (useWallet && walletBalance > 0) {
    walletDeduction = Math.min(walletBalance, priceAfterPoints);
  }

  const finalAmount = Math.max(0, priceAfterPoints - walletDeduction);

  if (isOffersOpen) {
    return (
      <div className="flex flex-col h-[70vh] bg-transparent">
        <div className="flex items-center gap-3 p-4 border-b border-[var(--play-border)]">
          <button onClick={() => setIsOffersOpen(false)} className="p-2 -ml-2 text-[var(--play-text)] hover:bg-[var(--play-surface-alt)] rounded-full">
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold font-outfit">Select Offer</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Enter coupon code" 
              className="flex-1 bg-[var(--play-bg)] border border-[var(--play-border)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--play-brand)] uppercase"
              value={selectedCouponCode}
              onChange={(e) => setSelectedCouponCode(e.target.value.toUpperCase())}
            />
            <button 
              type="button"
              onClick={() => setIsOffersOpen(false)}
              className="px-6 bg-[var(--play-brand)] text-white font-bold rounded-xl"
            >
              Apply
            </button>
          </div>
          
          {isLoading && <div className="text-center p-4 text-[var(--play-text-muted)] animate-pulse">Loading offers...</div>}
          
          {coupons.map((coupon: any) => (
            <div key={coupon.code} onClick={() => { setSelectedCouponCode(coupon.code); setIsOffersOpen(false); }} className={`border ${selectedCouponCode === coupon.code ? 'border-[var(--play-brand)] bg-[var(--play-brand)]/5' : 'border-[var(--play-border)] bg-[var(--play-surface)]'} rounded-xl p-4 cursor-pointer hover:border-[var(--play-brand)] transition-colors`}>
              <div className="flex justify-between items-start mb-2">
                <div className="inline-block px-3 py-1 bg-[var(--play-surface-alt)] border border-[var(--play-border)] border-dashed rounded-md font-mono font-bold text-sm">
                  {coupon.code}
                </div>
                {selectedCouponCode === coupon.code && <Check className="w-5 h-5 text-[var(--play-brand)]" />}
              </div>
              <p className="font-bold text-[var(--play-text)]">
                {coupon.discountPercentage ? `${coupon.discountPercentage}% OFF` : `₹${coupon.discountAmount} OFF`}
              </p>
              {coupon.maxDiscount && <p className="text-xs text-[var(--play-text-muted)] mt-1">Up to ₹{coupon.maxDiscount}</p>}
            </div>
          ))}
          {coupons.length === 0 && !isLoading && (
            <p className="text-center text-[var(--play-text-muted)] p-4">No offers available right now.</p>
          )}
        </div>
      </div>
    );
  }

  const handleSendOtp = async () => {
    setIsSendingOtp(true);
    try {
      const res = await fetch('/api/client/v1/wallet/send-otp', {
        method: 'POST'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
      setIsOtpMode(true);
    } catch (err: any) {
      alert(err.message || 'Failed to send OTP');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleProceedClick = () => {
    if (walletDeduction > 0) {
      handleSendOtp();
    } else {
      onConfirm(selectedCouponCode, walletDeduction, pointsDeduction);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  if (isOtpMode) {
    return (
      <div className="flex flex-col h-[70vh] bg-transparent">
        <div className="flex items-center gap-3 p-4 border-b border-[var(--play-border)]">
          <button onClick={() => setIsOtpMode(false)} className="p-2 -ml-2 text-[var(--play-text)] hover:bg-[var(--play-surface-alt)] rounded-full">
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold font-outfit">Security Verification</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-8 space-y-6 flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-[var(--play-brand-light)] rounded-full flex items-center justify-center mb-2">
            <Shield className="w-8 h-8 text-[var(--play-brand-dark)]" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-[var(--play-text)] mb-2">Verify Wallet Transaction</h3>
            <p className="text-[var(--play-text-muted)] text-sm mb-6 max-w-[280px]">
              We've sent a 6-digit verification code to your registered WhatsApp number to authorize this wallet deduction of ₹{walletDeduction.toFixed(2)}.
            </p>
          </div>
          
          <div className="flex justify-center gap-2 mb-4">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={el => { otpInputRefs.current[idx] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(idx, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                className="w-12 h-14 text-center text-2xl font-bold bg-[var(--play-bg)] border border-[var(--play-border)] rounded-xl focus:outline-none focus:border-[var(--play-brand)] focus:ring-2 focus:ring-[var(--play-brand)]/20 transition-all text-[var(--play-text)]"
              />
            ))}
          </div>
          
          <div className="flex justify-center w-full">
             <button 
                type="button"
                onClick={() => onConfirm(selectedCouponCode, walletDeduction, pointsDeduction, otp.join(''))}
                disabled={otp.join('').length < 6}
                className="w-full max-w-[280px] bg-[var(--play-brand)] hover:bg-[var(--play-brand-dark)] text-white py-4 rounded-xl font-bold text-base transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                {finalAmount === 0 ? 'Verify & Confirm' : `Verify & Pay ₹${finalAmount.toFixed(2)}`}
             </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0 bg-transparent">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-8">
        {/* Slot Info Card */}
        <div className="bg-[var(--play-surface)] rounded-2xl p-5 shadow-sm border border-[var(--play-border)] relative">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-lg font-bold font-outfit text-[var(--play-text)] pr-8">{selectedTurf}</h2>
            {onClose && (
              <button onClick={onClose} className="p-1.5 rounded-full bg-[var(--play-surface-alt)] text-[var(--play-text-muted)] hover:text-[var(--play-text)]">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 text-[var(--play-text-muted)] text-sm font-medium">
            <CalendarDays className="w-4 h-4" />
            {timeDisplay}
          </div>
        </div>

        {/* Apply Coupon Card */}
        <div 
          onClick={() => setIsOffersOpen(true)}
          className="bg-[var(--play-surface)] rounded-2xl p-5 shadow-sm border border-[var(--play-border)] flex items-center justify-between cursor-pointer hover:bg-[var(--play-surface-alt)] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedCoupon ? 'bg-[var(--play-brand-light)] text-[var(--play-brand-dark)]' : 'bg-[var(--play-surface-alt)] text-[var(--play-text-muted)]'}`}>
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-[var(--play-text)] block">
                {selectedCoupon ? `'${selectedCoupon.code}' Applied` : 'View Offers'}
              </span>
              {selectedCoupon ? (
                <span className="text-sm font-medium text-emerald-500">You saved ₹{discount.toFixed(2)}</span>
              ) : (
                <span className="text-sm text-[var(--play-text-muted)]">{coupons.length} offers available</span>
              )}
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[var(--play-text-light)]" />
        </div>

        {/* Wallet Usage Card */}
        {walletBalance > 0 && (
          <div className="bg-[var(--play-surface)] rounded-2xl p-5 shadow-sm border border-[var(--play-border)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--play-brand-light)] text-[var(--play-brand-dark)] flex items-center justify-center">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-[var(--play-text)] block">Use Wallet Balance</span>
                <span className="text-sm text-[var(--play-text-muted)]">Available: ₹{walletBalance.toFixed(2)}</span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={useWallet} onChange={(e) => setUseWallet(e.target.checked)} />
              <div className="w-11 h-6 bg-[var(--play-border)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--play-brand)]"></div>
            </label>
          </div>
        )}

        {/* Price Breakdown */}
        <div className="bg-[var(--play-surface)] rounded-2xl p-5 shadow-sm border border-[var(--play-border)] space-y-3">
          <h3 className="font-bold text-[var(--play-text)] mb-4 border-b border-[var(--play-border)] pb-2">Payment Summary</h3>
          
          <div className="flex justify-between text-sm">
            <span className="text-[var(--play-text-muted)]">Subtotal</span>
            <span className="font-medium">₹ {price.toFixed(2)}</span>
          </div>
          
          {discount > 0 && (
            <div className="flex justify-between text-sm text-emerald-500 font-medium">
              <span>Offer Discount ({selectedCouponCode})</span>
              <span>- ₹ {discount.toFixed(2)}</span>
            </div>
          )}

          {walletDeduction > 0 && (
            <div className="flex justify-between text-sm text-[var(--play-brand)] font-medium">
              <span>Wallet Utilized</span>
              <span>- ₹ {walletDeduction.toFixed(2)}</span>
            </div>
          )}
          
          <div className="pt-3 border-t border-[var(--play-border)] flex justify-between items-center">
            <span className="font-bold text-[var(--play-text)]">Total Amount</span>
            <span className="font-bold text-xl text-[var(--play-text)]">₹ {finalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Policies */}
        <div className="space-y-3">
          <div className="bg-[var(--play-surface)] rounded-2xl p-4 shadow-sm border border-[var(--play-border)] flex gap-3">
            <Shield className="w-5 h-5 text-[var(--play-text-muted)] shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-sm text-[var(--play-text)] mb-1">Reschedule Policy</h3>
              <p className="text-xs text-[var(--play-text-muted)] leading-relaxed">
                Rescheduling is allowed 4.0 Hours prior to slot time. Rescheduling of a booking can be done only 1 time.
              </p>
            </div>
          </div>
          <div className="bg-[var(--play-surface)] rounded-2xl p-4 shadow-sm border border-[var(--play-border)] flex gap-3">
            <FileText className="w-5 h-5 text-[var(--play-text-muted)] shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-sm text-[var(--play-text)] mb-1">Cancellation Policy</h3>
              <p className="text-xs text-[var(--play-text-muted)] leading-relaxed">
                Cancellations are allowed 4.0 Hours prior to slot time for a full refund. Otherwise, non-refundable.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action */}
      <div className="bg-[var(--play-surface)] border-t border-[var(--play-border)] p-4 pb-4 sm:pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] mt-auto shrink-0">
        <div className="w-full flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-[var(--play-text-muted)] font-medium mb-0.5">Total Payable</p>
            <p className="text-2xl font-bold font-outfit text-[var(--play-text)]">₹{finalAmount.toFixed(2)}</p>
          </div>
          <button 
            type="button"
            onClick={handleProceedClick}
            disabled={isSendingOtp}
            className="flex-1 shrink-0 whitespace-nowrap bg-[var(--play-brand)] hover:bg-[var(--play-brand-dark)] text-white py-4 px-6 rounded-xl font-bold text-base transition-colors shadow-sm flex items-center justify-center disabled:opacity-70"
          >
            {isSendingOtp ? <Loader2 className="w-5 h-5 animate-spin" /> : (finalAmount === 0 ? 'Confirm Booking' : 'Proceed to Pay')}
          </button>
        </div>
      </div>
    </div>
  );
};
