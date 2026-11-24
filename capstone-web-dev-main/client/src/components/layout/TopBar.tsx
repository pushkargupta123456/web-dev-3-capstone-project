import React from 'react';
import { Menu, Bell } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

interface TopBarProps {
  onMenuToggle: () => void;
  sidebarOpen: boolean;
  title?: string;
}

export const TopBar: React.FC<TopBarProps> = ({ onMenuToggle, sidebarOpen, title }) => {
  const { user } = useAuth();
  const notificationLink =
    user?.role === 'ADMIN'
      ? '/admin/notifications'
      : user?.role === 'FACULTY'
      ? '/faculty/notifications'
      : '/student/notifications';
  const profileLink =
    user?.role === 'ADMIN'
      ? '/admin/profile'
      : user?.role === 'FACULTY'
      ? '/faculty/profile'
      : '/student/profile';

  return (
    <header
      className={`h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 fixed top-0 right-0 z-10 transition-all duration-300 ${
        sidebarOpen ? 'left-0 lg:left-64' : 'left-0 lg:left-16'
      }`}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        {title && <h1 className="text-base font-bold text-[#082B5C] hidden sm:block">{title}</h1>}
      </div>

      <div className="flex items-center gap-3">
        <Link
          to={notificationLink}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 relative transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-2 right-2 ring-2 ring-white" />
        </Link>

        <div className="h-6 w-px bg-slate-200 mx-1" />

        <Link to={profileLink} className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-900 leading-tight">{user?.name}</p>
            <p className="text-[10px] font-semibold text-[#1261D5] uppercase tracking-wider">
              {user?.role}
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#082B5C] text-white flex items-center justify-center font-bold text-xs shadow-md shadow-blue-950/20">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
        </Link>
      </div>
    </header>
  );
};

export default TopBar;
