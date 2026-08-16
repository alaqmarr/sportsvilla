'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

type Step = 'PHONE' | 'OTP' | 'REGISTER';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('PHONE');
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');

  // OTP Timer state
  const [timer, setTimer] = useState(60);
  
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'OTP' && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (mobile.length < 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/client/v1/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile }),
      });
      if (!res.ok) throw new Error('Failed to send OTP');
      
      toast.success('OTP sent successfully!');
      setStep('OTP');
      setTimer(60);
      setOtp(['', '', '', '', '', '']);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) {
      toast.error('Please enter the complete 6-digit OTP');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/client/v1/auth/web/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, code }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Invalid OTP');

      if (data.isNewUser) {
        setStep('REGISTER');
      } else {
        toast.success('Logged in successfully!');
        router.push('/play/dashboard'); // Ensure pushing to right location
        // Wait for page transition or redirect to complete so we don't flash content
        await new Promise(r => setTimeout(r, 2000));
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to verify OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/client/v1/auth/web/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, name, email, dob }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to register');
      }

      toast.success('Account created successfully!');
      router.push('/play/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[var(--play-border)] p-6 sm:p-8">
        
        {step === 'PHONE' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col items-center mb-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--play-brand)] text-white font-bold font-heading text-xl mb-4 shadow-sm">
                SV
              </div>
              <h2 className="text-2xl font-bold font-heading text-[var(--play-text)]">Welcome to Sportsvilla</h2>
              <p className="text-[var(--play-text-muted)] mt-2 text-center text-sm">
                Enter your mobile number to sign in or create an account
              </p>
            </div>

            <form onSubmit={handleSendOtp} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--play-text)]">Mobile Number</label>
                <div className="relative flex">
                  <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-[var(--play-border)] bg-[var(--play-surface-alt)] text-[var(--play-text-muted)] text-sm">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                    className="flex-1 w-full rounded-r-lg border border-[var(--play-border)] px-4 py-3 text-[var(--play-text)] outline-none focus:border-[var(--play-brand)] focus:ring-1 focus:ring-[var(--play-brand)] transition-all bg-white"
                    placeholder="Enter 10-digit number"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || mobile.length < 10}
                className="w-full flex items-center justify-center py-3 px-4 rounded-lg bg-[var(--play-brand)] text-white font-medium hover:bg-[var(--play-brand-dark)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--play-brand)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Send OTP'}
              </button>
            </form>
          </div>
        )}

        {step === 'OTP' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <button 
              onClick={() => setStep('PHONE')}
              className="text-[var(--play-text-muted)] hover:text-[var(--play-text)] flex items-center text-sm mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </button>
            
            <h2 className="text-2xl font-bold font-heading text-[var(--play-text)] mb-2">Enter Verification Code</h2>
            <p className="text-[var(--play-text-muted)] text-sm mb-8">
              We sent a 6-digit code to your WhatsApp at <span className="font-medium text-[var(--play-text)]">+91 {mobile}</span>
            </p>

            <form onSubmit={handleVerifyOtp} className="space-y-8">
              <div className="flex justify-between gap-2">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpInputRefs.current[idx] = el;
                    }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-12 h-14 text-center text-xl font-semibold rounded-lg border border-[var(--play-border)] bg-white outline-none focus:border-[var(--play-brand)] focus:ring-1 focus:ring-[var(--play-brand)] transition-all"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={isLoading || otp.join('').length < 6}
                className="w-full flex items-center justify-center py-3 px-4 rounded-lg bg-[var(--play-brand)] text-white font-medium hover:bg-[var(--play-brand-dark)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--play-brand)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Verify'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-[var(--play-text-muted)]">Didn't receive code? </span>
              {timer > 0 ? (
                <span className="text-[var(--play-text-muted)] font-medium">Resend in {timer}s</span>
              ) : (
                <button
                  onClick={() => handleSendOtp()}
                  disabled={isLoading}
                  className="text-[var(--play-brand)] font-medium hover:text-[var(--play-brand-dark)] transition-colors"
                >
                  Resend OTP
                </button>
              )}
            </div>
          </div>
        )}

        {step === 'REGISTER' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-2xl font-bold font-heading text-[var(--play-text)] mb-2">Complete Your Profile</h2>
            <p className="text-[var(--play-text-muted)] text-sm mb-8">
              Just a few more details to set up your account
            </p>

            <form onSubmit={handleRegister} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--play-text)]">Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-[var(--play-border)] px-4 py-3 text-[var(--play-text)] outline-none focus:border-[var(--play-brand)] focus:ring-1 focus:ring-[var(--play-brand)] transition-all bg-white"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--play-text)]">Email Address (Optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-[var(--play-border)] px-4 py-3 text-[var(--play-text)] outline-none focus:border-[var(--play-brand)] focus:ring-1 focus:ring-[var(--play-brand)] transition-all bg-white"
                  placeholder="Enter your email"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--play-text)]">Date of Birth (Optional)</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full rounded-lg border border-[var(--play-border)] px-4 py-3 text-[var(--play-text)] outline-none focus:border-[var(--play-brand)] focus:ring-1 focus:ring-[var(--play-brand)] transition-all bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !name.trim()}
                className="w-full flex items-center justify-center py-3 px-4 mt-2 rounded-lg bg-[var(--play-brand)] text-white font-medium hover:bg-[var(--play-brand-dark)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--play-brand)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create Account'}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
