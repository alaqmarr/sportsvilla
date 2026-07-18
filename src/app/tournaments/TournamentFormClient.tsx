'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createTournament, updateTournament } from './actions';
import toast from 'react-hot-toast';
import { FiUploadCloud, FiChevronLeft } from 'react-icons/fi';

export default function TournamentFormClient({ initialData, sports }: { initialData?: any, sports?: any[] }) {
  const router = useRouter();
  
  // Form states
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [fee, setFee] = useState(initialData?.participationFee?.toString() || '');
  const [teamSize, setTeamSize] = useState(initialData?.teamSize?.toString() || '1');
  const [maxTeams, setMaxTeams] = useState(initialData?.maxTeams?.toString() || '');
  
  const formatDt = (d: any) => d ? new Date(d).toISOString().slice(0, 16) : '';
  const [startDate, setStartDate] = useState(formatDt(initialData?.startDate));
  const [registrationDeadline, setRegistrationDeadline] = useState(formatDt(initialData?.registrationDeadline));
  
  const [isPublic, setIsPublic] = useState(initialData?.isPublic ?? true);
  const [prizePool, setPrizePool] = useState(initialData?.prizePool || '');
  const [venue, setVenue] = useState(initialData?.venue || '');
  const [sportId, setSportId] = useState(initialData?.sportId || '');
  const [paymentUpiId, setPaymentUpiId] = useState(initialData?.paymentUpiId || '');
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(initialData?.thumbnail || null);
  
  // Cash fields
  const [acceptsCash, setAcceptsCash] = useState(initialData?.acceptsCash ?? false);
  const [cashResponsiblePerson, setCashResponsiblePerson] = useState(initialData?.cashResponsiblePerson || '');

  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadingImage(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        const res = await fetch('/api/client/v1/upload/direct', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.success) {
          setThumbnailUrl(data.publicUrl);
          toast.success('Image uploaded to R2!');
        } else {
          toast.error(data.error || 'Failed to upload image');
        }
      } catch (err: any) {
        toast.error(err.message || 'Upload error');
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !startDate) return toast.error('Name and start date required');
    
    setSaving(true);
    try {
      const payload = {
        name, description, participationFee: fee, teamSize, maxTeams, startDate,
        isPublic, prizePool, venue, registrationDeadline, sportId,
        paymentUpiId, thumbnail: thumbnailUrl, acceptsCash, cashResponsiblePerson
      };
      
      let res;
      if (initialData?.id) {
        res = await updateTournament(initialData.id, payload);
      } else {
        res = await createTournament(payload);
      }
      
      if (res.error) toast.error(res.error);
      else {
        toast.success(initialData?.id ? 'Tournament updated!' : 'Tournament created!');
        if (!initialData?.id && res.tournament?.id) {
          router.push(`/tournaments/${res.tournament.id}`);
        } else {
          // just stay on page if editing
        }
      }
    } catch (e: any) {
      toast.error(e.message || 'Error saving tournament');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="bg-[#161923] rounded-xl border border-[#2a2d3e] overflow-hidden">
      <div className="p-6 border-b border-[#2a2d3e] flex justify-between items-center bg-[#0f1117]">
        <h2 className="text-xl font-bold font-['Outfit'] text-white">
          {initialData?.id ? 'Edit Tournament Settings' : 'Create New Tournament'}
        </h2>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="w-4 h-4 text-emerald-500 bg-[#0f1117] border-[#2a2d3e] rounded focus:ring-emerald-500"
            />
            <span className="text-sm font-semibold tracking-wider text-gray-400">MAKE PUBLIC</span>
          </label>
        </div>
      </div>

      <div className="p-6 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Tournament Name *</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-orange-500/50 focus:outline-none text-sm" placeholder="E.g. Summer Smash 2026" />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-orange-500/50 focus:outline-none text-sm" placeholder="Details about the tournament..."></textarea>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Start Date *</label>
                <input type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} required className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-orange-500/50 focus:outline-none text-sm [color-scheme:dark]" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Registration Deadline</label>
                <input type="datetime-local" value={registrationDeadline} onChange={e => setRegistrationDeadline(e.target.value)} className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-orange-500/50 focus:outline-none text-sm [color-scheme:dark]" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Venue</label>
                <input type="text" value={venue} onChange={e => setVenue(e.target.value)} className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-orange-500/50 focus:outline-none text-sm" placeholder="Arena Name / Address" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Sport</label>
                <select value={sportId} onChange={e => setSportId(e.target.value)} className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-orange-500/50 focus:outline-none text-sm">
                  <option value="">-- Select Sport --</option>
                  {sports?.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Right Column (Image & Fees) */}
          <div className="space-y-6">
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Thumbnail</label>
              <div className="border border-dashed border-[#2a2d3e] bg-[#0f1117] rounded-xl p-4 text-center hover:bg-[#1c1f2e] transition relative overflow-hidden h-40 flex flex-col justify-center items-center group cursor-pointer">
                <input type="file" onChange={handleImageChange} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                {thumbnailUrl ? (
                  <>
                    <img src={thumbnailUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <span className="text-white font-semibold flex items-center gap-2"><FiUploadCloud /> Change Image</span>
                    </div>
                  </>
                ) : uploadingImage ? (
                  <span className="text-orange-400 font-semibold animate-pulse">Uploading...</span>
                ) : (
                  <>
                    <FiUploadCloud className="text-gray-600 text-3xl mb-2" />
                    <span className="text-gray-500 text-sm font-semibold tracking-wide">Click or drop to upload</span>
                  </>
                )}
              </div>
            </div>

            <div className="bg-[#0f1117] p-5 rounded-xl border border-[#2a2d3e] space-y-4">
              <h3 className="font-semibold text-white border-b border-[#2a2d3e] pb-2 text-sm uppercase tracking-wider">Entry & Capacity</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Entry Fee (₹)</label>
                  <input type="number" value={fee} onChange={e => setFee(e.target.value)} className="w-full px-3 py-2 bg-[#161923] border border-[#2a2d3e] text-white rounded focus:border-orange-500/50 focus:outline-none" placeholder="0" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Team Size</label>
                  <input type="number" value={teamSize} onChange={e => setTeamSize(e.target.value)} className="w-full px-3 py-2 bg-[#161923] border border-[#2a2d3e] text-white rounded focus:border-orange-500/50 focus:outline-none" min="1" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Max Teams</label>
                  <input type="number" value={maxTeams} onChange={e => setMaxTeams(e.target.value)} className="w-full px-3 py-2 bg-[#161923] border border-[#2a2d3e] text-white rounded focus:border-orange-500/50 focus:outline-none" placeholder="Unlimited" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Prize Pool</label>
                  <input type="text" value={prizePool} onChange={e => setPrizePool(e.target.value)} className="w-full px-3 py-2 bg-[#161923] border border-[#2a2d3e] text-white rounded focus:border-orange-500/50 focus:outline-none" placeholder="E.g. ₹50,000" />
                </div>
              </div>
            </div>

            <div className="bg-[#0f1117] p-5 rounded-xl border border-[#2a2d3e] space-y-4">
              <h3 className="font-semibold text-white border-b border-[#2a2d3e] pb-2 text-sm uppercase tracking-wider">Payment Settings</h3>
              
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">UPI ID for Payments</label>
                <input type="text" value={paymentUpiId} onChange={e => setPaymentUpiId(e.target.value)} className="w-full px-3 py-2 bg-[#161923] border border-[#2a2d3e] text-white rounded focus:border-orange-500/50 focus:outline-none" placeholder="e.g. sportsvilla@upi" />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer mb-3">
                  <input 
                    type="checkbox" 
                    checked={acceptsCash}
                    onChange={(e) => setAcceptsCash(e.target.checked)}
                    className="w-4 h-4 text-emerald-500 bg-[#161923] border-[#2a2d3e] rounded focus:ring-emerald-500"
                  />
                  <span className="text-sm font-semibold text-gray-400">Accept Cash Payments</span>
                </label>
                
                {acceptsCash && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Cash Responsible Person</label>
                    <input type="text" value={cashResponsiblePerson} onChange={e => setCashResponsiblePerson(e.target.value)} className="w-full px-3 py-2 bg-[#161923] border border-[#2a2d3e] text-white rounded focus:border-orange-500/50 focus:outline-none" placeholder="e.g. John Doe (Manager)" required />
                  </div>
                )}
              </div>
            </div>
            
          </div>
        </div>
      </div>
      
      <div className="px-6 py-4 bg-[#0f1117] border-t border-[#2a2d3e] flex justify-end gap-3">
        {initialData?.id && (
          <button type="button" onClick={() => router.back()} className="px-5 py-2.5 rounded-lg border border-[#2a2d3e] hover:bg-[#1c1f2e] text-gray-400 transition-colors font-semibold bg-transparent cursor-pointer">
            Cancel
          </button>
        )}
        <button type="submit" disabled={saving || uploadingImage} className="px-6 py-2.5 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600 transition-colors border-none cursor-pointer disabled:opacity-50">
          {saving ? 'Saving...' : (initialData?.id ? 'Save Changes' : 'Create Tournament')}
        </button>
      </div>
    </form>
  );
}
