'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TournamentFormClient from '../TournamentFormClient';
import { manualEnrolment, updateRegistrationStatus } from '../actions';
import toast from 'react-hot-toast';
import { FiChevronLeft, FiUsers, FiSettings, FiPlus } from 'react-icons/fi';

export default function TournamentDetailsClient({ tournament, registrations: initialRegs, sports }: any) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'SETTINGS' | 'REGISTRATIONS'>('REGISTRATIONS');
  
  const [registrations, setRegistrations] = useState(initialRegs);
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualTeam, setManualTeam] = useState('');
  const [manualMobile, setManualMobile] = useState('');
  const [manualPlayers, setManualPlayers] = useState([{name: '', mobile: ''}]);

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
      setManualTeam(''); setManualMobile(''); setManualPlayers([{name: '', mobile: ''}]);
      setRegistrations([res.registration, ...registrations]);
    }
  };

  const handleVerify = async (regId: string, status: string) => {
    const res = await updateRegistrationStatus(regId, status);
    if (res.error) toast.error(res.error);
    else {
      toast.success('Status updated');
      setRegistrations(registrations.map((r:any) => r.id === regId ? { ...r, status } : r));
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.push('/tournaments')} className="p-2 bg-[#161923] rounded-full hover:bg-[#1c1f2e] border border-[#2a2d3e] transition cursor-pointer">
          <FiChevronLeft className="text-gray-400" size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold font-['Outfit'] text-white">{tournament.name}</h1>
          <p className="text-gray-500 text-sm">Manage tournament settings and participants</p>
        </div>
      </div>

      <div className="bg-[#161923] rounded-xl border border-[#2a2d3e] mb-6 overflow-hidden">
        <div className="flex border-b border-[#2a2d3e]">
          <button 
            className={`flex-1 flex items-center justify-center gap-2 py-4 font-semibold transition ${activeTab === 'REGISTRATIONS' ? 'text-orange-400 border-b-2 border-orange-500 bg-orange-500/5' : 'text-gray-500 hover:text-gray-300 hover:bg-[#1c1f2e]'}`}
            onClick={() => setActiveTab('REGISTRATIONS')}
          >
            <FiUsers /> Registrations
          </button>
          <button 
            className={`flex-1 flex items-center justify-center gap-2 py-4 font-semibold transition ${activeTab === 'SETTINGS' ? 'text-orange-400 border-b-2 border-orange-500 bg-orange-500/5' : 'text-gray-500 hover:text-gray-300 hover:bg-[#1c1f2e]'}`}
            onClick={() => setActiveTab('SETTINGS')}
          >
            <FiSettings /> Tournament Settings
          </button>
        </div>
      </div>

      {activeTab === 'SETTINGS' && (
        <TournamentFormClient initialData={tournament} sports={sports} />
      )}

      {activeTab === 'REGISTRATIONS' && (
        <div className="bg-[#161923] rounded-xl border border-[#2a2d3e] overflow-hidden">
          <div className="p-6 border-b border-[#2a2d3e] flex justify-between items-center bg-[#0f1117]">
            <h2 className="text-xl font-bold text-white font-['Outfit']">Registrations ({registrations.length})</h2>
            <button 
              onClick={() => setShowManualForm(!showManualForm)}
              className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-600 transition border-none cursor-pointer"
            >
              <FiPlus /> Manual Enrolment
            </button>
          </div>
          
          {showManualForm && (
            <div className="p-6 border-b border-[#2a2d3e] bg-[#1c1f2e]">
              <h3 className="font-semibold mb-4 text-orange-400">Add Manual Registration</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <input type="text" placeholder="Team Name (Optional)" className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-orange-500/50 focus:outline-none text-sm" value={manualTeam} onChange={e => setManualTeam(e.target.value)} />
                <input type="text" placeholder="Registered By Mobile (Req)" className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-orange-500/50 focus:outline-none text-sm" value={manualMobile} onChange={e => setManualMobile(e.target.value)} />
              </div>
              <div className="space-y-2 mb-4">
                {manualPlayers.map((p, i) => (
                  <div key={i} className="flex gap-2">
                    <input type="text" placeholder={`Player ${i+1} Name`} className="flex-1 bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:border-orange-500/50 focus:outline-none text-sm" value={p.name} onChange={e => {
                      const newP = [...manualPlayers]; newP[i].name = e.target.value; setManualPlayers(newP);
                    }} />
                    <input type="text" placeholder={`Player ${i+1} Mobile`} className="flex-1 bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:border-orange-500/50 focus:outline-none text-sm" value={p.mobile} onChange={e => {
                      const newP = [...manualPlayers]; newP[i].mobile = e.target.value; setManualPlayers(newP);
                    }} />
                  </div>
                ))}
                <button onClick={() => setManualPlayers([...manualPlayers, {name:'', mobile:''}])} className="text-orange-400 text-sm font-semibold hover:text-orange-300 transition bg-transparent border-none cursor-pointer">+ Add Player</button>
              </div>
              <button onClick={handleManualSubmit} className="bg-orange-500 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-orange-600 border-none cursor-pointer">Submit Manual Enrolment</button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0f1117] border-b border-[#2a2d3e]">
                  <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-gray-500">Team / Players</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-gray-500">Registered By</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-gray-500">Payment Info</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-gray-500">Status</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((r: any) => (
                  <tr key={r.id} className="border-b border-[#2a2d3e] hover:bg-[#1c1f2e]/50 transition-colors">
                    <td className="px-6 py-5">
                      {r.teamName && <div className="font-semibold text-white mb-1">{r.teamName}</div>}
                      <div className="text-sm text-gray-400">
                        {r.players.map((p:any) => p.name).join(' | ')}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-medium text-white">{r.registeredBy?.name || 'Unknown'}</div>
                      <div className="text-sm text-gray-500 mt-0.5">{r.registeredBy?.mobile || 'No Mobile'}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm text-gray-300 mb-1">
                        Method: <span className="font-semibold text-white">{r.paymentMethod || 'UPI'}</span>
                      </div>
                      {r.paymentUtr && (
                        <div className="text-[10px] font-mono bg-gray-800 text-gray-400 border border-gray-700 px-2 py-0.5 rounded inline-block">
                          UTR: {r.paymentUtr}
                        </div>
                      )}
                      {r.paymentScreenshotUrl && (
                        <a href={r.paymentScreenshotUrl} target="_blank" rel="noopener noreferrer" className="block text-blue-400 text-xs mt-1 font-medium hover:underline">
                          View Screenshot
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1.5 rounded-md text-xs font-semibold ${r.status === 'VERIFIED' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : r.status === 'REJECTED' ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        {r.status !== 'VERIFIED' && (
                          <button onClick={() => handleVerify(r.id, 'VERIFIED')} className="px-3 py-1.5 bg-transparent border border-[#2a2d3e] hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/30 text-gray-400 rounded-lg text-xs font-semibold transition-colors cursor-pointer">
                            Verify
                          </button>
                        )}
                        {r.status !== 'REJECTED' && (
                          <button onClick={() => handleVerify(r.id, 'REJECTED')} className="px-3 py-1.5 bg-transparent border border-[#2a2d3e] hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 text-gray-400 rounded-lg text-xs font-semibold transition-colors cursor-pointer">
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {registrations.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500 bg-[#0f1117]">No registrations yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
