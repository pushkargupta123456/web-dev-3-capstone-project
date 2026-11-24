import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { TopBar } from '../components/layout/TopBar';

const pageTitleMap: Record<string, string> = {
  admin: 'Administrator Overview',
  students: 'Student Directory',
  faculty: 'Faculty Directory',
  courses: 'Course Catalog',
  sections: 'Academic Sections',
  enrolments: 'Student Enrolments',
  attendance: 'Campus Attendance Monitoring',
  announcements: 'Campus Announcements',
  notifications: 'Notification Center',
  reports: 'System & Academic Reports',
  audit: 'Security Audit Logs',
  profile: 'Account Profile & Security',
  timetable: 'Weekly Schedule & Timetable',
  mark: 'Mark Class Attendance',
  history: 'Attendance History',
  analytics: 'Attendance Performance Analytics',
};

const getTitle = (pathname: string): string => {
  const parts = pathname.split('/').filter(Boolean);
  const last = parts[parts.length - 1] || 'dashboard';
  return pageTitleMap[last] || (last.charAt(0).toUpperCase() + last.slice(1));
};

const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const title = getTitle(location.pathname);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <TopBar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} title={title} />
      <main className={`transition-all duration-300 pt-16 min-h-screen ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}`}>
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
