'use client';

import React, { useState } from 'react';
import { Tag, Wallet, ChevronRight } from 'lucide-react';

interface ReviewPanelProps {
  selectedSlots: string[];
  selectedTurf: string;
  price: number;
  walletBalance: number;
  pointsBalance: number;
  onApplyCoupon: (code: string) => void;
  onRedeemPoints: () => void;
  onConfirm: () => void;
}

export const ReviewPanel: React.FC<ReviewPanelProps> = ({
  selectedSlots,
  selectedTurf,
  price,
  walletBalance,
  pointsBalance,
  onApplyCoupon,
  onRedeemPoints,
  onConfirm
}) => {
  const [promoCode, setPromoCode] = useState('');
  const [useWallet, setUseWallet] = useState(false);
  
  // For demonstration, let's say we have a fixed discount or it's passed as a prop
  const discount = 0; // Normally calculated based on applied coupon
  const subtotal = price * selectedSlots.length;
  
  const walletDeduction = useWallet ? Math.min(walletBalance, subtotal - discount) : 0;
  const finalPayable = Math.max(0, subtotal - discount - walletDeduction);

  if (selectedSlots.length === 0) {
    return null;
  }

  return (
    <div className="bg-[var(--play-surface)] border border-[var(--play-border)] rounded-[var(--play-radius-lg)] p-5 sticky top-24 shadow-sm">
      <h3 className="text-lg font-bold text-[var(--play-text)] mb-4">Review Booking</h3>
      
      <div className="mb-4">
        <div className="text-sm text-[var(--play-text-muted)] mb-1">Turf</div>
        <div className="font-medium text-[var(--play-text)]">{selectedTurf || 'Select a turf'}</div>
      </div>
      
      <div className="mb-6">
        <div className="text-sm text-[var(--play-text-muted)] mb-2">Selected Slots ({selectedSlots.length})</div>
        <div className="flex flex-wrap gap-2">
          {selectedSlots.map(slot => (
            <span key={slot} className="bg-[var(--play-surface-alt)] border border-[var(--play-border)] px-2.5 py-1 rounded text-xs font-medium text-[var(--play-text)]">
              {slot}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-4 mb-6 pt-4 border-t border-[var(--play-border)]">
        {/* Promo Code */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--play-text-light)]" />
            <input 
              type="text" 
              placeholder="Promo code" 
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-[var(--play-border)] rounded-[var(--play-radius-sm)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--play-brand)]"
            />
          </div>
          <button 
            onClick={() => onApplyCoupon(promoCode)}
            disabled={!promoCode}
            className="px-4 py-2 bg-[var(--play-surface)] border border-[var(--play-border)] text-[var(--play-text)] rounded-[var(--play-radius-sm)] text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Apply
          </button>
        </div>

        {/* Wallet Toggle */}
        {walletBalance > 0 && (
          <label className="flex items-center justify-between p-3 border border-[var(--play-border)] rounded-[var(--play-radius-sm)] cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-full text-blue-600">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-medium text-[var(--play-text)]">Use Wallet Balance</div>
                <div className="text-xs text-[var(--play-text-muted)]">Available: ₹{walletBalance}</div>
              </div>
            </div>
            <div className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={useWallet}
                onChange={() => setUseWallet(!useWallet)}
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--play-brand)]"></div>
            </div>
          </label>
        )}
      </div>

      <div className="space-y-2.5 mb-6 pt-4 border-t border-[var(--play-border)] text-sm">
        <div className="flex justify-between text-[var(--play-text-muted)]">
          <span>Subtotal</span>
          <span className="font-medium text-[var(--play-text)]">₹{subtotal}</span>
        </div>
        
        {discount > 0 && (
          <div className="flex justify-between text-[var(--play-brand)]">
            <span>Discount</span>
            <span className="font-medium">-₹{discount}</span>
          </div>
        )}
        
        {walletDeduction > 0 && (
          <div className="flex justify-between text-blue-600">
            <span>Wallet</span>
            <span className="font-medium">-₹{walletDeduction}</span>
          </div>
        )}
        
        <div className="flex justify-between items-center pt-2 border-t border-[var(--play-border)] mt-2">
          <span className="font-bold text-[var(--play-text)]">Total Payable</span>
          <span className="text-xl font-bold text-[var(--play-text)]">₹{finalPayable}</span>
        </div>
      </div>

      <button 
        onClick={onConfirm}
        className="w-full bg-[var(--play-brand)] hover:bg-[var(--play-brand-dark)] text-white py-3.5 rounded-[var(--play-radius-md)] font-bold transition-colors flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20"
      >
        Confirm Booking
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};
