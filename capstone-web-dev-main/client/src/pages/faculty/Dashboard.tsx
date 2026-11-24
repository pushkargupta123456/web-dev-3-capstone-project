import React, { useEffect, useState } from 'react';
import { 
  BookOpen, Layers, Users, CalendarDays, UserCheck, 
  Megaphone, ArrowRight 
} from 'lucide-react';
import { dashboardService } from '../../services/api';
import { StatCard, Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Link } from 'react-router-dom';

const FacultyDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.getFaculty()
      .then(res => setData(res.data.data))
      .catch(err => console.error('Failed to load faculty dashboard:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-white rounded-xl border border-gray-200" />
          ))}
        </div>
        <div className="h-64 bg-white rounded-xl border border-gray-200" />
      </div>
    );
  }

  const stats = data?.stats || {};
  const sections = data?.sections || [];
  const announcements = data?.recentAnnouncements || [];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Sections"
          value={stats.totalSections ?? 0}
          icon={<Layers className="w-5 h-5 text-blue-600" />}
          color="bg-blue-50"
        />
        <StatCard
          title="Total Students"
          value={stats.totalStudents ?? 0}
          icon={<Users className="w-5 h-5 text-emerald-600" />}
          color="bg-emerald-50"
        />
        <StatCard
          title="Lectures Delivered"
          value={stats.totalSessions ?? 0}
          icon={<CalendarDays className="w-5 h-5 text-purple-600" />}
          color="bg-purple-50"
        />
        <StatCard
          title="Unread Alerts"
          value={stats.unreadNotifications ?? 0}
          icon={<UserCheck className="w-5 h-5 text-amber-600" />}
          color="bg-amber-50"
        />
      </div>

      {/* Quick Action Banner */}
      <div className="bg-gradient-to-r from-[#1e2a5e] to-[#2b3a80] rounded-xl p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div>
          <h3 className="font-bold text-base">Ready for Today's Class Session?</h3>
          <p className="text-xs text-blue-200/90 mt-1">Take student roll call and mark attendance in real-time</p>
        </div>
        <Link to="/faculty/attendance/mark">
          <Button variant="secondary" icon={<ArrowRight className="w-4 h-4" />}>
            Mark Attendance Now
          </Button>
        </Link>
      </div>

      {/* Assigned Sections Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">My Active Teaching Sections</h3>
          <Link to="/faculty/sections" className="text-xs font-semibold text-blue-700 hover:underline">
            View All
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map((sec: any) => (
            <Card key={sec._id}>
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#1e2a5e] bg-blue-50 px-2 py-0.5 rounded">
                    {sec.courseId?.courseCode}
                  </span>
                  <Badge variant="blue">{sec.sectionName}</Badge>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">{sec.courseId?.title}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Location: {sec.roomNumber || 'TBA'}</p>
                </div>
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-500">{sec.academicYear} (Sem {sec.semester})</span>
                  <Link
                    to={`/faculty/attendance/mark?sectionId=${sec._id}`}
                    className="text-xs font-bold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1"
                  >
                    Attendance <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </Card>
          ))}
          {sections.length === 0 && (
            <div className="col-span-full bg-white p-8 rounded-xl border border-gray-200 text-center text-sm text-gray-400">
              No sections assigned for the current academic session.
            </div>
          )}
        </div>
      </div>

      {/* Recent Announcements */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-[#1e2a5e]" />
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Campus & Departmental Notices</h3>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <div className="divide-y divide-gray-100">
            {announcements.map((a: any) => (
              <div key={a._id} className="p-4 hover:bg-slate-50/50 transition-colors flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-gray-900">{a.title}</span>
                    <Badge variant={a.scope === 'UNIVERSITY' ? 'blue' : 'green'}>{a.scope}</Badge>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2">{a.content}</p>
                </div>
                <span className="text-[11px] text-gray-400 whitespace-nowrap">
                  {new Date(a.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
            {announcements.length === 0 && (
              <p className="p-6 text-center text-sm text-gray-400">No active notices</p>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default FacultyDashboard;
