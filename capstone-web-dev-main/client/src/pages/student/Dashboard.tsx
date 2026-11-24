import React, { useEffect, useState } from 'react';
import { BookOpen, UserCheck, CalendarDays, Megaphone, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { dashboardService } from '../../services/api';
import { StatCard, Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Link } from 'react-router-dom';

const StudentDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.getStudent()
      .then(res => setData(res.data.data))
      .catch(err => console.error('Failed to load student dashboard:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 bg-white rounded-xl border border-gray-200" />
          ))}
        </div>
        <div className="h-64 bg-white rounded-xl border border-gray-200" />
      </div>
    );
  }

  const student = data?.student;
  const enrolments = data?.enrolments || [];
  const stats = data?.stats || {};
  const announcements = data?.recentAnnouncements || [];
  const overallAtt = stats.overallAttendance ?? 0;

  let attColor = 'text-emerald-600 bg-emerald-50 border-emerald-200';
  let attIcon = <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
  let attStatus = 'Eligible for Exams';

  if (overallAtt < 60) {
    attColor = 'text-rose-600 bg-rose-50 border-rose-200';
    attIcon = <XCircle className="w-5 h-5 text-rose-600" />;
    attStatus = 'Critical - Below Exam Threshold (75%)';
  } else if (overallAtt < 75) {
    attColor = 'text-amber-600 bg-amber-50 border-amber-200';
    attIcon = <AlertTriangle className="w-5 h-5 text-amber-600" />;
    attStatus = 'Warning - Approaching Threshold';
  }

  return (
    <div className="space-y-6">
      {/* Student Banner */}
      <div className="bg-[#1e2a5e] rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">Welcome Back</span>
          <h2 className="text-xl font-bold mt-0.5">{student?.userId?.name || 'Student'}</h2>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-blue-200">
            <span className="font-mono bg-white/10 px-2 py-0.5 rounded">{student?.registrationNumber}</span>
            <span>•</span>
            <span>{student?.department}</span>
            <span>•</span>
            <span>Semester {student?.semester}</span>
            <span>•</span>
            <span>{student?.academicYear}</span>
          </div>
        </div>

        <div className={`px-4 py-3 rounded-xl border ${attColor} flex items-center gap-3`}>
          {attIcon}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider">Overall Attendance</p>
            <p className="text-xl font-black">{overallAtt}%</p>
            <p className="text-[11px] font-medium">{attStatus}</p>
          </div>
        </div>
      </div>

      {/* Top Stat Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Enrolled Courses"
          value={stats.totalCourses ?? 0}
          icon={<BookOpen className="w-5 h-5 text-blue-600" />}
          color="bg-blue-50"
        />
        <StatCard
          title="Attendance Requirement"
          value="75%"
          subtitle="Mandatory for examination eligibility"
          icon={<UserCheck className="w-5 h-5 text-emerald-600" />}
          color="bg-emerald-50"
        />
        <StatCard
          title="Unread Circulars"
          value={stats.unreadNotifications ?? 0}
          icon={<Megaphone className="w-5 h-5 text-purple-600" />}
          color="bg-purple-50"
        />
      </div>

      {/* Enrolled Courses Preview */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">My Current Registered Courses</h3>
          <Link to="/student/courses" className="text-xs font-bold text-blue-700 hover:underline">
            View All
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {enrolments.map((enr: any) => (
            <Card key={enr._id}>
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#1e2a5e] bg-blue-50 px-2 py-0.5 rounded">
                    {enr.courseId?.courseCode}
                  </span>
                  <Badge variant="blue">{enr.sectionId?.sectionName}</Badge>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">{enr.courseId?.title}</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Faculty: <strong>{enr.sectionId?.facultyId?.userId?.name || 'Staff'}</strong>
                  </p>
                </div>
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <span>Room: {enr.sectionId?.roomNumber || 'TBA'}</span>
                  <span>{enr.courseId?.credits} Credits</span>
                </div>
              </div>
            </Card>
          ))}
          {enrolments.length === 0 && (
            <div className="col-span-full bg-white p-8 rounded-xl border border-gray-200 text-center text-sm text-gray-400">
              You are currently not enrolled in any course sections.
            </div>
          )}
        </div>
      </div>

      {/* Campus Announcements */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-[#1e2a5e]" />
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Campus & Course Notices</h3>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <div className="divide-y divide-gray-100">
            {announcements.map((a: any) => (
              <div key={a._id} className="p-4 hover:bg-slate-50/50 transition-colors flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-gray-900">{a.title}</span>
                    <Badge variant={a.scope === 'UNIVERSITY' ? 'blue' : a.scope === 'COURSE' ? 'green' : 'purple'}>
                      {a.scope}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2">{a.content}</p>
                </div>
                <span className="text-[11px] text-gray-400 whitespace-nowrap">
                  {new Date(a.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
            {announcements.length === 0 && (
              <p className="p-6 text-center text-sm text-gray-400">No active notices for your cohort.</p>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default StudentDashboard;
