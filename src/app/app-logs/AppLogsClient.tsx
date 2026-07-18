'use client'

import React, { useState, useEffect } from 'react';
import { FiRefreshCw, FiInfo, FiAlertTriangle, FiXCircle, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { fetchLogs, AppLog } from './actions';
import { formatIST } from '@/lib/dateUtils';

export default function AppLogsClient() {
  const [logs, setLogs] = useState<AppLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIndices, setExpandedIndices] = useState<Set<number>>(new Set());

  const loadLogs = async () => {
    setLoading(true);
    const data = await fetchLogs();
    setLogs(data);
    setLoading(false);
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const toggleExpand = (index: number) => {
    const newSet = new Set(expandedIndices);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setExpandedIndices(newSet);
  };

  const getLevelIcon = (level: string) => {
    if (level === 'ERROR') return <FiXCircle className="text-red-400" />;
    if (level === 'WARN') return <FiAlertTriangle className="text-yellow-400" />;
    return <FiInfo className="text-blue-400" />;
  };

  const getLevelBg = (level: string) => {
    if (level === 'ERROR') return 'bg-red-500/10 border-red-500/20';
    if (level === 'WARN') return 'bg-yellow-500/10 border-yellow-500/20';
    return 'bg-blue-500/10 border-blue-500/20';
  };

  return (
    <div>
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-3xl font-bold font-['Outfit'] text-white tracking-tight">System Logs</h1>
          <p className="text-gray-500 mt-2">View real-time application and API logs.</p>
        </div>
        <button
          onClick={loadLogs}
          disabled={loading}
          className="flex items-center gap-2 bg-[#2a2d3e] hover:bg-[#32364a] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          Refresh Logs
        </button>
      </div>

      <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-6">
        {loading && logs.length === 0 ? (
          <div className="text-center py-10 text-gray-500 animate-pulse">Loading logs...</div>
        ) : logs.length === 0 ? (
          <div className="p-10 text-center text-gray-500 bg-[#0f1117] rounded-lg border border-dashed border-[#2a2d3e]">
            No logs found in app.log.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {logs.map((log, index) => {
              const isExpanded = expandedIndices.has(index);
              const hasMeta = log.meta && Object.keys(log.meta).length > 0;
              
              return (
                <div key={index} className={`border rounded-lg overflow-hidden ${getLevelBg(log.level)}`}>
                  <div 
                    className={`flex items-start gap-4 p-4 ${hasMeta ? 'cursor-pointer hover:bg-white/5' : ''} transition-colors`}
                    onClick={() => hasMeta && toggleExpand(index)}
                  >
                    <div className="mt-1 flex-shrink-0 text-xl">
                      {getLevelIcon(log.level)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          log.level === 'ERROR' ? 'bg-red-500/20 text-red-400' :
                          log.level === 'WARN' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {log.level}
                        </span>
                        <span className="text-xs text-gray-400 font-mono">
                          {formatIST(new Date(log.timestamp), 'MMM d, yyyy h:mm:ss a')}
                        </span>
                      </div>
                      <div className="text-gray-200 text-sm font-medium">
                        {log.message}
                      </div>
                    </div>

                    {hasMeta && (
                      <div className="text-gray-500 mt-1">
                        {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                      </div>
                    )}
                  </div>

                  {isExpanded && hasMeta && (
                    <div className="border-t border-white/10 bg-black/40 p-4 overflow-x-auto">
                      <pre className="text-xs font-mono text-gray-300">
                        {JSON.stringify(log.meta, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
