"use client";

import { useState, useEffect } from "react";
import { fetchServerStats, ServerStats } from "./actions";
import { FiCpu, FiHardDrive, FiActivity, FiServer } from "react-icons/fi";

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatUptime(seconds: number) {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${d}d ${h}h ${m}m`;
}

function ProgressBar({ percent, color }: { percent: number; color: string }) {
  return (
    <div className="w-full bg-[#0f1117] rounded-full h-3 mt-3 border border-[#2a2d3e] overflow-hidden">
      <div
        className={`h-full rounded-full ${color} transition-all duration-1000 ease-in-out`}
        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
      />
    </div>
  );
}

export default function ServerUsageClient({ initialStats }: { initialStats: ServerStats }) {
  const [stats, setStats] = useState<ServerStats>(initialStats);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        setIsRefreshing(true);
        const newStats = await fetchServerStats();
        setStats(newStats);
        setLastUpdated(new Date());
      } catch (error) {
        console.error(error);
      } finally {
        setIsRefreshing(false);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const primaryDisk = stats.disk.length > 0 ? stats.disk[0] : null;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-['Outfit'] text-white tracking-tight">Server Health</h1>
          <p className="text-gray-500 mt-2">
            Live hardware telemetry for {stats.os.distro} ({stats.os.platform})
          </p>
        </div>
        <div className="flex items-center gap-3 bg-[#161923] border border-[#2a2d3e] px-4 py-2 rounded-lg">
          <div className={`w-2 h-2 rounded-full ${isRefreshing ? 'bg-orange-500 animate-pulse' : 'bg-emerald-500'}`} />
          <span className="text-sm font-medium text-gray-400">
            Updated: {lastUpdated.toLocaleTimeString()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* CPU Card */}
        <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center text-xl">
                <FiCpu />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white font-['Outfit']">CPU Load</h2>
                <p className="text-sm text-gray-500">{stats.cpu.brand} ({stats.cpu.cores} Cores)</p>
              </div>
            </div>
            <div className="text-2xl font-black font-['Outfit'] text-white">
              {stats.cpu.currentLoad.toFixed(1)}%
            </div>
          </div>
          <ProgressBar percent={stats.cpu.currentLoad} color="bg-gradient-to-r from-orange-600 to-orange-400" />
        </div>

        {/* Memory Card */}
        <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xl">
                <FiActivity />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white font-['Outfit']">Memory (RAM)</h2>
                <p className="text-sm text-gray-500">{formatBytes(stats.mem.active)} / {formatBytes(stats.mem.total)}</p>
              </div>
            </div>
            <div className="text-2xl font-black font-['Outfit'] text-white">
              {stats.mem.usedPercent.toFixed(1)}%
            </div>
          </div>
          <ProgressBar percent={stats.mem.usedPercent} color="bg-gradient-to-r from-emerald-600 to-emerald-400" />
        </div>

        {/* Disk Card */}
        {primaryDisk && (
          <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-6">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-xl">
                  <FiHardDrive />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white font-['Outfit']">Storage (Disk)</h2>
                  <p className="text-sm text-gray-500">{formatBytes(primaryDisk.used)} / {formatBytes(primaryDisk.total)}</p>
                </div>
              </div>
              <div className="text-2xl font-black font-['Outfit'] text-white">
                {primaryDisk.usedPercent.toFixed(1)}%
              </div>
            </div>
            <ProgressBar percent={primaryDisk.usedPercent} color="bg-gradient-to-r from-blue-600 to-blue-400" />
          </div>
        )}

        {/* System Info */}
        <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center text-xl">
              <FiServer />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-['Outfit']">System Uptime</h2>
              <p className="text-sm text-gray-500">Continuous running time</p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="bg-[#0f1117] border border-[#2a2d3e] rounded-lg p-4 flex justify-center items-center">
               <span className="text-2xl font-black font-['Outfit'] text-white tracking-widest text-center">
                 {formatUptime(stats.os.uptime)}
               </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
