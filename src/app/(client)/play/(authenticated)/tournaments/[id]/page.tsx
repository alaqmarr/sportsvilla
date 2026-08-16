'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Calendar, MapPin, Trophy, Users, Info, Upload, CheckCircle2, AlertCircle } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Player {
  name: string;
  mobile: string;
}

export default function TournamentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const { data: detailData, isLoading, error } = useSWR(`/api/client/v1/tournaments/${id}`, fetcher);
  
  const tournament = detailData?.data;
  const maxPlayers = tournament?.format ? parseInt(tournament.format.split('v')[0]) * 2 : 10;

  const [step, setStep] = useState(1);
  const [teamName, setTeamName] = useState('');
  const [players, setPlayers] = useState<Player[]>([{ name: '', mobile: '' }]);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cash'>('upi');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleAddPlayer = () => {
    if (players.length < maxPlayers) {
      setPlayers([...players, { name: '', mobile: '' }]);
    }
  };

  const handlePlayerChange = (index: number, field: keyof Player, value: string) => {
    const newPlayers = [...players];
    newPlayers[index][field] = value;
    setPlayers(newPlayers);
  };

  const handleRemovePlayer = (index: number) => {
    const newPlayers = players.filter((_, i) => i !== index);
    setPlayers(newPlayers);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setSubmitError('');
      
      let paymentProofUrl = '';

      if (paymentMethod === 'upi' && screenshotFile) {
        const presignedRes = await fetch('/api/client/v1/upload/presigned-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: screenshotFile.name, contentType: screenshotFile.type })
        });
        const presignedData = await presignedRes.json();
        const { uploadUrl, fileKey } = presignedData.data;

        await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': screenshotFile.type },
          body: screenshotFile
        });

        const validateRes = await fetch('/api/client/v1/upload/validate-utr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileKey })
        });
        const validateData = await validateRes.json();
        paymentProofUrl = validateData.data.url || fileKey;
      }

      const registerRes = await fetch('/api/client/v1/tournaments/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tournamentId: id,
          teamName,
          players,
          paymentMethod,
          paymentProofUrl
        })
      });

      if (!registerRes.ok) throw new Error('Registration failed');

      setStep(4);
    } catch (err: any) {
      setSubmitError(err.message || 'An error occurred during registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-[var(--play-bg)]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--play-brand)]"></div></div>;
  if (error || !tournament) return <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[var(--play-bg)]"><AlertCircle className="text-[var(--play-error)] mb-2" size={32} /><p className="text-[var(--play-text)]">Failed to load tournament details.</p></div>;

  const variants = {
    enter: { opacity: 0, x: 20 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <div className="min-h-screen bg-[var(--play-bg)] pb-24 relative">
      <div className="sticky top-0 z-20 bg-[var(--play-surface)] border-b border-[var(--play-border)] px-4 py-4 flex items-center max-w-3xl mx-auto">
        <button onClick={() => step > 1 ? setStep(step - 1) : router.back()} className="mr-3 p-1 hover:bg-[var(--play-surface-alt)] rounded-full">
          <ChevronLeft className="text-[var(--play-text)]" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold font-outfit text-[var(--play-text)] truncate">{tournament.name}</h1>
          {step < 4 && (
            <div className="flex items-center gap-1 mt-1">
              {[1, 2, 3].map(i => (
                <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-[var(--play-brand)]' : 'bg-[var(--play-border)]'}`} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto overflow-hidden relative">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }} className="p-0">
              <div className="h-48 sm:h-64 bg-[var(--play-surface-alt)] relative w-full">
                {tournament.bannerUrl ? (
                  <img src={tournament.bannerUrl} alt={tournament.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[var(--play-brand)]">
                    <Trophy size={64} className="opacity-20" />
                  </div>
                )}
              </div>
              
              <div className="p-4 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold font-outfit text-[var(--play-text)] mb-2">{tournament.name}</h2>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <span className="bg-[var(--play-brand-light)] text-[var(--play-brand-dark)] px-2.5 py-1 rounded-md font-medium">{tournament.format}</span>
                    <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-md font-medium">Prize: ₹{tournament.prizePool || 'TBA'}</span>
                  </div>
                </div>

                <div className="space-y-3 bg-[var(--play-surface)] p-4 rounded-[var(--play-radius-lg)] border border-[var(--play-border)]">
                  <div className="flex items-start gap-3">
                    <Calendar className="text-[var(--play-brand)] shrink-0 mt-0.5" size={20} />
                    <div>
                      <p className="text-[var(--play-text)] font-medium">{new Date(tournament.startDate).toLocaleDateString()}</p>
                      <p className="text-sm text-[var(--play-text-muted)]">Deadline: {new Date(tournament.registrationDeadline).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="text-[var(--play-brand)] shrink-0 mt-0.5" size={20} />
                    <p className="text-[var(--play-text)] font-medium">{tournament.venue}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="text-[var(--play-brand)] shrink-0 mt-0.5" size={20} />
                    <p className="text-[var(--play-text)] font-medium">{tournament.format} Format</p>
                  </div>
                </div>

                {tournament.rules && (
                  <div className="bg-[var(--play-surface)] p-4 rounded-[var(--play-radius-lg)] border border-[var(--play-border)]">
                    <div className="flex items-center gap-2 mb-3">
                      <Info className="text-[var(--play-text-muted)]" size={20} />
                      <h3 className="font-bold text-[var(--play-text)]">Rules & Guidelines</h3>
                    </div>
                    <p className="text-sm text-[var(--play-text-muted)] whitespace-pre-wrap">{tournament.rules}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }} className="p-4 space-y-6">
              <div>
                <h2 className="text-xl font-bold font-outfit text-[var(--play-text)] mb-1">Team Details</h2>
                <p className="text-sm text-[var(--play-text-muted)]">Enter your team name and player roster.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--play-text)] mb-1">Team Name <span className="text-[var(--play-error)]">*</span></label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="E.g. FC Strikers"
                    className="w-full px-4 py-3 bg-[var(--play-surface)] border border-[var(--play-border)] rounded-[var(--play-radius-md)] focus:outline-none focus:border-[var(--play-brand)] text-[var(--play-text)]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-[var(--play-text)]">Players ({players.length}/{maxPlayers})</label>
                  </div>
                  
                  <div className="space-y-3">
                    {players.map((player, index) => (
                      <div key={index} className="p-3 bg-[var(--play-surface)] border border-[var(--play-border)] rounded-[var(--play-radius-md)]">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-semibold text-[var(--play-text-muted)] uppercase tracking-wider">Player {index + 1} {index === 0 && '(Captain)'}</span>
                          {index > 0 && (
                            <button onClick={() => handleRemovePlayer(index)} className="text-[var(--play-error)] text-xs font-medium hover:underline">Remove</button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={player.name}
                            onChange={(e) => handlePlayerChange(index, 'name', e.target.value)}
                            placeholder="Full Name"
                            className="w-full px-3 py-2 bg-[var(--play-bg)] border border-[var(--play-border)] rounded-[var(--play-radius-sm)] focus:outline-none focus:border-[var(--play-brand)] text-sm text-[var(--play-text)]"
                          />
                          <input
                            type="tel"
                            value={player.mobile}
                            onChange={(e) => handlePlayerChange(index, 'mobile', e.target.value)}
                            placeholder="Mobile Number"
                            className="w-full px-3 py-2 bg-[var(--play-bg)] border border-[var(--play-border)] rounded-[var(--play-radius-sm)] focus:outline-none focus:border-[var(--play-brand)] text-sm text-[var(--play-text)]"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {players.length < maxPlayers && (
                    <button
                      onClick={handleAddPlayer}
                      className="mt-3 w-full py-3 border-2 border-dashed border-[var(--play-border)] rounded-[var(--play-radius-md)] text-[var(--play-text-muted)] font-medium hover:border-[var(--play-brand)] hover:text-[var(--play-brand)] transition-colors"
                    >
                      + Add Player
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }} className="p-4 space-y-6">
              <div>
                <h2 className="text-xl font-bold font-outfit text-[var(--play-text)] mb-1">Payment</h2>
                <p className="text-sm text-[var(--play-text-muted)]">Complete payment to secure your spot.</p>
              </div>

              <div className="bg-[var(--play-surface)] p-4 rounded-[var(--play-radius-lg)] border border-[var(--play-border)]">
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-[var(--play-border)]">
                  <span className="text-[var(--play-text-muted)]">Entry Fee</span>
                  <span className="text-2xl font-bold text-[var(--play-text)]">₹{tournament.entryFee}</span>
                </div>

                <div className="space-y-3 mb-6">
                  <label className="flex items-center p-3 border border-[var(--play-border)] rounded-[var(--play-radius-md)] cursor-pointer hover:bg-[var(--play-surface-alt)]">
                    <input type="radio" name="payment" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} className="mr-3 accent-[var(--play-brand)]" />
                    <span className="font-medium text-[var(--play-text)]">Pay via UPI</span>
                  </label>
                  <label className="flex items-center p-3 border border-[var(--play-border)] rounded-[var(--play-radius-md)] cursor-pointer hover:bg-[var(--play-surface-alt)]">
                    <input type="radio" name="payment" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} className="mr-3 accent-[var(--play-brand)]" />
                    <span className="font-medium text-[var(--play-text)]">Pay Cash at Venue</span>
                  </label>
                </div>

                {paymentMethod === 'upi' && (
                  <div className="space-y-4 bg-[var(--play-bg)] p-4 rounded-[var(--play-radius-md)]">
                    <p className="text-sm text-[var(--play-text-muted)] text-center">Scan QR or transfer to sportsvilla@upi</p>
                    <div className="w-40 h-40 bg-white mx-auto border border-[var(--play-border)] shadow-sm flex items-center justify-center rounded-[var(--play-radius-sm)]">
                      <span className="text-gray-400 font-mono text-xs">QR CODE</span>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-[var(--play-text)] mb-2">Upload Payment Screenshot</label>
                      <div className="border-2 border-dashed border-[var(--play-border)] rounded-[var(--play-radius-md)] p-6 text-center hover:bg-[var(--play-surface-alt)] transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          id="screenshot-upload"
                          onChange={(e) => setScreenshotFile(e.target.files?.[0] || null)}
                        />
                        <label htmlFor="screenshot-upload" className="cursor-pointer flex flex-col items-center">
                          <Upload className="text-[var(--play-text-muted)] mb-2" size={24} />
                          <span className="text-sm text-[var(--play-brand)] font-medium">Click to upload</span>
                          <span className="text-xs text-[var(--play-text-muted)] mt-1">{screenshotFile ? screenshotFile.name : 'PNG, JPG up to 5MB'}</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {submitError && (
                <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-[var(--play-radius-md)] text-sm">
                  {submitError}
                </div>
              )}
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }} className="p-6 flex flex-col items-center text-center mt-10">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="text-green-600" size={40} />
              </div>
              <h2 className="text-2xl font-bold font-outfit text-[var(--play-text)] mb-2">Registration Submitted!</h2>
              <p className="text-[var(--play-text-muted)] mb-8">
                Your team <strong className="text-[var(--play-text)]">{teamName}</strong> has been successfully registered for {tournament.name}.
                {paymentMethod === 'upi' ? ' Verification is pending.' : ' Please pay at the venue.'}
              </p>
              
              <button
                onClick={() => router.push('/play/tournaments/my-registrations')}
                className="w-full py-4 bg-[var(--play-brand)] text-white font-bold rounded-[var(--play-radius-pill)] hover:bg-[var(--play-brand-dark)] transition-colors"
              >
                View My Registrations
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {step < 4 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-[var(--play-surface)] border-t border-[var(--play-border)] z-20">
          <div className="max-w-3xl mx-auto flex gap-3">
            {step === 1 && (
              <button
                onClick={() => setStep(2)}
                className="w-full py-4 bg-[var(--play-brand)] text-white font-bold rounded-[var(--play-radius-pill)] hover:bg-[var(--play-brand-dark)] transition-colors"
              >
                Register Now
              </button>
            )}
            {step === 2 && (
              <button
                onClick={() => {
                  if (!teamName.trim()) {
                    alert('Please enter a team name');
                    return;
                  }
                  if (players[0].name === '' || players[0].mobile === '') {
                    alert('Please fill details for at least the captain');
                    return;
                  }
                  setStep(3);
                }}
                className="w-full py-4 bg-[var(--play-brand)] text-white font-bold rounded-[var(--play-radius-pill)] hover:bg-[var(--play-brand-dark)] transition-colors"
              >
                Proceed to Payment
              </button>
            )}
            {step === 3 && (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || (paymentMethod === 'upi' && !screenshotFile)}
                className="w-full flex justify-center py-4 bg-[var(--play-brand)] text-white font-bold rounded-[var(--play-radius-pill)] hover:bg-[var(--play-brand-dark)] disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                ) : (
                  'Complete Registration'
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
