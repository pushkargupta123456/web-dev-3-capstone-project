import React, { useEffect, useState } from 'react';
import { CalendarDays, Clock, BookOpen, Layers } from 'lucide-react';
import { attendanceService, facultyService } from '../../services/api';
import { ClassSession } from '../../types';
import { Table, Column } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { useToast } from '../../components/ui/Toast';

const AttendanceHistory: React.FC = () => {
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const { showToast } = useToast();

  useEffect(() => {
    facultyService.getMe()
      .then(res => {
        setSections(res.data.data.sections || []);
      })
      .catch(() => showToast('Failed to load sections', 'error'));
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await attendanceService.getSessions({
        page,
        limit: 10,
        sectionId: selectedSection || undefined,
      });
      setSessions(res.data.data);
      setTotal(res.data.pagination.total);
      setPages(res.data.pagination.pages);
    } catch {
      showToast('Failed to load sessions history', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [page, selectedSection]);

  const columns: Column<ClassSession>[] = [
    {
      key: 'date',
      header: 'Session Date',
      render: (val) => new Date(val).toLocaleDateString(),
    },
    {
      key: 'courseId',
      header: 'Course',
      render: (c: any) => (
        <div>
          <span className="font-mono text-xs font-bold text-[#1e2a5e] bg-blue-50 px-1.5 py-0.5 rounded mr-1.5">
            {c?.courseCode}
          </span>
          <span className="font-medium text-xs text-gray-800">{c?.title}</span>
        </div>
      ),
    },
    {
      key: 'sectionId',
      header: 'Section',
      render: (s: any) => <span className="font-bold text-xs text-gray-800">{s?.sectionName}</span>,
    },
    {
      key: 'startTime',
      header: 'Class Timing',
      render: (_, row) => `${row.startTime} - ${row.endTime}`,
    },
    {
      key: 'topic',
      header: 'Lecture Topic',
      render: (val) => val || 'Regular Class Session',
    },
    {
      key: 'isCompleted',
      header: 'Status',
      render: (val) => <Badge variant={val ? 'green' : 'yellow'}>{val ? 'Completed' : 'Scheduled'}</Badge>,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Attendance Session History</h2>
          <p className="text-xs text-gray-500">Historical register of delivered lectures and registered student roll calls</p>
        </div>

        <select
          value={selectedSection}
          onChange={(e) => { setSelectedSection(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1e2a5e]"
        >
          <option value="">All Teaching Sections</option>
          {sections.map(s => (
            <option key={s._id} value={s._id}>
              {s.sectionName} — {s.courseId?.title}
            </option>
          ))}
        </select>
      </div>

      <Table
        columns={columns}
        data={sessions}
        isLoading={loading}
        emptyMessage="No class attendance sessions recorded yet."
        pagination={{
          page,
          pages,
          total,
          limit: 10,
          onPageChange: (p) => setPage(p),
        }}
      />
    </div>
  );
};

export default AttendanceHistory;
