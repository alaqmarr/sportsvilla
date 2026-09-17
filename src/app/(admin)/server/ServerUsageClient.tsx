"use client";

import { useState, useEffect } from "react";
import { fetchServerStats, ServerStats } from "./actions";
import { FiCpu, FiHardDrive, FiActivity, FiServer } from "react-icons/fi";
import { PageHeader, Card, Badge } from "@/components/admin/ui";

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
    <div className="w-full bg-sv-bg rounded-full h-3 mt-3 border border-sv-border overflow-hidden">
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
    <div className="max-w-6xl mx-auto space-y-6 pb-20 font-sans">
      <PageHeader
        title="Server Health"
        subtitle={`Live hardware telemetry for ${stats.os.distro} (${stats.os.platform})`}
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Server Health" },
        ]}
        statusBadge={
          <Badge
            variant={isRefreshing ? "warning" : "success"}
            size="md"
            dot
            pulseDot={isRefreshing}
          >
            Updated: {lastUpdated.toLocaleTimeString()}
          </Badge>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CPU Card */}
        <Card variant="default" padding="lg">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-sv-md bg-sv-warning-subtle text-sv-warning-text flex items-center justify-center text-xl">
                <FiCpu />
              </div>
              <div>
                <h2 className="text-lg font-bold text-sv-text font-sans">CPU Load</h2>
                <p className="text-sm text-sv-text-muted">{stats.cpu.brand} ({stats.cpu.cores} Cores)</p>
              </div>
            </div>
            <div className="text-2xl font-black font-sans text-sv-text">
              {stats.cpu.currentLoad.toFixed(1)}%
            </div>
          </div>
          <ProgressBar percent={stats.cpu.currentLoad} color="bg-gradient-to-r from-sv-status-warning to-amber-500" />
        </Card>

        {/* Memory Card */}
        <Card variant="default" padding="lg">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-sv-md bg-sv-success-subtle text-sv-success-text flex items-center justify-center text-xl">
                <FiActivity />
              </div>
              <div>
                <h2 className="text-lg font-bold text-sv-text font-sans">Memory (RAM)</h2>
                <p className="text-sm text-sv-text-muted">{formatBytes(stats.mem.active)} / {formatBytes(stats.mem.total)}</p>
              </div>
            </div>
            <div className="text-2xl font-black font-sans text-sv-text">
              {stats.mem.usedPercent.toFixed(1)}%
            </div>
          </div>
          <ProgressBar percent={stats.mem.usedPercent} color="bg-gradient-to-r from-sv-status-success to-emerald-400" />
        </Card>

        {/* Disk Card */}
        {primaryDisk && (
          <Card variant="default" padding="lg">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-sv-md bg-sv-info-subtle text-sv-info-text flex items-center justify-center text-xl">
                  <FiHardDrive />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-sv-text font-sans">Storage (Disk)</h2>
                  <p className="text-sm text-sv-text-muted">{formatBytes(primaryDisk.used)} / {formatBytes(primaryDisk.total)}</p>
                </div>
              </div>
              <div className="text-2xl font-black font-sans text-sv-text">
                {primaryDisk.usedPercent.toFixed(1)}%
              </div>
            </div>
            <ProgressBar percent={primaryDisk.usedPercent} color="bg-gradient-to-r from-sv-status-info to-cyan-400" />
          </Card>
        )}

        {/* System Info */}
        <Card variant="default" padding="lg">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-sv-md bg-sv-brand-subtle text-sv-brand flex items-center justify-center text-xl">
              <FiServer />
            </div>
            <div>
              <h2 className="text-lg font-bold text-sv-text font-sans">System Uptime</h2>
              <p className="text-sm text-sv-text-muted">Continuous running time</p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="bg-sv-bg border border-sv-border rounded-sv-md p-4 flex justify-center items-center">
              <span className="text-2xl font-black font-sans text-sv-text tracking-widest text-center">
                {formatUptime(stats.os.uptime)}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

