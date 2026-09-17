'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  Trophy,
  Zap,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  PlayCard,
  PlayCardHeader,
  PlayCardTitle,
  PlayCardDescription,
  PlayCardContent,
} from '@/components/play/ui/PlayCard';
import { PlayButton } from '@/components/play/ui/PlayButton';
import { PlayInput } from '@/components/play/ui/PlayInput';
import { PlayBadge } from '@/components/play/ui/PlayBadge';

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
    const cleanMobile = mobile.replace(/\D/g, '');
    if (cleanMobile.length < 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/client/v1/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: cleanMobile }),
      });
      if (!res.ok) throw new Error('Failed to send OTP');

      toast.success('Verification code sent via WhatsApp!');
      setStep('OTP');
      setTimer(60);
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
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

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasteData) return;

    const newOtp = [...otp];
    for (let i = 0; i < pasteData.length; i++) {
      newOtp[i] = pasteData[i];
    }
    setOtp(newOtp);
    const nextIndex = Math.min(pasteData.length, 5);
    otpInputRefs.current[nextIndex]?.focus();
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) {
      toast.error('Please enter the complete 6-digit verification code');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/client/v1/auth/web/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: mobile.replace(/\D/g, ''), code }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Invalid verification code. Please try again.');
      }

      if (data.isNewUser) {
        setStep('REGISTER');
      } else {
        toast.success('Welcome back to Sportsvilla!');
        window.location.href = '/play/dashboard';
      }
    } catch (error) {
      // CRITICAL: Under NO circumstances should this regress the state to 'PHONE'
      toast.error(error instanceof Error ? error.message : 'Failed to verify code');
      // Clear OTP inputs for retry and refocus first box
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 50);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name is required to setup your player profile');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/client/v1/auth/web/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile: mobile.replace(/\D/g, ''),
          name: name.trim(),
          email: email.trim() || undefined,
          dob: dob || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to complete registration');
      }

      toast.success('Player account created successfully!');
      window.location.href = '/play/dashboard';
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const stepsList: { id: Step; label: string; number: number }[] = [
    { id: 'PHONE', label: 'Mobile', number: 1 },
    { id: 'OTP', label: 'Verify', number: 2 },
    { id: 'REGISTER', label: 'Profile', number: 3 },
  ];

  const currentStepIndex = step === 'PHONE' ? 0 : step === 'OTP' ? 1 : 2;

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-10 font-play">
      <div className="w-full max-w-5xl bg-play-surface border border-play-border rounded-play-xl shadow-play-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
        {/* Left Column: Athletic Split Imagery (Desktop Only) */}
        <div className="hidden lg:flex lg:col-span-5 relative bg-gradient-to-br from-play-surface-subtle via-play-brand-light/30 to-play-brand/20 p-8 flex-col justify-between border-r border-play-border overflow-hidden">
          {/* Subtle Ambient Shapes */}
          <div className="absolute -top-16 -left-16 w-56 h-56 bg-play-brand/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-play-accent/20 rounded-full blur-3xl pointer-events-none" />

          {/* Top Brand Info */}
          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-10 h-10 rounded-play-md bg-play-brand flex items-center justify-center text-white font-black text-lg shadow-play-sm">
                SV
              </div>
              <span className="font-extrabold text-xl tracking-tight text-play-text">
                Sportsvilla
              </span>
            </div>

            <PlayBadge variant="brand" size="sm" dot className="mb-4">
              Player Portal
            </PlayBadge>
            <h2 className="text-3xl font-black text-play-text leading-tight mb-4">
              Claim Your Court. Elevate Your Game.
            </h2>
            <p className="text-sm text-play-text-secondary leading-relaxed">
              Book real-time slots across premier multi-sport turfs, join open squads, and track all your passes in one place.
            </p>
          </div>

          {/* Middle Feature Highlights */}
          <div className="relative z-10 my-8 space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-play-md bg-play-surface/70 backdrop-blur-sm border border-play-border/60">
              <div className="w-8 h-8 rounded-full bg-play-brand-light flex items-center justify-center text-play-brand-dark shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-play-text">Instant Court Booking</p>
                <p className="text-play-text-muted">Live grid availability with split-second locks</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-play-md bg-play-surface/70 backdrop-blur-sm border border-play-border/60">
              <div className="w-8 h-8 rounded-full bg-play-accent-subtle flex items-center justify-center text-play-accent shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-play-text">Open Squad Games</p>
                <p className="text-play-text-muted">Drop into public matches with verified players</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-play-md bg-play-surface/70 backdrop-blur-sm border border-play-border/60">
              <div className="w-8 h-8 rounded-full bg-play-brand-light flex items-center justify-center text-play-brand-dark shrink-0">
                <Trophy className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-play-text">Leaderboards & Rewards</p>
                <p className="text-play-text-muted">Earn wallet cashback and climb arena ranks</p>
              </div>
            </div>
          </div>

          {/* Bottom Trust Watermark */}
          <div className="relative z-10 flex items-center gap-2 text-xs font-semibold text-play-text-muted pt-4 border-t border-play-border/60">
            <ShieldCheck className="w-4 h-4 text-play-brand" />
            <span>Official SportsVilla Reservation System</span>
          </div>
        </div>

        {/* Right Column: Flow Container */}
        <div className="col-span-1 lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between">
          {/* Stepper Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between relative max-w-sm mx-auto mb-6">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-play-border -translate-y-1/2 -z-0" />
              <div
                className="absolute top-1/2 left-0 h-0.5 bg-play-brand -translate-y-1/2 -z-0 transition-all duration-300"
                style={{ width: `${(currentStepIndex / (stepsList.length - 1)) * 100}%` }}
              />

              {stepsList.map((s, idx) => {
                const isCompleted = idx < currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div key={s.id} className="relative z-10 flex flex-col items-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isCompleted
                          ? 'bg-play-brand text-white ring-4 ring-play-surface'
                          : isCurrent
                          ? 'bg-play-brand text-white ring-4 ring-play-brand-light shadow-play-sm'
                          : 'bg-play-surface-subtle border border-play-border text-play-text-muted ring-4 ring-play-surface'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : s.number}
                    </div>
                    <span
                      className={`text-[11px] font-bold mt-1.5 uppercase tracking-wider ${
                        isCurrent
                          ? 'text-play-brand-dark'
                          : isCompleted
                          ? 'text-play-text'
                          : 'text-play-text-light'
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Step Body */}
          <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
            {/* Step 1: PHONE */}
            {step === 'PHONE' && (
              <div className="animate-in fade-in slide-in-from-bottom-3 duration-300">
                <div className="mb-6 text-center">
                  <h2 className="text-2xl sm:text-3xl font-black text-play-text tracking-tight mb-2">
                    Enter Mobile Number
                  </h2>
                  <p className="text-sm text-play-text-muted">
                    We’ll send a 6-digit WhatsApp verification code to your phone.
                  </p>
                </div>

                <form onSubmit={handleSendOtp} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-play-text-secondary">
                      Mobile Number
                    </label>
                    <div className="relative flex items-center">
                      <span className="inline-flex items-center px-3.5 h-11 rounded-l-play-md border border-r-0 border-play-border bg-play-surface-alt text-play-text font-bold text-sm select-none">
                        +91
                      </span>
                      <input
                        type="tel"
                        maxLength={10}
                        autoFocus
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                        className="flex-1 w-full rounded-r-play-md border border-play-border px-4 h-11 text-play-text font-semibold text-base outline-none focus:border-play-brand focus:ring-1 focus:ring-play-brand transition-all bg-play-surface placeholder:text-play-text-muted"
                        placeholder="Enter 10-digit number"
                        required
                      />
                    </div>
                    <p className="text-xs text-play-text-light">
                      Indian mobile numbers supported (+91).
                    </p>
                  </div>

                  <PlayButton
                    type="submit"
                    variant="athletic"
                    size="lg"
                    fullWidth
                    isLoading={isLoading}
                    disabled={mobile.length < 10}
                  >
                    Send Verification Code
                  </PlayButton>
                </form>
              </div>
            )}

            {/* Step 2: OTP */}
            {step === 'OTP' && (
              <div className="animate-in fade-in slide-in-from-right-3 duration-300">
                <button
                  type="button"
                  onClick={() => setStep('PHONE')}
                  className="inline-flex items-center text-xs font-bold text-play-text-muted hover:text-play-brand transition-colors mb-6"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Change Phone Number
                </button>

                <div className="mb-6">
                  <h2 className="text-2xl sm:text-3xl font-black text-play-text tracking-tight mb-2">
                    Verify Your Code
                  </h2>
                  <p className="text-sm text-play-text-muted">
                    Enter the 6-digit code sent via WhatsApp to{' '}
                    <strong className="text-play-text font-bold">+91 {mobile}</strong>
                  </p>
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div className="flex justify-between gap-2 sm:gap-3" onPaste={handleOtpPaste}>
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => {
                          otpInputRefs.current[idx] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className="w-11 sm:w-13 h-13 sm:h-14 text-center text-xl sm:text-2xl font-bold rounded-play-md border border-play-border bg-play-surface text-play-text outline-none focus:border-play-brand focus:ring-2 focus:ring-play-brand/20 transition-all shadow-play-sm"
                      />
                    ))}
                  </div>

                  <PlayButton
                    type="submit"
                    variant="athletic"
                    size="lg"
                    fullWidth
                    isLoading={isLoading}
                    disabled={otp.join('').length < 6}
                  >
                    Verify & Continue
                  </PlayButton>
                </form>

                <div className="mt-6 text-center text-xs sm:text-sm">
                  <span className="text-play-text-muted">Didn't receive the code? </span>
                  {timer > 0 ? (
                    <span className="text-play-text font-bold">Resend in {timer}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSendOtp()}
                      disabled={isLoading}
                      className="text-play-brand font-bold hover:text-play-brand-dark transition-colors cursor-pointer"
                    >
                      Resend OTP Now
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: REGISTER */}
            {step === 'REGISTER' && (
              <div className="animate-in fade-in slide-in-from-right-3 duration-300">
                <div className="mb-6">
                  <PlayBadge variant="brand" size="sm" className="mb-2">
                    New Player
                  </PlayBadge>
                  <h2 className="text-2xl sm:text-3xl font-black text-play-text tracking-tight mb-2">
                    Set Up Your Profile
                  </h2>
                  <p className="text-sm text-play-text-muted">
                    Welcome to SportsVilla! Complete your profile to finalize bookings.
                  </p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                  <PlayInput
                    label="Full Name *"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />

                  <PlayInput
                    label="Email Address (Optional)"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />

                  <PlayInput
                    label="Date of Birth (Optional)"
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                  />

                  <div className="pt-2">
                    <PlayButton
                      type="submit"
                      variant="athletic"
                      size="lg"
                      fullWidth
                      isLoading={isLoading}
                      disabled={!name.trim()}
                    >
                      Complete & Enter Arena
                    </PlayButton>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Footer Note */}
          <div className="mt-8 text-center text-[11px] text-play-text-light">
            By continuing, you agree to SportsVilla's Terms of Service and Privacy Policy.
          </div>
        </div>
      </div>
    </div>
  );
}

