'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { usePlayAuth } from '@/components/play/PlayAuthProvider';
import { User, Edit2, LogOut, Activity, Users, Mail, Phone, Calendar, X } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function ProfilePage() {
  const { member, familyMembers, switchMember, logout } = usePlayAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editEmail, setEditEmail] = useState('');
  const [editDob, setEditDob] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const { data, mutate } = useSWR(
    member?.id ? `/api/client/v1/profile?memberId=${member.id}` : null,
    fetcher
  );

  const profile = data?.profile || member || {};
  const metrics = data?.metrics || { total: 0, completed: 0, upcoming: 0, cancelled: 0 };

  const handleEditClick = () => {
    setEditEmail(profile.email || '');
    setEditDob(profile.dob ? new Date(profile.dob).toISOString().split('T')[0] : '');
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/client/v1/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: member?.id, email: editEmail, dob: editDob }),
      });
      if (res.ok) {
        setIsEditing(false);
        mutate();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!member) return null;

  const getInitials = (name: string) => name ? name.substring(0, 2).toUpperCase() : 'SV';

  return (
    <div className="min-h-screen bg-[var(--play-bg)] text-[var(--play-text)] p-4 sm:p-6 pb-24">
      <h1 className="text-2xl font-bold font-outfit mb-6 flex items-center gap-2">
        <User className="w-6 h-6 text-[var(--play-brand)]" />
        My Profile
      </h1>

      {/* Profile Card */}
      <section className="bg-[var(--play-surface)] rounded-[var(--play-radius-lg)] border border-[var(--play-border)] shadow-sm p-6 mb-6 relative">
        <button 
          onClick={handleEditClick}
          className="absolute top-4 right-4 p-2 text-[var(--play-text-muted)] hover:text-[var(--play-brand)] hover:bg-[var(--play-brand-light)] rounded-full transition-colors"
          title="Edit Profile"
        >
          <Edit2 className="w-5 h-5" />
        </button>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-24 h-24 bg-[var(--play-brand-light)] text-[var(--play-brand-dark)] rounded-full flex items-center justify-center font-bold text-3xl border-4 border-white shadow-sm shrink-0">
            {getInitials(profile.name)}
          </div>
          
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-bold font-outfit mb-1">{profile.name}</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-[var(--play-text-muted)]">
                <Phone className="w-4 h-4" />
                <span>{profile.mobile || 'Not provided'}</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-[var(--play-text-muted)]">
                <Mail className="w-4 h-4" />
                <span>{profile.email || 'Not provided'}</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-[var(--play-text-muted)]">
                <Calendar className="w-4 h-4" />
                <span>{profile.dob ? new Date(profile.dob).toLocaleDateString() : 'DOB not set'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Activity Metrics */}
      <section className="mb-6">
        <h3 className="text-lg font-bold font-outfit mb-3 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Booking Activity
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[var(--play-surface)] p-4 rounded-[var(--play-radius-md)] border border-[var(--play-border)] shadow-sm text-center">
            <p className="text-2xl font-bold font-outfit text-[var(--play-brand)]">{metrics.total}</p>
            <p className="text-xs text-[var(--play-text-muted)] font-medium uppercase mt-1">Total</p>
          </div>
          <div className="bg-[var(--play-surface)] p-4 rounded-[var(--play-radius-md)] border border-[var(--play-border)] shadow-sm text-center">
            <p className="text-2xl font-bold font-outfit text-blue-500">{metrics.completed}</p>
            <p className="text-xs text-[var(--play-text-muted)] font-medium uppercase mt-1">Completed</p>
          </div>
          <div className="bg-[var(--play-surface)] p-4 rounded-[var(--play-radius-md)] border border-[var(--play-border)] shadow-sm text-center">
            <p className="text-2xl font-bold font-outfit text-orange-500">{metrics.upcoming}</p>
            <p className="text-xs text-[var(--play-text-muted)] font-medium uppercase mt-1">Upcoming</p>
          </div>
          <div className="bg-[var(--play-surface)] p-4 rounded-[var(--play-radius-md)] border border-[var(--play-border)] shadow-sm text-center">
            <p className="text-2xl font-bold font-outfit text-red-500">{metrics.cancelled}</p>
            <p className="text-xs text-[var(--play-text-muted)] font-medium uppercase mt-1">Cancelled</p>
          </div>
        </div>
      </section>

      {/* Family Switcher */}
      {familyMembers && familyMembers.length > 1 && (
        <section className="mb-6 bg-[var(--play-surface)] p-5 rounded-[var(--play-radius-lg)] border border-[var(--play-border)] shadow-sm">
          <h3 className="text-lg font-bold font-outfit mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Switch Profile
          </h3>
          <div className="space-y-2">
            {familyMembers.map((fam: any) => (
              <button
                key={fam.id}
                onClick={() => switchMember(fam.id)}
                className={`w-full flex items-center justify-between p-3 rounded-[var(--play-radius-md)] transition-colors ${
                  fam.id === member.id 
                    ? 'bg-[var(--play-brand-light)] border border-[var(--play-brand)]' 
                    : 'bg-[var(--play-bg)] border border-[var(--play-border)] hover:border-[var(--play-brand)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white text-[var(--play-text)] rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
                    {getInitials(fam.name)}
                  </div>
                  <span className="font-medium text-sm">{fam.name} {fam.id === member.id && '(Active)'}</span>
                </div>
                <div className="text-xs text-[var(--play-text-muted)]">{fam.relation || 'Member'}</div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Logout */}
      <button 
        onClick={logout}
        className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-4 rounded-[var(--play-radius-lg)] transition-colors border border-red-200"
      >
        <LogOut className="w-5 h-5" />
        Log Out
      </button>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[var(--play-surface)] w-full max-w-md rounded-[var(--play-radius-lg)] shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-4 border-b border-[var(--play-border)]">
              <h3 className="text-lg font-bold font-outfit">Edit Profile</h3>
              <button onClick={() => setIsEditing(false)} className="text-[var(--play-text-muted)] hover:text-[var(--play-text)]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--play-text-muted)] mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full bg-[var(--play-bg)] border border-[var(--play-border)] rounded-[var(--play-radius-md)] px-4 py-2.5 focus:outline-none focus:border-[var(--play-brand)]"
                  placeholder="Enter email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--play-text-muted)] mb-1">Date of Birth</label>
                <input 
                  type="date" 
                  value={editDob}
                  onChange={(e) => setEditDob(e.target.value)}
                  className="w-full bg-[var(--play-bg)] border border-[var(--play-border)] rounded-[var(--play-radius-md)] px-4 py-2.5 focus:outline-none focus:border-[var(--play-brand)]"
                />
              </div>
            </div>
            <div className="p-4 border-t border-[var(--play-border)] flex justify-end gap-2">
              <button 
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 font-medium text-[var(--play-text-muted)] hover:bg-[var(--play-bg)] rounded-[var(--play-radius-md)] transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="px-4 py-2 font-medium text-white bg-[var(--play-brand)] hover:bg-[var(--play-brand-dark)] rounded-[var(--play-radius-md)] transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
