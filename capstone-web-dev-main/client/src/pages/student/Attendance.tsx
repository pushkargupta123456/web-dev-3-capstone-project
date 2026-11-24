import React, { useEffect, useState } from 'react';
import { UserCheck, CheckCircle2, AlertTriangle, XCircle, Calendar } from 'lucide-react';
import { studentService, attendanceService } from '../../services/api';
import { Table, Column } from '../../components/ui/Table';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../components/ui/Toast';

const StudentAttendance: React.FC = () => {
  const [student, setStudent] = useState<any>(null);
  const [summary, setSummary] = useState<any[]>([]);
  const [detailed, setDetailed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    studentService.getMe()
      .then(res => {
        const st = res.data.data;
        setStudent(st);
        return attendanceService.getStudentAttendance(st._id);
      })
      .then(res => {
        setSummary(res.data.data.summary || []);
        setDetailed(res.data.data.detailed || []);
      })
      .catch(() => showToast('Failed to load attendance records', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const totalClasses = summary.reduce((acc, c) => acc + c.total, 0);
  const attendedClasses = summary.reduce((acc, c) => acc + c.attended, 0);
  const overallPct = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 0;

  const summaryColumns: Column<any>[] = [
    {
      key: 'course',
      header: 'Course Code & Title',
      render: (_, row) => (
        <div>
          <span className="font-mono text-xs font-bold text-[#1e2a5e] bg-blue-50 px-1.5 py-0.5 rounded mr-1.5">
            {row.course?.courseCode}
          </span>
          <span className="font-medium text-xs text-gray-800">{row.course?.title}</span>
        </div>
      ),
    },
    {
      key: 'total',
      header: 'Total Held',
    },
    {
      key: 'present',
      header: 'Present',
      render: (val) => <span className="font-bold text-emerald-700">{val}</span>,
    },
    {
      key: 'late',
      header: 'Late',
      render: (val) => <span className="font-bold text-amber-700">{val}</span>,
    },
    {
      key: 'absent',
      header: 'Absent',
      render: (val) => <span className="font-bold text-rose-700">{val}</span>,
    },
    {
      key: 'percentage',
      header: 'Attendance %',
      render: (val) => {
        const num = parseFloat(val);
        const variant = num >= 75 ? 'green' : num >= 60 ? 'yellow' : 'red';
        return (
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-gray-900">{val}%</span>
            <Badge variant={variant}>{num < 75 ? 'Short Attendance' : 'Compliant'}</Badge>
          </div>
        );
      },
    },
  ];

  const detailColumns: Column<any>[] = [
    {
      key: 'date',
      header: 'Lecture Date',
      render: (_, row) => (
        <span className="font-medium text-xs text-gray-900">
          {new Date(row.classSessionId?.date || row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'course',
      header: 'Course',
      render: (_, row) => (
        <span className="font-mono text-xs font-bold text-[#1e2a5e]">
          {row.courseId?.courseCode}
        </span>
      ),
    },
    {
      key: 'timing',
      header: 'Session Time',
      render: (_, row) => (
        <span className="text-xs text-gray-600">
          {row.classSessionId?.startTime} - {row.classSessionId?.endTime}
        </span>
      ),
    },
    {
      key: 'topic',
      header: 'Lecture Topic',
      render: (_, row) => row.classSessionId?.topic || 'Regular Lecture',
    },
    {
      key: 'status',
      header: 'Status',
      render: (val) => {
        let variant: any = 'green';
        if (val === 'ABSENT') variant = 'red';
        if (val === 'LATE') variant = 'yellow';
        return <Badge variant={variant}>{val}</Badge>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">My Attendance Register</h2>
          <p className="text-xs text-gray-500">Subject-wise percentage breakdown, lecture logs and minimum threshold compliance</p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
            <CheckCircle2 className="w-3.5 h-3.5" /> &ge;75% Good
          </span>
          <span className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-1 rounded">
            <AlertTriangle className="w-3.5 h-3.5" /> 60-74% Warning
          </span>
          <span className="flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-1 rounded">
            <XCircle className="w-3.5 h-3.5" /> &lt;60% Critical
          </span>
        </div>
      </div>

      {/* Aggregate Score Card */}
      <Card>
        <CardBody className="p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-base font-bold text-gray-900">Cumulative Attendance Performance</h3>
            <p className="text-xs text-gray-500 mt-1">Total Classes Conducted: <strong>{totalClasses}</strong> | Total Attended: <strong>{attendedClasses}</strong></p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-3xl font-black text-gray-900">{overallPct}%</span>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Overall Aggregate</p>
            </div>
            <div className="w-14 h-14 rounded-full border-4 border-[#1e2a5e] flex items-center justify-center font-bold text-xs text-[#1e2a5e]">
              {overallPct >= 75 ? 'OK' : 'RISK'}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Course Summary Table */}
      <Card>
        <CardHeader>
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Subject-Wise Breakdown</h3>
        </CardHeader>
        <CardBody className="p-0">
          <Table
            columns={summaryColumns}
            data={summary}
            isLoading={loading}
            emptyMessage="No attendance records compiled yet for this semester."
          />
        </CardBody>
      </Card>

      {/* Detailed Session Log Table */}
      <Card>
        <CardHeader>
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Date-Wise Attendance History</h3>
        </CardHeader>
        <CardBody className="p-0">
          <Table
            columns={detailColumns}
            data={detailed}
            isLoading={loading}
            emptyMessage="No past attendance session entries found."
          />
        </CardBody>
      </Card>
    </div>
  );
};

export default StudentAttendance;
