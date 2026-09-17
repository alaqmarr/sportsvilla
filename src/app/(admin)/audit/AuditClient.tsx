'use client'

import React, { useState, useEffect } from 'react';
import { fetchAuditLogs } from './actions';
import { formatIST } from '@/lib/dateUtils';
import { FiClock, FiActivity } from 'react-icons/fi';
import { PageHeader, DataTable, ColumnDef, Badge } from '@/components/admin/ui';

interface AuditLogItem {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  details?: string | null;
  createdAt: string | Date;
}

export default function AuditClient() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuditLogs().then((data) => {
      setLogs(data as unknown as AuditLogItem[]);
      setLoading(false);
    });
  }, []);

  const columns: ColumnDef<AuditLogItem>[] = [
    {
      key: 'createdAt',
      header: 'Timestamp',
      className: 'whitespace-nowrap',
      render: (log) => (
        <div className="flex items-center gap-2 text-sm text-sv-text-muted">
          <FiClock className="text-sv-text-muted/70 flex-shrink-0" />
          <span>{formatIST(new Date(log.createdAt), 'MMM dd, yyyy h:mm a')}</span>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      className: 'whitespace-nowrap',
      render: (log) => (
        <Badge variant="info" size="sm" className="gap-1.5 font-medium">
          <FiActivity className="text-xs" />
          <span>{log.action}</span>
        </Badge>
      ),
    },
    {
      key: 'entity',
      header: 'Entity',
      className: 'whitespace-nowrap',
      render: (log) => (
        <div className="flex items-center gap-2 whitespace-nowrap">
          <span className="text-sm font-semibold text-sv-text">{log.entity}</span>
          {log.entityId && (
            <span className="text-xs font-mono text-sv-text-muted">
              #{log.entityId.length > 8 ? log.entityId.slice(0, 8) : log.entityId}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'details',
      header: 'Details',
      render: (log) => (
        <span className="text-sm text-sv-text-secondary max-w-md truncate block">
          {log.details || '-'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-20 font-sans">
      <PageHeader
        title="Audit Logs"
        subtitle="Track business operations and changes in the system."
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Audit Logs" },
        ]}
      />

      <DataTable<AuditLogItem>
        columns={columns}
        data={logs}
        keyExtractor={(log) => log.id}
        isLoading={loading}
        emptyTitle="No audit logs found"
        emptyMessage="No audit logs have been recorded yet."
      />
    </div>
  );
}

