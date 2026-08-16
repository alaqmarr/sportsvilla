'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Calendar, MapPin, Trophy, Users, Info, Upload, CheckCircle2, AlertCircle, Phone, FileText } from 'lucide-react';

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
  
  const tournament = detailData?.tournament;
  const upiId = detailData?.upiId || 'sportsvilla@upi';
  const existingRegistration = detailData?.existingRegistration;
  const maxPlayers = tournament?.teamSize ? tournament.teamSize * 2 : 10;

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

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--play-bg)]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--play-brand)]"></div>
    </div>
  );
  if (error || !tournament) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[var(--play-bg)]">
      <AlertCircle className="text-[var(--play-error)] mb-2" size={32} />
      <p className="text-[var(--play-text)]">Failed to load tournament details.</p>
    </div>
  );

  const variants = {
    enter: { opacity: 0, y: 10 },
    center: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UPCOMING': return 'bg-blue-100 text-blue-800';
      case 'ONGOING': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="relative h-full flex flex-col">
      <div className="sticky top-0 z-30 bg-[var(--play-surface)] border-b border-[var(--play-border)]">
        <div className="px-4 py-3 flex items-center max-w-3xl mx-auto">
          <button onClick={() => step > 1 ? setStep(step - 1) : router.back()} className="mr-3 p-1.5 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft size={22} className="text-[var(--play-text)]" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold font-outfit text-[var(--play-text)] truncate">{tournament.name}</h1>
            {step < 4 && (
              <div className="flex items-center gap-1 mt-1">
                {[1, 2, 3].map(i => (
                  <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-[var(--play-brand)]' : 'bg-[var(--play-border)]'}`} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto overflow-hidden relative flex-1 w-full pb-8">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }} className="p-0">
              <div className="h-56 sm:h-64 bg-[var(--play-surface-alt)] relative w-full">
                {tournament.thumbnail ? (
                  <img src={tournament.thumbnail} alt={tournament.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[var(--play-brand)]/20">
                    <Trophy size={80} />
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${getStatusColor(tournament.status)}`}>
                    {tournament.status}
                  </span>
                </div>
              </div>
              
              <div className="p-4 sm:p-6 space-y-6 bg-[var(--play-surface)]">
                <div>
                  <h2 className="text-2xl font-bold font-outfit text-[var(--play-text)] mb-3">{tournament.name}</h2>
                  <div className="flex flex-wrap gap-2 text-sm">
                    {tournament.teamSize && (
                      <span className="bg-[var(--play-brand-light)] text-[var(--play-brand-dark)] px-3 py-1 rounded-md font-medium flex items-center gap-1.5">
                        <Users size={14} />
                        {tournament.teamSize}v{tournament.teamSize}
                      </span>
                    )}
                    <span className="bg-amber-50 text-amber-800 px-3 py-1 rounded-md font-medium flex items-center gap-1.5">
                      <Trophy size={14} />
                      Prize: {tournament.prizePool ? `₹${tournament.prizePool}` : 'TBA'}
                    </span>
                  </div>
                </div>

                {tournament.description && (
                  <div className="text-[var(--play-text-muted)] text-sm">
                    <p>{tournament.description}</p>
                  </div>
                )}

                <div className="border-t border-[var(--play-border)] pt-4 space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="text-[var(--play-brand)] shrink-0 mt-0.5" size={20} />
                    <div>
                      <p className="text-[var(--play-text)] font-medium">{new Date(tournament.startDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                      {tournament.registrationDeadline && (
                        <p className="text-sm text-[var(--play-error)] mt-1">Deadline: {new Date(tournament.registrationDeadline).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <MapPin className="text-[var(--play-brand)] shrink-0 mt-0.5" size={20} />
                    <p className="text-[var(--play-text)] font-medium">{tournament.venue || 'TBA'}</p>
                  </div>
                </div>

                {tournament.rules && (
                  <div className="border-t border-[var(--play-border)] pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Info className="text-[var(--play-text-muted)]" size={18} />
                      <h3 className="font-bold text-[var(--play-text)]">Rules & Guidelines</h3>
                    </div>
                    <p className="text-sm text-[var(--play-text-muted)] whitespace-pre-wrap">{tournament.rules}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }} className="p-4 sm:p-6 space-y-6">
              <div>
                <h2 className="text-xl font-bold font-outfit text-[var(--play-text)] mb-1">Team Roster</h2>
                <p className="text-sm text-[var(--play-text-muted)]">Enter your team name and add players.</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--play-text)] mb-1.5">Team Name <span className="text-[var(--play-error)]">*</span></label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="e.g. FC Strikers"
                    className="w-full px-4 py-3 bg-[var(--play-surface)] border border-[var(--play-border)] rounded-[var(--play-radius-md)] focus:outline-none focus:border-[var(--play-brand)] text-[var(--play-text)]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-[var(--play-text)]">Players Roster ({players.length}/{maxPlayers})</label>
                  </div>
                  
                  <div className="space-y-3">
                    {players.map((player, index) => (
                      <div key={index} className="p-4 bg-[var(--play-surface)] border border-[var(--play-border)] rounded-[var(--play-radius-md)]">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-xs font-semibold text-[var(--play-text-muted)] uppercase tracking-wider">
                            Player {index + 1} {index === 0 && '(Captain)'}
                          </span>
                          {index > 0 && (
                            <button onClick={() => handleRemovePlayer(index)} className="text-[var(--play-error)] text-xs font-medium hover:underline">Remove</button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          <input
                            type="text"
                            value={player.name}
                            onChange={(e) => handlePlayerChange(index, 'name', e.target.value)}
                            placeholder="Full Name"
                            className="w-full px-4 py-2.5 bg-[var(--play-bg)] border border-[var(--play-border)] rounded-[var(--play-radius-sm)] focus:outline-none focus:border-[var(--play-brand)] text-[var(--play-text)] text-sm"
                          />
                          <input
                            type="tel"
                            value={player.mobile}
                            onChange={(e) => handlePlayerChange(index, 'mobile', e.target.value)}
                            placeholder="Mobile Number"
                            className="w-full px-4 py-2.5 bg-[var(--play-bg)] border border-[var(--play-border)] rounded-[var(--play-radius-sm)] focus:outline-none focus:border-[var(--play-brand)] text-[var(--play-text)] text-sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {players.length < maxPlayers && (
                    <button
                      onClick={handleAddPlayer}
                      className="mt-4 w-full py-3.5 border-2 border-dashed border-[var(--play-border)] rounded-[var(--play-radius-md)] text-[var(--play-text-muted)] font-medium hover:text-[var(--play-brand)] hover:border-[var(--play-brand)] transition-colors"
                    >
                      + Add Another Player
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }} className="p-4 sm:p-6 space-y-6">
              <div>
                <h2 className="text-xl font-bold font-outfit text-[var(--play-text)] mb-1">Payment Details</h2>
                <p className="text-sm text-[var(--play-text-muted)]">Choose your preferred payment method.</p>
              </div>

              <div className="bg-[var(--play-surface)] p-4 sm:p-6 rounded-[var(--play-radius-lg)] border border-[var(--play-border)]">
                <div className="flex justify-between items-center mb-6 pb-6 border-b border-[var(--play-border)]">
                  <span className="text-[var(--play-text-muted)] font-medium">Participation Fee</span>
                  <span className="text-2xl font-bold text-[var(--play-text)]">₹{tournament.participationFee}</span>
                </div>

                <div className="space-y-3 mb-6">
                  <label className="flex items-center p-4 border border-[var(--play-border)] rounded-[var(--play-radius-md)] cursor-pointer hover:bg-[var(--play-surface-alt)]">
                    <input type="radio" name="payment" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} className="mr-3 accent-[var(--play-brand)] w-4 h-4" />
                    <div>
                      <span className="block font-medium text-[var(--play-text)]">Pay via UPI</span>
                    </div>
                  </label>
                  
                  {tournament.acceptsCash && (
                    <label className="flex items-center p-4 border border-[var(--play-border)] rounded-[var(--play-radius-md)] cursor-pointer hover:bg-[var(--play-surface-alt)]">
                      <input type="radio" name="payment" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} className="mr-3 accent-[var(--play-brand)] w-4 h-4" />
                      <div>
                        <span className="block font-medium text-[var(--play-text)]">Pay Cash at Venue</span>
                        {tournament.cashResponsiblePerson && <span className="text-xs text-[var(--play-text-muted)]">To: {tournament.cashResponsiblePerson}</span>}
                      </div>
                    </label>
                  )}
                </div>

                {paymentMethod === 'upi' && (
                  <div className="bg-white p-6 rounded-[var(--play-radius-md)] border border-dashed border-[var(--play-border)] flex flex-col items-center">
                    <p className="text-sm text-[var(--play-text-muted)] text-center mb-3">Scan QR or transfer to <br/><span className="font-bold text-[var(--play-text)]">{upiId}</span></p>
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=${upiId}&pn=Sportsvilla&am=${tournament.participationFee}`} alt="UPI QR" className="w-36 h-36 mb-6 border border-[var(--play-border)] p-1 rounded-md" />
                    
                    <div className="w-full">
                      <label className="block text-sm font-medium text-[var(--play-text)] mb-2">Upload Payment Screenshot <span className="text-[var(--play-error)]">*</span></label>
                      <div className="border border-[var(--play-border)] bg-[var(--play-surface-alt)] rounded-[var(--play-radius-md)] p-4 text-center hover:bg-[var(--play-border)] transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          id="screenshot-upload"
                          onChange={(e) => setScreenshotFile(e.target.files?.[0] || null)}
                        />
                        <label htmlFor="screenshot-upload" className="cursor-pointer flex flex-col items-center w-full">
                          <Upload className="text-[var(--play-text-muted)] mb-2" size={24} />
                          <span className="text-sm text-[var(--play-brand)] font-medium">Click to Browse</span>
                          <span className="text-xs text-[var(--play-text-muted)] mt-1 max-w-[200px] truncate">
                            {screenshotFile ? screenshotFile.name : 'PNG, JPG up to 5MB'}
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {submitError && (
                <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-[var(--play-radius-md)] text-sm flex items-start gap-2">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  {submitError}
                </div>
              )}
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }} className="p-6 flex flex-col items-center text-center mt-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="text-green-600" size={32} />
              </div>
              <h2 className="text-2xl font-bold font-outfit text-[var(--play-text)] mb-2">Registration Successful!</h2>
              <p className="text-[var(--play-text-muted)] mb-8">
                Your team <strong className="text-[var(--play-text)]">{teamName}</strong> is registered for <strong className="text-[var(--play-text)]">{tournament.name}</strong>.
                {paymentMethod === 'upi' ? (
                  <span className="block mt-2 text-sm">Your payment screenshot is under verification. We will notify you once approved.</span>
                ) : (
                  <span className="block mt-2 text-sm">Please remember to pay your participation fee at the venue.</span>
                )}
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
        <div className="sticky bottom-0 w-full bg-[var(--play-surface)] border-t border-[var(--play-border)] z-40 mt-auto">
          <div className="max-w-3xl mx-auto p-4 flex gap-3">
            {step === 1 && (
              <button
                onClick={() => setStep(2)}
                className="w-full py-3.5 bg-[var(--play-brand)] text-white font-bold rounded-[var(--play-radius-pill)] hover:bg-[var(--play-brand-dark)] transition-colors"
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
                className="w-full py-3.5 bg-[var(--play-brand)] text-white font-bold rounded-[var(--play-radius-pill)] hover:bg-[var(--play-brand-dark)] transition-colors"
              >
                Proceed to Payment
              </button>
            )}
            {step === 3 && (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || (paymentMethod === 'upi' && !screenshotFile)}
                className="w-full flex justify-center py-3.5 bg-[var(--play-brand)] text-white font-bold rounded-[var(--play-radius-pill)] hover:bg-[var(--play-brand-dark)] disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
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
