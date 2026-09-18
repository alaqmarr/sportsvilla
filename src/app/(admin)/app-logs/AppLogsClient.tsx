'use client'

import React, { useState, useEffect } from 'react';
import { FiRefreshCw, FiInfo, FiAlertTriangle, FiXCircle, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { fetchLogs, AppLog } from './actions';
import { formatIST } from '@/lib/dateUtils';
import { PageHeader, Button, Badge, Card } from '@/components/admin/ui';

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
    if (level === 'ERROR') return <FiXCircle className="text-sv-status-error" />;
    if (level === 'WARN') return <FiAlertTriangle className="text-sv-status-warning" />;
    return <FiInfo className="text-sv-status-info" />;
  };

  const getLevelBadgeVariant = (level: string): "error" | "warning" | "info" => {
    if (level === 'ERROR') return 'error';
    if (level === 'WARN') return 'warning';
    return 'info';
  };

  const getLevelContainerBorder = (level: string) => {
    if (level === 'ERROR') return 'border-sv-error-border border-[#2a2d3e] bg-sv-error-subtle/30';
    if (level === 'WARN') return 'border-sv-warning-border border-[#2a2d3e] bg-sv-warning-subtle/30';
    return 'border-sv-info-border border-[#2a2d3e] bg-sv-info-subtle/30';
  };

  return (
    <div className="space-y-6 pb-20 font-sans">
      <PageHeader
        title="System Logs"
        subtitle="View real-time application and API logs."
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "System Logs" },
        ]}
        actions={
          <Button
            variant="secondary"
            onClick={loadLogs}
            isLoading={loading}
            leftIcon={<FiRefreshCw className={loading ? 'animate-spin' : ''} />}
          >
            Refresh Logs
          </Button>
        }
      />

      <Card variant="default" padding="lg">
        {loading && logs.length === 0 ? (
          <div className="text-center py-12 text-sv-text-muted animate-pulse font-medium">
            Loading logs...
          </div>
        ) : logs.length === 0 ? (
          <div className="p-10 text-center text-sv-text-muted bg-sv-surface-raised rounded-sv-md border border-[#2a2d3e] border-dashed border-sv-border border-[#2a2d3e]">
            No logs found in app.log.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {logs.map((log, index) => {
              const isExpanded = expandedIndices.has(index);
              const hasMeta = log.meta && Object.keys(log.meta).length > 0;

              return (
                <div
                  key={index}
                  className={`border border-[#2a2d3e] rounded-sv-md overflow-hidden transition-colors ${getLevelContainerBorder(log.level)}`}
                >
                  <div
                    className={`flex items-start gap-4 p-4 ${hasMeta ? 'cursor-pointer hover:bg-sv-surface-hover/60' : ''} transition-colors`}
                    onClick={() => hasMeta && toggleExpand(index)}
                  >
                    <div className="mt-1 flex-shrink-0 text-xl">
                      {getLevelIcon(log.level)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <Badge variant={getLevelBadgeVariant(log.level)} size="sm">
                          {log.level}
                        </Badge>
                        <span className="text-xs text-sv-text-muted font-mono">
                          {formatIST(new Date(log.timestamp), 'MMM d, yyyy h:mm:ss a')}
                        </span>
                      </div>
                      <div className="text-sv-text text-sm font-medium">
                        {log.message}
                      </div>
                    </div>

                    {hasMeta && (
                      <div className="text-sv-text-muted mt-1">
                        {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                      </div>
                    )}
                  </div>

                  {isExpanded && hasMeta && (
                    <div className="border-t border-sv-border-subtle bg-sv-bg p-4 overflow-x-auto">
                      <pre className="text-xs font-mono text-sv-text-secondary">
                        {JSON.stringify(log.meta, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

