'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteTournament } from './actions';
import toast from 'react-hot-toast';
import { FiCalendar, FiMapPin, FiUsers, FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';

export default function TournamentsListClient({ initialTournaments }: any) {
  const [tournaments, setTournaments] = useState(initialTournaments);
  const router = useRouter();

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tournament? This will also delete all registrations and cannot be undone.')) return;
    const res = await deleteTournament(id);
    if (res.error) toast.error(res.error);
    else {
      toast.success('Tournament deleted');
      setTournaments(tournaments.filter((t:any) => t.id !== id));
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-['Outfit'] text-white">Manage Tournaments</h1>
        <button 
          onClick={() => router.push('/tournaments/new')}
          className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-5 py-2.5 text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer border-none"
        >
          <FiPlus /> Create Tournament
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tournaments.map((t: any) => (
          <div key={t.id} className="bg-[#161923] border border-[#2a2d3e] rounded-xl overflow-hidden shadow-sm transition">
            <div className="h-40 bg-[#0f1117] relative">
              {t.thumbnail ? (
                <img src={t.thumbnail} alt={t.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#0f1117]">
                  <span className="text-gray-500 font-medium opacity-50">No Image</span>
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-2">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${t.isPublic ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-gray-800 border border-gray-700 text-gray-400'}`}>
                  {t.isPublic ? 'Public' : 'Private'}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${t.status === 'UPCOMING' ? 'bg-orange-500/10 border border-orange-500/20 text-orange-400' : 'bg-gray-800 border border-gray-700 text-gray-400'}`}>
                  {t.status}
                </span>
              </div>
            </div>
            
            <div className="p-5">
              <h3 className="text-lg font-bold text-white mb-1">{t.name}</h3>
              <p className="text-sm text-gray-400 mb-4 line-clamp-2">{t.description || 'No description'}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-300">
                  <FiCalendar className="mr-2 text-gray-500" /> 
                  {new Date(t.startDate).toLocaleDateString()}
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <FiMapPin className="mr-2 text-gray-500" /> 
                  {t.venue || 'TBD'}
                </div>
                <div className="flex items-center justify-between text-sm text-gray-300">
                  <div className="flex items-center">
                    <FiUsers className="mr-2 text-gray-500" /> 
                    {t._count?.registrations || 0} {t.maxTeams ? `/ ${t.maxTeams}` : ''} Registered
                  </div>
                  <div className="font-semibold text-orange-400">
                    ₹{t.participationFee}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-[#2a2d3e]">
                <button 
                  onClick={() => router.push(`/tournaments/${t.id}`)}
                  className="flex-1 flex justify-center items-center gap-1 border border-[#2a2d3e] hover:bg-orange-500/10 hover:text-orange-400 hover:border-orange-500/30 text-gray-400 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer bg-transparent"
                >
                  <FiEdit2 size={14} /> View & Edit
                </button>
                <button 
                  onClick={() => handleDelete(t.id)}
                  className="flex justify-center items-center border border-[#2a2d3e] hover:bg-red-500/10 text-red-400 w-10 py-2 rounded-lg transition-colors cursor-pointer bg-transparent"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {tournaments.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-[#161923] rounded-xl border border-dashed border-[#2a2d3e]">
            No tournaments found. Create one to get started.
          </div>
        )}
      </div>
    </div>
  );
}
