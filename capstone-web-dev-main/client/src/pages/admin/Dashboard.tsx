import React, { useEffect, useState } from 'react';
import { 
  GraduationCap, Users, BookOpen, Layers, ClipboardList, 
  UserCheck, Megaphone, ArrowUpRight, School, Sparkles
} from 'lucide-react';
import { dashboardService } from '../../services/api';
import { StatCard, Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';

const COLORS = ['#082B5C', '#1261D5', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.getAdmin()
      .then(res => setData(res.data.data))
      .catch(err => console.error('Failed to load dashboard:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-44 bg-white rounded-3xl border border-slate-200" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 bg-white rounded-2xl border border-slate-200" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-white rounded-2xl border border-slate-200" />
          <div className="h-80 bg-white rounded-2xl border border-slate-200" />
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const deptData = (data?.departmentDistribution || []).map((d: any) => ({
    name: d._id || 'Unknown',
    students: d.count,
  }));

  const courseData = (data?.courseEnrolmentStats || []).map((c: any) => ({
    name: c.course?.courseCode || 'Course',
    value: c.count,
  }));

  return (
    <div className="space-y-6">
      {/* K.R. Mangalam University Hero Banner (As in Reference) */}
      <div className="relative rounded-3xl overflow-hidden shadow-lg border border-slate-200 bg-[#082B5C] min-h-[170px] flex items-center">
        <img
          src="/assets/krmu-campus-pan.jpg"
          alt="KRMU Campus Panorama"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-30 filter saturate-150"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#061F45] via-[#082B5C]/90 to-transparent" />

        <div className="relative z-10 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold uppercase tracking-wider">
                Gurugram Campus • Academic Year 2024–2025
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              K.R. Mangalam University Campus Management System
            </h1>
            <p className="text-blue-100/90 text-sm mt-1 max-w-2xl">
              Empowering Education. Enriching Lives. — Dream • Learn • Achieve
            </p>
          </div>

          <div className="hidden lg:flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-2xl text-white">
            <School className="w-8 h-8 text-blue-300" />
            <div className="text-right">
              <p className="text-xs font-bold leading-tight">Accredited Grade 'A'</p>
              <p className="text-[10px] text-blue-200">State University, HR</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stat Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="Students"
          value={stats.totalStudents ?? 0}
          icon={<GraduationCap className="w-5 h-5 text-[#1261D5]" />}
          color="bg-blue-50"
        />
        <StatCard
          title="Faculty"
          value={stats.totalFaculty ?? 0}
          icon={<Users className="w-5 h-5 text-emerald-600" />}
          color="bg-emerald-50"
        />
        <StatCard
          title="Courses"
          value={stats.totalCourses ?? 0}
          icon={<BookOpen className="w-5 h-5 text-indigo-600" />}
          color="bg-indigo-50"
        />
        <StatCard
          title="Sections"
          value={stats.totalSections ?? 0}
          icon={<Layers className="w-5 h-5 text-purple-600" />}
          color="bg-purple-50"
        />
        <StatCard
          title="Enrolments"
          value={stats.totalEnrolments ?? 0}
          icon={<ClipboardList className="w-5 h-5 text-amber-600" />}
          color="bg-amber-50"
        />
        <StatCard
          title="Avg Attendance"
          value={`${stats.averageAttendance ?? 0}%`}
          icon={<UserCheck className="w-5 h-5 text-teal-600" />}
          color="bg-teal-50"
        />
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-sm font-bold text-[#082B5C] uppercase tracking-wider">
              Student Distribution by Department
            </h3>
          </CardHeader>
          <CardBody>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="students" fill="#082B5C" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-sm font-bold text-[#082B5C] uppercase tracking-wider">
              Course Enrolment Density
            </h3>
          </CardHeader>
          <CardBody>
            <div className="h-64 flex items-center justify-center">
              {courseData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={courseData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {courseData.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-gray-400">No enrolment data recorded</p>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Recent Announcements */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-[#082B5C]" />
            <h3 className="text-sm font-bold text-[#082B5C] uppercase tracking-wider">
              Active Campus Announcements
            </h3>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <div className="divide-y divide-gray-100">
            {(data?.recentAnnouncements || []).map((a: any) => (
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
                <div className="text-right flex-shrink-0">
                  <span className="text-[11px] text-gray-400 block">{new Date(a.createdAt).toLocaleDateString()}</span>
                  <span className="text-[11px] text-gray-500 font-medium">{a.postedBy?.name || 'Administrator'}</span>
                </div>
              </div>
            ))}
            {(!data?.recentAnnouncements || data.recentAnnouncements.length === 0) && (
              <p className="p-6 text-center text-sm text-gray-400">No recent announcements</p>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default AdminDashboard;
