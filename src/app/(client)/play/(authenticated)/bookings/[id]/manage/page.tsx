'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import { ChevronLeft, Copy, Share2, Send, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { usePlayAuth } from '@/components/play/PlayAuthProvider';
import { useAlert } from '@/components/AlertProvider';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function ManageGamePage() {
  const params = useParams();
  const rawId = params?.id;
  const id = typeof rawId === 'string' ? rawId : Array.isArray(rawId) ? rawId[0] : '';
  const router = useRouter();
  const { member } = usePlayAuth();
  const { showAlert, showConfirm } = useAlert();
  
  const { data: res, isLoading, mutate } = useSWR(id ? `/api/client/v1/bookings/${id}` : null, fetcher);
  const booking = res?.booking ?? (res?.id ? res : null);
  
  const [visibility, setVisibility] = useState<'PRIVATE' | 'INVITE_ONLY' | 'OPEN'>('PRIVATE');
  const [capacity, setCapacity] = useState(10);
  const [mobile, setMobile] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    if (booking) {
      const v = String(booking.visibility || '').toUpperCase();
      if (v === 'OPEN') setVisibility('OPEN');
      else if (v === 'INVITE_ONLY' || v === 'INVITE ONLY') setVisibility('INVITE_ONLY');
      else setVisibility('PRIVATE');

      setCapacity(booking.inviteMaxCount || booking.capacity || 10);
    }
  }, [booking]);

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const updateRes = await fetch(`/api/client/v1/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          visibility, 
          inviteMaxCount: capacity,
          capacity 
        })
      });
      if (updateRes.ok) {
        mutate();
        showAlert('Success', 'Settings updated successfully', 'success');
      } else {
        const errorData = await updateRes.json().catch(() => ({}));
        showAlert('Error', errorData.error || 'Failed to update settings', 'error');
      }
    } catch (error) {
      showAlert('Error', 'Error updating settings', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCopyInviteCode = () => {
    if (booking?.inviteCode) {
      navigator.clipboard.writeText(booking.inviteCode);
      showAlert('Success', 'Invite code copied!', 'success');
    }
  };

  const handleShare = async () => {
    if (navigator.share && booking?.inviteCode) {
      try {
        await navigator.share({
          title: 'Join my game on SportsVilla!',
          text: `Use invite code: ${booking.inviteCode}`,
          url: `${window.location.origin}/play/join-game/${booking.inviteCode}`
        });
      } catch (err) {
        console.error('Error sharing', err);
      }
    } else {
      handleCopyInviteCode();
    }
  };

  const handleSendInvite = async () => {
    if (!mobile) return;
    if (!/^\d{10}$/.test(mobile)) {
      showAlert('Error', 'Invalid mobile number. Must be 10 digits.', 'error');
      return;
    }
    setIsInviting(true);
    try {
      const inviteRes = await fetch(`/api/client/v1/bookings/${id}/invite-wa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile })
      });
      if (inviteRes.ok) {
        showAlert('Success', 'Invite sent via WhatsApp', 'success');
        setMobile('');
      } else {
        const errorData = await inviteRes.json().catch(() => ({}));
        showAlert('Error', errorData.error || 'Failed to send invite', 'error');
      }
    } catch (error) {
      showAlert('Error', 'Error sending invite', 'error');
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = async (targetMemberId: string) => {
    showConfirm(
      'Confirm Removal',
      'Are you sure you want to remove this member from the squad?',
      async () => {
        try {
          const deleteRes = await fetch(`/api/client/v1/bookings/${id}/join?targetMemberId=${targetMemberId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ memberId: targetMemberId, targetMemberId })
          });
          if (deleteRes.ok) {
            mutate();
            showAlert('Success', 'Player removed from squad', 'success');
          } else {
            const errorData = await deleteRes.json().catch(() => ({}));
            showAlert('Error', errorData.error || 'Failed to remove member', 'error');
          }
        } catch (error) {
          showAlert('Error', 'Error removing member', 'error');
        }
      },
      undefined,
      'Remove',
      'Cancel',
      'error'
    );
  };

  if (isLoading) return <div className="p-4 text-center text-[var(--play-text-muted)] pt-20">Loading game details...</div>;
  if (!booking) return <div className="p-4 text-center text-[var(--play-error)] pt-20">Booking not found</div>;

  const squad: Array<{ id: string; name: string; isHost: boolean }> = (booking.participants && booking.participants.length > 0)
    ? booking.participants.map((p: any) => ({
        id: p.member?.id || p.memberId || p.id,
        name: p.member?.name || p.name || 'Player',
        isHost: (p.member?.id || p.memberId) === booking.memberId
      }))
    : (booking.squad || []).map((s: any) => ({
        id: s.id,
        name: s.name,
        isHost: s.id === booking.memberId
      }));

  return (
    <div className="min-h-screen bg-[var(--play-bg)] text-[var(--play-text)] pb-24">
      <header className="sticky top-0 z-10 bg-[var(--play-surface)] border-b border-[var(--play-border)] px-4 py-3 flex items-center gap-3">
        <Link href={`/play/bookings/${id}`} className="text-[var(--play-text)] hover:text-[var(--play-text-muted)]">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-lg font-semibold font-outfit">Manage Game</h1>
      </header>

      <main className="px-4 py-6 space-y-8 max-w-lg mx-auto">
        {/* Settings Form */}
        <section className="bg-[var(--play-surface)] p-4 rounded-[var(--play-radius-md)] border border-[var(--play-border)] shadow-sm">
          <h2 className="text-base font-semibold mb-4 border-b border-[var(--play-border)] pb-2">Game Settings</h2>
          <form onSubmit={handleUpdateSettings} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--play-text-muted)] mb-1">Game Visibility</label>
              <select 
                value={visibility} 
                onChange={(e) => setVisibility(e.target.value as 'PRIVATE' | 'INVITE_ONLY' | 'OPEN')}
                className="w-full border border-[var(--play-border)] rounded-[var(--play-radius-md)] p-2 bg-[var(--play-bg)] text-[var(--play-text)]"
              >
                <option value="PRIVATE">Private</option>
                <option value="INVITE_ONLY">Invite Only</option>
                <option value="OPEN">Open</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--play-text-muted)] mb-1">Squad Capacity</label>
              <input 
                type="number" 
                value={capacity} 
                onChange={(e) => setCapacity(Number(e.target.value))}
                min={2}
                className="w-full border border-[var(--play-border)] rounded-[var(--play-radius-md)] p-2 bg-[var(--play-bg)] text-[var(--play-text)]"
              />
            </div>
            <button 
              type="submit" 
              disabled={isUpdating}
              className="w-full bg-[var(--play-brand)] text-white py-2 rounded-[var(--play-radius-md)] font-medium hover:bg-[var(--play-brand-dark)] transition-colors disabled:opacity-50"
            >
              {isUpdating ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        </section>

        {/* Invite Code */}
        <section className="bg-[var(--play-surface)] p-4 rounded-[var(--play-radius-md)] border border-[var(--play-border)] shadow-sm">
          <h2 className="text-base font-semibold mb-4 border-b border-[var(--play-border)] pb-2">Invite Code</h2>
          <div className="flex items-center justify-between bg-[var(--play-bg)] p-3 rounded-[var(--play-radius-md)] border border-[var(--play-border)] mb-4">
            <span className="text-lg font-mono font-bold tracking-wider">{booking.inviteCode || 'No Invite Code'}</span>
            <div className="flex gap-2">
              <button 
                onClick={handleCopyInviteCode} 
                disabled={!booking.inviteCode}
                className="p-2 bg-[var(--play-surface)] rounded-full shadow-sm hover:bg-gray-50 border border-[var(--play-border)] disabled:opacity-40"
              >
                <Copy className="w-4 h-4 text-[var(--play-text-muted)]" />
              </button>
              <button 
                onClick={handleShare} 
                disabled={!booking.inviteCode}
                className="p-2 bg-[var(--play-surface)] rounded-full shadow-sm hover:bg-gray-50 border border-[var(--play-border)] disabled:opacity-40"
              >
                <Share2 className="w-4 h-4 text-[var(--play-text-muted)]" />
              </button>
            </div>
          </div>
        </section>

        {/* WhatsApp Invite */}
        <section className="bg-[var(--play-surface)] p-4 rounded-[var(--play-radius-md)] border border-[var(--play-border)] shadow-sm">
          <h2 className="text-base font-semibold mb-4 border-b border-[var(--play-border)] pb-2">WhatsApp Invite</h2>
          <div className="flex gap-2">
            <input 
              type="tel" 
              placeholder="Enter 10-digit mobile number" 
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="flex-1 border border-[var(--play-border)] rounded-[var(--play-radius-md)] p-2 bg-[var(--play-bg)] text-[var(--play-text)]"
            />
            <button 
              onClick={handleSendInvite}
              disabled={isInviting || !mobile}
              className="bg-[var(--play-brand)] text-white px-4 py-2 rounded-[var(--play-radius-md)] font-medium hover:bg-[var(--play-brand-dark)] transition-colors flex items-center justify-center disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* Squad Roster */}
        <section className="bg-[var(--play-surface)] p-4 rounded-[var(--play-radius-md)] border border-[var(--play-border)] shadow-sm">
          <div className="flex justify-between items-center border-b border-[var(--play-border)] mb-4 pb-2">
            <h2 className="text-base font-semibold">Squad Roster</h2>
            <span className="text-sm text-[var(--play-text-muted)]">{squad.length} / {capacity}</span>
          </div>
          
          <ul className="space-y-3">
            {squad.map((squadMember) => (
              <li key={squadMember.id} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[var(--play-brand-light)] text-[var(--play-brand-dark)] rounded-full flex items-center justify-center font-bold">
                    {squadMember.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{squadMember.name}</div>
                    {squadMember.isHost && (
                      <span className="text-xs bg-[var(--play-brand-light)] text-[var(--play-brand-dark)] px-2 py-0.5 rounded-[var(--play-radius-pill)]">Host</span>
                    )}
                  </div>
                </div>
                {!squadMember.isHost && (
                  <button 
                    onClick={() => handleRemoveMember(squadMember.id)}
                    className="p-2 text-[var(--play-error)] hover:bg-red-50 rounded-full transition-colors"
                    title="Remove Player"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </li>
            ))}
            {squad.length === 0 && (
              <li className="text-sm text-[var(--play-text-muted)] text-center py-2">No squad members yet</li>
            )}
          </ul>
        </section>
      </main>
    </div>
  );
}
