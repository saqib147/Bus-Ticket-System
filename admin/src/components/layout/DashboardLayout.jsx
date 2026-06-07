import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { cn } from '@/utils/cn';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/users': 'User Management',
  '/operators': 'Operator Management',
  '/buses': 'Bus Management',
  '/routes': 'Route Management',
  '/schedules': 'Schedule Management',
  '/bookings': 'Bookings',
  '/reports': 'Reports',
  '/settings': 'Settings',
};

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'BusGo Admin';

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <Topbar title={title} sidebarCollapsed={collapsed} />
      <main
        className={cn(
          'min-h-screen px-6 pb-6 pt-20 transition-all',
          collapsed ? 'ml-[72px]' : 'ml-64'
        )}
      >
        <Outlet />
      </main>
    </div>
  );
}
