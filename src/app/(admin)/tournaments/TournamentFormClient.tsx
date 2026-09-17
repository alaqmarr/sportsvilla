'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createTournament, updateTournament } from './actions';
import toast from 'react-hot-toast';
import { FiUploadCloud } from 'react-icons/fi';
import {
  Card,
  Button,
  Input,
  Select,
} from '@/components/admin/ui';

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
        if (!initialData?.id && res?.tournament?.id) {
          router.push(`/tournaments/${res.tournament!.id}`);
        }
      }
    } catch (e: any) {
      toast.error(e.message || 'Error saving tournament');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card variant="default" padding="none" className="overflow-hidden">
      <form onSubmit={handleSave}>
        <div className="p-6 border-b border-sv-border-subtle flex justify-between items-center bg-sv-surface-raised">
          <h2 className="text-xl font-bold font-sans text-sv-text">
            {initialData?.id ? 'Edit Tournament Settings' : 'Create New Tournament'}
          </h2>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded"
              />
              <span className="text-xs font-semibold tracking-wider text-sv-text-secondary uppercase">
                Make Public
              </span>
            </label>
          </div>
        </div>

        <div className="p-6 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Info Column */}
            <div className="lg:col-span-2 space-y-6">
              <Input
                label="Tournament Name *"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="E.g. Summer Smash 2026"
              />

              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-wider font-semibold text-sv-text-secondary">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={4}
                  className="w-full bg-sv-bg border border-sv-border rounded-sv-sm px-4 py-2.5 text-sv-text placeholder:text-sv-text-muted focus:border-sv-brand focus:ring-1 focus:ring-sv-brand outline-none text-sm"
                  placeholder="Details about the tournament..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Start Date *"
                  type="datetime-local"
                  required
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="[color-scheme:dark]"
                />
                <Input
                  label="Registration Deadline"
                  type="datetime-local"
                  value={registrationDeadline}
                  onChange={e => setRegistrationDeadline(e.target.value)}
                  className="[color-scheme:dark]"
                />
                <Input
                  label="Venue"
                  value={venue}
                  onChange={e => setVenue(e.target.value)}
                  placeholder="Arena Name / Address"
                />
                <Select
                  label="Sport"
                  value={sportId}
                  onChange={e => setSportId(e.target.value)}
                >
                  <option value="">-- Select Sport --</option>
                  {sports?.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Right Column (Image & Fees) */}
            <div className="space-y-6">
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-sv-text-secondary mb-2">
                  Thumbnail
                </label>
                <div className="border border-dashed border-sv-border bg-sv-bg rounded-sv-lg p-4 text-center hover:bg-sv-surface-raised transition relative overflow-hidden h-40 flex flex-col justify-center items-center group cursor-pointer">
                  <input
                    type="file"
                    onChange={handleImageChange}
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  {thumbnailUrl ? (
                    <>
                      <img src={thumbnailUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <span className="text-white font-semibold text-xs flex items-center gap-2">
                          <FiUploadCloud /> Change Image
                        </span>
                      </div>
                    </>
                  ) : uploadingImage ? (
                    <span className="text-sv-brand font-semibold text-xs animate-pulse">Uploading...</span>
                  ) : (
                    <>
                      <FiUploadCloud className="text-sv-text-muted text-3xl mb-2" />
                      <span className="text-sv-text-muted text-xs font-medium tracking-wide">
                        Click or drop to upload
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-sv-bg p-5 rounded-sv-md border border-sv-border space-y-4">
                <h3 className="font-semibold text-sv-text border-b border-sv-border pb-2 text-xs uppercase tracking-wider">
                  Entry & Capacity
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Entry Fee (₹)"
                    type="number"
                    value={fee}
                    onChange={e => setFee(e.target.value)}
                    placeholder="0"
                  />
                  <Input
                    label="Team Size"
                    type="number"
                    min="1"
                    value={teamSize}
                    onChange={e => setTeamSize(e.target.value)}
                  />
                  <Input
                    label="Max Teams"
                    type="number"
                    value={maxTeams}
                    onChange={e => setMaxTeams(e.target.value)}
                    placeholder="Unlimited"
                  />
                  <Input
                    label="Prize Pool"
                    value={prizePool}
                    onChange={e => setPrizePool(e.target.value)}
                    placeholder="E.g. ₹50,000"
                  />
                </div>
              </div>

              <div className="bg-sv-bg p-5 rounded-sv-md border border-sv-border space-y-4">
                <h3 className="font-semibold text-sv-text border-b border-sv-border pb-2 text-xs uppercase tracking-wider">
                  Payment Settings
                </h3>
                
                <Input
                  label="UPI ID for Payments"
                  value={paymentUpiId}
                  onChange={e => setPaymentUpiId(e.target.value)}
                  placeholder="e.g. sportsvilla@upi"
                />

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer mb-3">
                    <input 
                      type="checkbox" 
                      checked={acceptsCash}
                      onChange={(e) => setAcceptsCash(e.target.checked)}
                      className="w-4 h-4 accent-emerald-500 rounded"
                    />
                    <span className="text-xs font-semibold text-sv-text-secondary">
                      Accept Cash Payments
                    </span>
                  </label>
                  
                  {acceptsCash && (
                    <Input
                      label="Cash Responsible Person *"
                      required
                      value={cashResponsiblePerson}
                      onChange={e => setCashResponsiblePerson(e.target.value)}
                      placeholder="e.g. John Doe (Manager)"
                    />
                  )}
                </div>
              </div>
              
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4 bg-sv-surface-raised border-t border-sv-border flex justify-end gap-3">
          {initialData?.id && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            variant="primary"
            isLoading={saving || uploadingImage}
          >
            {initialData?.id ? 'Save Changes' : 'Create Tournament'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
