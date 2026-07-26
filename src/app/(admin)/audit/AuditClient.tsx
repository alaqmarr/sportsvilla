'use client'

import React, { useState, useEffect } from 'react';
import { fetchAuditLogs } from './actions';
import { formatIST } from '@/lib/dateUtils';
import { FiClock, FiActivity } from 'react-icons/fi';

export default function AuditClient() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuditLogs().then(data => {
      setLogs(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-['Outfit'] text-white tracking-tight">Audit Logs</h1>
        <p className="text-gray-500 mt-2">Track business operations and changes in the system.</p>
      </div>

      <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1c1f2e] border-b border-[#2a2d3e]">
                <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-gray-500">Timestamp</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-gray-500">Action</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-gray-500">Entity</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-gray-500">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2d3e]">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-500">Loading audit logs...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-500">No audit logs found.</td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} className="hover:bg-[#1a1d27] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <FiClock className="text-gray-500" />
                        {formatIST(new Date(log.createdAt), 'MMM dd, yyyy h:mm a')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <FiActivity size={12} />
                        {log.action}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-white">{log.entity}</span>
                      <span className="text-xs text-gray-500 ml-2">#{log.entityId.substring(0, 8)}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400 max-w-md truncate">
                      {log.details || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
