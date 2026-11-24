import React, { useEffect, useState } from 'react';
import { Shield, RefreshCw } from 'lucide-react';
import { auditService } from '../../services/api';
import { Table, Column } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../components/ui/Toast';

const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const { showToast } = useToast();

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await auditService.getLogs({ page, limit: 15 });
      setLogs(res.data.data);
      setTotal(res.data.pagination.total);
      setPages(res.data.pagination.pages);
    } catch {
      showToast('Failed to load audit logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const columns: Column<any>[] = [
    {
      key: 'action',
      header: 'Action Taken',
      render: (val) => {
        let variant: any = 'blue';
        if (val.includes('DELETE') || val.includes('DEACTIVATE')) variant = 'red';
        if (val.includes('CREATE')) variant = 'green';
        if (val.includes('UPDATE')) variant = 'yellow';
        return <Badge variant={variant}>{val}</Badge>;
      },
    },
    {
      key: 'resource',
      header: 'Module / Resource',
      render: (val) => <span className="font-mono text-xs uppercase tracking-wider text-gray-700">{val}</span>,
    },
    {
      key: 'userId',
      header: 'Operator / User',
      render: (u) => (
        <div>
          <p className="font-semibold text-xs text-gray-900">{u?.name || 'System Operator'}</p>
          <span className="text-[11px] text-gray-400">{u?.role || 'SYSTEM'}</span>
        </div>
      ),
    },
    {
      key: 'ipAddress',
      header: 'Client IP',
      render: (val) => <span className="font-mono text-xs text-gray-500">{val || '127.0.0.1'}</span>,
    },
    {
      key: 'createdAt',
      header: 'Timestamp',
      render: (val) => new Date(val).toLocaleString(),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Security & Administrative Audit Trail</h2>
          <p className="text-xs text-gray-500">Immutable ledger tracking security events, credential modifications and institutional actions</p>
        </div>
        <Button onClick={fetchLogs} variant="secondary" size="sm" icon={<RefreshCw className="w-3.5 h-3.5" />}>
          Refresh Trail
        </Button>
      </div>

      <Table
        columns={columns}
        data={logs}
        isLoading={loading}
        emptyMessage="No audit trail events logged yet."
        pagination={{
          page,
          pages,
          total,
          limit: 15,
          onPageChange: (p) => setPage(p),
        }}
      />
    </div>
  );
};

export default AdminAuditLogs;
