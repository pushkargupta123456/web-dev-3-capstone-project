import React, { useEffect, useState } from 'react';
import { TrendingUp, AlertTriangle, Users } from 'lucide-react';
import { facultyService, attendanceService } from '../../services/api';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Table, Column } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../components/ui/Toast';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer 
} from 'recharts';

const AttendanceAnalytics: React.FC = () => {
  const [sections, setSections] = useState<any[]>([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [studentStats, setStudentStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    facultyService.getMe()
      .then(res => {
        const secList = res.data.data.sections || [];
        setSections(secList);
        if (secList.length > 0) {
          setSelectedSection(secList[0]._id);
        }
      })
      .catch(() => showToast('Failed to load sections', 'error'));
  }, []);

  useEffect(() => {
    if (!selectedSection) {
      setLoading(false);
      return;
    }
    const currentSec = sections.find(s => s._id === selectedSection);
    if (!currentSec) return;

    setLoading(true);
    attendanceService.getCourseAttendance(
      (currentSec.courseId as any)?._id || currentSec.courseId,
      { sectionId: selectedSection }
    )
      .then(res => setStudentStats(res.data.data || []))
      .catch(() => showToast('Failed to load attendance analytics', 'error'))
      .finally(() => setLoading(false));
  }, [selectedSection, sections]);

  const lowAttendanceStudents = studentStats.filter(s => s.percentage < 75);

  const chartData = studentStats.slice(0, 15).map(s => ({
    name: s.user?.name ? s.user.name.split(' ')[0] : 'Student',
    percentage: s.percentage,
  }));

  const columns: Column<any>[] = [
    {
      key: 'name',
      header: 'Student Name',
      render: (_, row) => (
        <div>
          <p className="font-semibold text-gray-900">{row.user?.name}</p>
          <span className="font-mono text-xs text-gray-500">{row.student?.registrationNumber}</span>
        </div>
      ),
    },
    {
      key: 'total',
      header: 'Total Classes',
    },
    {
      key: 'attended',
      header: 'Attended',
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
            <Badge variant={variant}>{num < 75 ? 'At Risk' : 'Satisfactory'}</Badge>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Attendance Performance Analytics</h2>
          <p className="text-xs text-gray-500">Student attendance distribution, engagement rates and early-warning alerts</p>
        </div>

        <select
          value={selectedSection}
          onChange={(e) => setSelectedSection(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1e2a5e]"
        >
          {sections.map(s => (
            <option key={s._id} value={s._id}>
              {s.sectionName} — {s.courseId?.title}
            </option>
          ))}
        </select>
      </div>

      {/* Analytics Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#1e2a5e]" />
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Student Attendance Distribution (%)</h3>
          </div>
        </CardHeader>
        <CardBody>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="percentage" fill="#1e2a5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>

      {/* Low Attendance Warning Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                Students Below Mandatory 75% Attendance
              </h3>
            </div>
            <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              {lowAttendanceStudents.length} Students
            </span>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <Table
            columns={columns}
            data={lowAttendanceStudents}
            isLoading={loading}
            emptyMessage="All students in this section currently meet the 75% threshold."
          />
        </CardBody>
      </Card>
    </div>
  );
};

export default AttendanceAnalytics;
