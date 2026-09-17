'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import TournamentFormClient from '../TournamentFormClient';
import { manualEnrolment, updateRegistrationStatus } from '../actions';
import toast from 'react-hot-toast';
import { FiUsers, FiSettings, FiPlus } from 'react-icons/fi';
import {
  Card,
  Button,
  Badge,
  PageHeader,
  Input,
} from '@/components/admin/ui';

export default function TournamentDetailsClient({ tournament, registrations: initialRegs, sports }: any) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'SETTINGS' | 'REGISTRATIONS'>('REGISTRATIONS');
  
  const [registrations, setRegistrations] = useState(initialRegs);
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualTeam, setManualTeam] = useState('');
  const [manualMobile, setManualMobile] = useState('');
  const [manualPlayers, setManualPlayers] = useState([{ name: '', mobile: '' }]);

  const handleManualSubmit = async () => {
    if (!manualMobile || !manualPlayers[0].name) return toast.error("Mobile and at least one player name required");
    
    const res = await manualEnrolment(tournament.id, {
      teamName: manualTeam,
      registeredByMobile: manualMobile,
      players: manualPlayers
    });

    if (res.error) toast.error(res.error);
    else {
      toast.success("Manual enrolment successful!");
      setShowManualForm(false);
      setManualTeam(''); 
      setManualMobile(''); 
      setManualPlayers([{ name: '', mobile: '' }]);
      setRegistrations([res.registration, ...registrations]);
    }
  };

  const handleVerify = async (regId: string, status: string) => {
    const res = await updateRegistrationStatus(regId, status);
    if (res.error) toast.error(res.error);
    else {
      toast.success('Status updated');
      setRegistrations(registrations.map((r: any) => r.id === regId ? { ...r, status } : r));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={tournament.name}
        subtitle="Manage tournament settings and participants"
        breadcrumbs={[
          { label: "Tournaments", href: "/tournaments" },
          { label: tournament.name }
        ]}
      />

      <Card variant="default" padding="none" className="overflow-hidden">
        <div className="flex border-b border-sv-border-subtle bg-sv-surface">
          <button 
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 font-semibold text-sm transition ${
              activeTab === 'REGISTRATIONS'
                ? 'text-sv-brand border-b-2 border-sv-brand bg-sv-brand-subtle'
                : 'text-sv-text-muted hover:text-sv-text hover:bg-sv-surface-hover'
            }`}
            onClick={() => setActiveTab('REGISTRATIONS')}
          >
            <FiUsers /> Registrations
          </button>
          <button 
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 font-semibold text-sm transition ${
              activeTab === 'SETTINGS'
                ? 'text-sv-brand border-b-2 border-sv-brand bg-sv-brand-subtle'
                : 'text-sv-text-muted hover:text-sv-text hover:bg-sv-surface-hover'
            }`}
            onClick={() => setActiveTab('SETTINGS')}
          >
            <FiSettings /> Tournament Settings
          </button>
        </div>
      </Card>

      {activeTab === 'SETTINGS' && (
        <TournamentFormClient initialData={tournament} sports={sports} />
      )}

      {activeTab === 'REGISTRATIONS' && (
        <Card variant="default" padding="none" className="overflow-hidden">
          <div className="p-6 border-b border-sv-border-subtle flex justify-between items-center bg-sv-surface-raised">
            <h2 className="text-lg font-bold text-sv-text font-sans">
              Registrations ({registrations.length})
            </h2>
            <Button 
              onClick={() => setShowManualForm(!showManualForm)}
              variant="primary"
              size="sm"
              leftIcon={<FiPlus />}
            >
              Manual Enrolment
            </Button>
          </div>
          
          {showManualForm && (
            <div className="p-6 border-b border-sv-border-subtle bg-sv-surface-raised space-y-4">
              <h3 className="font-semibold text-sv-brand text-sm uppercase tracking-wider">
                Add Manual Registration
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Team Name (Optional)"
                  placeholder="e.g. Thunderbolts"
                  value={manualTeam}
                  onChange={e => setManualTeam(e.target.value)}
                />
                <Input
                  label="Registered By Mobile *"
                  placeholder="e.g. 9876543210"
                  value={manualMobile}
                  onChange={e => setManualMobile(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-sv-text-secondary">
                  Player Roster
                </label>
                {manualPlayers.map((p, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      type="text"
                      placeholder={`Player ${i + 1} Name`}
                      className="flex-1 bg-sv-bg border border-sv-border rounded-sv-sm px-3 py-2 text-sv-text placeholder:text-sv-text-muted focus:border-sv-brand outline-none text-sm"
                      value={p.name}
                      onChange={e => {
                        const newP = [...manualPlayers];
                        newP[i].name = e.target.value;
                        setManualPlayers(newP);
                      }}
                    />
                    <input
                      type="text"
                      placeholder={`Player ${i + 1} Mobile`}
                      className="flex-1 bg-sv-bg border border-sv-border rounded-sv-sm px-3 py-2 text-sv-text placeholder:text-sv-text-muted focus:border-sv-brand outline-none text-sm"
                      value={p.mobile}
                      onChange={e => {
                        const newP = [...manualPlayers];
                        newP[i].mobile = e.target.value;
                        setManualPlayers(newP);
                      }}
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setManualPlayers([...manualPlayers, { name: '', mobile: '' }])}
                  className="text-sv-brand text-xs font-semibold hover:underline transition bg-transparent border-none cursor-pointer pt-1"
                >
                  + Add Another Player
                </button>
              </div>
              <div className="pt-2">
                <Button variant="primary" onClick={handleManualSubmit}>
                  Submit Manual Enrolment
                </Button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto styled-scrollbar">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-sv-surface-raised border-b border-sv-border text-xs uppercase tracking-wider font-semibold text-sv-text-muted">
                  <th className="px-6 py-4">Team / Players</th>
                  <th className="px-6 py-4">Registered By</th>
                  <th className="px-6 py-4">Payment Info</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sv-border-subtle bg-sv-surface">
                {registrations.map((r: any) => (
                  <tr key={r.id} className="hover:bg-sv-surface-hover/50 transition-colors">
                    <td className="px-6 py-4">
                      {r.teamName && <div className="font-semibold text-sv-text mb-0.5">{r.teamName}</div>}
                      <div className="text-xs text-sv-text-muted">
                        {r.players.map((p: any) => p.name).join(' | ')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-sv-text">{r.registeredBy?.name || 'Unknown'}</div>
                      <div className="text-xs text-sv-text-muted mt-0.5">{r.registeredBy?.mobile || 'No Mobile'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-sv-text-secondary mb-1">
                        Method: <span className="font-semibold text-sv-text">{r.paymentMethod || 'UPI'}</span>
                      </div>
                      {r.paymentUtr && (
                        <div className="text-[10px] font-mono bg-sv-surface-raised text-sv-text-muted border border-sv-border px-2 py-0.5 rounded inline-block">
                          UTR: {r.paymentUtr}
                        </div>
                      )}
                      {r.paymentScreenshotUrl && (
                        <a href={r.paymentScreenshotUrl} target="_blank" rel="noopener noreferrer" className="block text-sv-status-info text-xs mt-1 font-medium hover:underline">
                          View Screenshot
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          r.status === 'VERIFIED'
                            ? 'success'
                            : r.status === 'REJECTED'
                            ? 'error'
                            : 'warning'
                        }
                        size="sm"
                      >
                        {r.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {r.status !== 'VERIFIED' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleVerify(r.id, 'VERIFIED')}
                          >
                            Verify
                          </Button>
                        )}
                        {r.status !== 'REJECTED' && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleVerify(r.id, 'REJECTED')}
                          >
                            Reject
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {registrations.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-sv-text-muted">
                      No registrations yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
