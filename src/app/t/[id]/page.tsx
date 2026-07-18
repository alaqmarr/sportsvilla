'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function TournamentDeepLinkPage() {
  const params = useParams();
  const tournamentId = params.id as string;
  const [status, setStatus] = useState('Redirecting to app...');

  useEffect(() => {
    if (!tournamentId) return;

    // The custom scheme we configured in app.json is sportsvillaapp://
    const appUrl = `sportsvillaapp://tournament/${tournamentId}`;
    
    // Play Store fallback link
    const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.alaqmarr.sportsvillaapp';

    // Try to open the app
    window.location.href = appUrl;

    // If the app doesn't open within 2.5 seconds, redirect to Play Store
    const timeout = setTimeout(() => {
      setStatus('App not found. Redirecting to Play Store...');
      window.location.href = playStoreUrl;
    }, 2500);

    // If page becomes hidden, the app was likely successfully opened
    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearTimeout(timeout);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      clearTimeout(timeout);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [tournamentId]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-800 font-sans p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full text-center">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <h1 className="text-xl font-bold mb-2">SportsVilla</h1>
        <p className="text-gray-600 text-sm">{status}</p>
      </div>
    </div>
  );
}
