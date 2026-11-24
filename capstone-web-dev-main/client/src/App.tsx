import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import { ProtectedRoute } from './routes/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const SignupPage = lazy(() => import('./pages/auth/SignupPage'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Unauthorized = lazy(() => import('./pages/Unauthorized'));

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminStudents = lazy(() => import('./pages/admin/Students'));
const AdminFaculty = lazy(() => import('./pages/admin/Faculty'));
const AdminCourses = lazy(() => import('./pages/admin/Courses'));
const AdminSections = lazy(() => import('./pages/admin/Sections'));
const AdminEnrolments = lazy(() => import('./pages/admin/Enrolments'));
const AdminAttendance = lazy(() => import('./pages/admin/Attendance'));
const AdminAnnouncements = lazy(() => import('./pages/admin/Announcements'));
const AdminNotifications = lazy(() => import('./pages/admin/Notifications'));
const AdminReports = lazy(() => import('./pages/admin/Reports'));
const AdminAudit = lazy(() => import('./pages/admin/AuditLogs'));
const AdminProfile = lazy(() => import('./pages/admin/Profile'));

// Faculty pages
const FacultyDashboard = lazy(() => import('./pages/faculty/Dashboard'));
const FacultyCourses = lazy(() => import('./pages/faculty/Courses'));
const FacultySections = lazy(() => import('./pages/faculty/Sections'));
const FacultyStudents = lazy(() => import('./pages/faculty/Students'));
const MarkAttendance = lazy(() => import('./pages/faculty/MarkAttendance'));
const AttendanceHistory = lazy(() => import('./pages/faculty/AttendanceHistory'));
const AttendanceAnalytics = lazy(() => import('./pages/faculty/AttendanceAnalytics'));
const FacultyAnnouncements = lazy(() => import('./pages/faculty/Announcements'));
const FacultyNotifications = lazy(() => import('./pages/faculty/Notifications'));
const FacultyProfile = lazy(() => import('./pages/faculty/Profile'));

// Student pages
const StudentDashboard = lazy(() => import('./pages/student/Dashboard'));
const StudentCourses = lazy(() => import('./pages/student/Courses'));
const StudentAttendance = lazy(() => import('./pages/student/Attendance'));
const StudentTimetable = lazy(() => import('./pages/student/Timetable'));
const StudentAnnouncements = lazy(() => import('./pages/student/Announcements'));
const StudentNotifications = lazy(() => import('./pages/student/Notifications'));
const StudentProfile = lazy(() => import('./pages/student/Profile'));

const RootRedirect: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#1e2a5e]" />
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'ADMIN') return <Navigate to="/admin" replace />;
  if (user?.role === 'FACULTY') return <Navigate to="/faculty" replace />;
  return <Navigate to="/student" replace />;
};

const PageLoader = () => (
  <div className="flex items-center justify-center h-72">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1e2a5e]" />
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#1e2a5e]" />
            </div>
          }>
            <Routes>
              <Route path="/" element={<RootRedirect />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* Admin Routes */}
              <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/admin" element={<Suspense fallback={<PageLoader />}><AdminDashboard /></Suspense>} />
                  <Route path="/admin/students" element={<Suspense fallback={<PageLoader />}><AdminStudents /></Suspense>} />
                  <Route path="/admin/faculty" element={<Suspense fallback={<PageLoader />}><AdminFaculty /></Suspense>} />
                  <Route path="/admin/courses" element={<Suspense fallback={<PageLoader />}><AdminCourses /></Suspense>} />
                  <Route path="/admin/sections" element={<Suspense fallback={<PageLoader />}><AdminSections /></Suspense>} />
                  <Route path="/admin/enrolments" element={<Suspense fallback={<PageLoader />}><AdminEnrolments /></Suspense>} />
                  <Route path="/admin/attendance" element={<Suspense fallback={<PageLoader />}><AdminAttendance /></Suspense>} />
                  <Route path="/admin/announcements" element={<Suspense fallback={<PageLoader />}><AdminAnnouncements /></Suspense>} />
                  <Route path="/admin/notifications" element={<Suspense fallback={<PageLoader />}><AdminNotifications /></Suspense>} />
                  <Route path="/admin/reports" element={<Suspense fallback={<PageLoader />}><AdminReports /></Suspense>} />
                  <Route path="/admin/audit" element={<Suspense fallback={<PageLoader />}><AdminAudit /></Suspense>} />
                  <Route path="/admin/profile" element={<Suspense fallback={<PageLoader />}><AdminProfile /></Suspense>} />
                </Route>
              </Route>

              {/* Faculty Routes */}
              <Route element={<ProtectedRoute allowedRoles={['FACULTY']} />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/faculty" element={<Suspense fallback={<PageLoader />}><FacultyDashboard /></Suspense>} />
                  <Route path="/faculty/courses" element={<Suspense fallback={<PageLoader />}><FacultyCourses /></Suspense>} />
                  <Route path="/faculty/sections" element={<Suspense fallback={<PageLoader />}><FacultySections /></Suspense>} />
                  <Route path="/faculty/students" element={<Suspense fallback={<PageLoader />}><FacultyStudents /></Suspense>} />
                  <Route path="/faculty/attendance/mark" element={<Suspense fallback={<PageLoader />}><MarkAttendance /></Suspense>} />
                  <Route path="/faculty/attendance/history" element={<Suspense fallback={<PageLoader />}><AttendanceHistory /></Suspense>} />
                  <Route path="/faculty/attendance/analytics" element={<Suspense fallback={<PageLoader />}><AttendanceAnalytics /></Suspense>} />
                  <Route path="/faculty/announcements" element={<Suspense fallback={<PageLoader />}><FacultyAnnouncements /></Suspense>} />
                  <Route path="/faculty/notifications" element={<Suspense fallback={<PageLoader />}><FacultyNotifications /></Suspense>} />
                  <Route path="/faculty/profile" element={<Suspense fallback={<PageLoader />}><FacultyProfile /></Suspense>} />
                </Route>
              </Route>

              {/* Student Routes */}
              <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/student" element={<Suspense fallback={<PageLoader />}><StudentDashboard /></Suspense>} />
                  <Route path="/student/courses" element={<Suspense fallback={<PageLoader />}><StudentCourses /></Suspense>} />
                  <Route path="/student/attendance" element={<Suspense fallback={<PageLoader />}><StudentAttendance /></Suspense>} />
                  <Route path="/student/timetable" element={<Suspense fallback={<PageLoader />}><StudentTimetable /></Suspense>} />
                  <Route path="/student/announcements" element={<Suspense fallback={<PageLoader />}><StudentAnnouncements /></Suspense>} />
                  <Route path="/student/notifications" element={<Suspense fallback={<PageLoader />}><StudentNotifications /></Suspense>} />
                  <Route path="/student/profile" element={<Suspense fallback={<PageLoader />}><StudentProfile /></Suspense>} />
                </Route>
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
