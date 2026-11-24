import React, { useEffect, useState } from 'react';
import { UserCheck, AlertTriangle, Download, RefreshCw } from 'lucide-react';
import { attendanceService, courseService, reportService } from '../../services/api';
import { Course } from '../../types';
import { Table, Column } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../components/ui/Toast';

const AdminAttendance: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [threshold, setThreshold] = useState('75');
  const [lowAttendance, setLowAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { showToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [cRes, repRes] = await Promise.all([
        courseService.getAll({ limit: 100 }),
        attendanceService.getReports({
          threshold: parseInt(threshold) || 75,
          courseId: selectedCourse || undefined,
        }),
      ]);
      setCourses(cRes.data.data);
      setLowAttendance(repRes.data.data.lowAttendance || []);
    } catch {
      showToast('Failed to load attendance report', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCourse, threshold]);

  const handleExportCSV = async () => {
    try {
      const res = await reportService.exportAttendanceCSV({
        threshold: parseInt(threshold) || 75,
        courseId: selectedCourse || undefined,
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'attendance_report.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast('Attendance report exported', 'success');
    } catch {
      showToast('CSV export failed', 'error');
    }
  };

  const columns: Column<any>[] = [
    {
      key: 'student',
      header: 'Student Name',
      render: (_, row) => (
        <div>
          <p className="font-semibold text-gray-900">{row.user?.name || 'Student'}</p>
          <span className="font-mono text-xs text-gray-500">{row.student?.registrationNumber}</span>
        </div>
      ),
    },
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
      header: 'Total Classes',
    },
    {
      key: 'attended',
      header: 'Attended Classes',
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
            <Badge variant={variant}>{num < 75 ? 'Low Attendance' : 'Good'}</Badge>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Attendance Monitoring & Reports</h2>
          <p className="text-xs text-gray-500">Track institutional attendance metrics, detect absenteeism and enforce academic threshold policies</p>
        </div>
        <Button onClick={handleExportCSV} variant="secondary" icon={<Download className="w-4 h-4" />}>
          Export CSV Report
        </Button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap gap-4 items-center">
        <div>
          <label className="block text-[11px] font-semibold text-gray-600 mb-1">Filter By Course</label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1e2a5e]"
          >
            <option value="">All Courses (Campus-wide)</option>
            {courses.map(c => (
              <option key={c._id} value={c._id}>{c.courseCode} - {c.title}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-gray-600 mb-1">Attendance Threshold (%)</label>
          <select
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1e2a5e]"
          >
            <option value="75">75% (Mandatory Requirement)</option>
            <option value="65">65% (Warning Level)</option>
            <option value="50">50% (Critical Level)</option>
            <option value="85">85% (Distinction Level)</option>
          </select>
        </div>

        <div className="ml-auto pt-4">
          <Button onClick={loadData} variant="ghost" size="sm" icon={<RefreshCw className="w-3.5 h-3.5" />}>
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              Students Below Required Threshold ({threshold}%)
            </h3>
          </div>
          <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
            {lowAttendance.length} At-Risk Records
          </span>
        </CardHeader>
        <CardBody className="p-0">
          <Table
            columns={columns}
            data={lowAttendance}
            isLoading={loading}
            emptyMessage={`No students found with attendance below ${threshold}%. Excellent academic turnout!`}
          />
        </CardBody>
      </Card>
    </div>
  );
};

export default AdminAttendance;
