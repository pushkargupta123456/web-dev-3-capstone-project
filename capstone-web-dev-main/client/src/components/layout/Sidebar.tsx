import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, GraduationCap, BookOpen, Layers, ClipboardList,
  Megaphone, Bell, FileText, Settings, LogOut,
  UserCheck, CalendarDays, TrendingUp, Shield
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { clsx } from 'clsx';

const adminNav = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/admin' },
  { label: 'Students', icon: GraduationCap, to: '/admin/students' },
  { label: 'Faculty', icon: Users, to: '/admin/faculty' },
  { label: 'Courses', icon: BookOpen, to: '/admin/courses' },
  { label: 'Sections', icon: Layers, to: '/admin/sections' },
  { label: 'Enrolments', icon: ClipboardList, to: '/admin/enrolments' },
  { label: 'Attendance', icon: UserCheck, to: '/admin/attendance' },
  { label: 'Announcements', icon: Megaphone, to: '/admin/announcements' },
  { label: 'Reports', icon: FileText, to: '/admin/reports' },
  { label: 'Notifications', icon: Bell, to: '/admin/notifications' },
  { label: 'Audit Logs', icon: Shield, to: '/admin/audit' },
  { label: 'Settings', icon: Settings, to: '/admin/profile' },
];

const facultyNav = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/faculty' },
  { label: 'My Courses', icon: BookOpen, to: '/faculty/courses' },
  { label: 'My Sections', icon: Layers, to: '/faculty/sections' },
  { label: 'Students', icon: GraduationCap, to: '/faculty/students' },
  { label: 'Mark Attendance', icon: UserCheck, to: '/faculty/attendance/mark' },
  { label: 'Attendance History', icon: CalendarDays, to: '/faculty/attendance/history' },
  { label: 'Analytics', icon: TrendingUp, to: '/faculty/attendance/analytics' },
  { label: 'Announcements', icon: Megaphone, to: '/faculty/announcements' },
  { label: 'Notifications', icon: Bell, to: '/faculty/notifications' },
  { label: 'Profile', icon: Settings, to: '/faculty/profile' },
];

const studentNav = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/student' },
  { label: 'My Courses', icon: BookOpen, to: '/student/courses' },
  { label: 'My Attendance', icon: UserCheck, to: '/student/attendance' },
  { label: 'Timetable', icon: CalendarDays, to: '/student/timetable' },
  { label: 'Announcements', icon: Megaphone, to: '/student/announcements' },
  { label: 'Notifications', icon: Bell, to: '/student/notifications' },
  { label: 'My Profile', icon: Settings, to: '/student/profile' },
];

export const Sidebar: React.FC<{ isOpen: boolean; onToggle: () => void }> = ({ isOpen, onToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = user?.role === 'ADMIN' ? adminNav : user?.role === 'FACULTY' ? facultyNav : studentNav;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-20 bg-black/50 backdrop-blur-xs lg:hidden" onClick={onToggle} />
      )}

      <aside className={clsx(
        'fixed left-0 top-0 h-full z-30 bg-[#082B5C] flex flex-col transition-all duration-300 shadow-2xl border-r border-[#061F45]',
        isOpen ? 'w-64' : 'w-0 lg:w-16 overflow-hidden'
      )}>
        {/* Sidebar Brand Header */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10 min-h-[72px] bg-[#061F45]">
          <img
            src="/assets/krmu-crest.png"
            alt="KRMU Emblem"
            className="w-9 h-9 object-contain flex-shrink-0 drop-shadow"
          />
          {isOpen && (
            <div className="overflow-hidden">
              <p className="text-white font-extrabold text-xs tracking-tight leading-tight">K.R. MANGALAM</p>
              <p className="text-red-400 font-bold text-[10px] tracking-wider uppercase leading-none">UNIVERSITY</p>
              <p className="text-blue-300/80 text-[8px] font-medium tracking-widest uppercase mt-0.5">THE COMPLETE WORLD</p>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin' || item.to === '/faculty' || item.to === '/student'}
              className={({ isActive }) => clsx(
                'flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-xl transition-all',
                isActive
                  ? 'bg-[#1261D5] text-white shadow-md'
                  : 'text-blue-200/80 hover:bg-white/10 hover:text-white'
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {isOpen && <span className="truncate">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Excellence Badge */}
        {isOpen && (
          <div className="p-3 mx-2 mb-2 rounded-2xl bg-white/5 border border-white/10 text-center">
            <GraduationCap className="w-5 h-5 text-blue-300 mx-auto mb-1" />
            <p className="text-[11px] font-bold text-white leading-tight">Academic Excellence</p>
            <p className="text-[9px] text-blue-300/80 uppercase tracking-wider">Since 2013</p>
          </div>
        )}

        {/* User Info & Logout */}
        <div className="border-t border-white/10 p-3 bg-[#061F45]">
          {isOpen && (
            <div className="mb-2 px-2 py-1">
              <p className="text-white text-xs font-semibold truncate">{user?.name}</p>
              <p className="text-blue-300 text-[10px] truncate uppercase tracking-wider font-medium">{user?.role}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-2 py-2 text-xs font-medium text-rose-300 hover:text-white hover:bg-rose-600/30 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {isOpen && 'Sign Out'}
          </button>
        </div>
      </aside>
    </>
  );
};
