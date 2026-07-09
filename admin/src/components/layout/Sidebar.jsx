import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard,
  Users,
  UserCog,
  Bus,
  Route,
  Calendar,
  Ticket,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/Button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { selectCurrentUser } from '@/store/slices/authSlice';
import { logout } from '@/store/slices/authSlice';
import { useLogoutMutation } from '@/store/api/adminApi';

const adminNav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/users', label: 'Users', icon: Users },
  { to: '/operators', label: 'Operators', icon: UserCog },
  { to: '/buses', label: 'Buses', icon: Bus },
  { to: '/routes', label: 'Routes', icon: Route },
  { to: '/schedules', label: 'Schedules', icon: Calendar },
  { to: '/bookings', label: 'Bookings', icon: Ticket },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const operatorNav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/buses', label: 'Buses', icon: Bus },
  { to: '/routes', label: 'Routes', icon: Route },
  { to: '/schedules', label: 'Schedules', icon: Calendar },
  { to: '/bookings', label: 'Bookings', icon: Ticket },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ collapsed, onToggle }) {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutApi] = useLogoutMutation();

  const navItems =
    user?.role === 'admin'
      ? adminNav
      : user?.operatorStatus === 'approved'
        ? operatorNav
        : [
            { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { to: '/settings', label: 'Settings', icon: Settings },
          ];

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch {
      // proceed with local logout
    }
    dispatch(logout());
    navigate('/auth/login');
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ duration: 0.2 }}
      className="fixed left-0 top-0 z-40 flex h-screen flex-col border-r bg-card"
    >
      <div className="flex h-16 items-center justify-between border-b px-4">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <Bus className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">BusGo</span>
            </motion.div>
          )}
        </AnimatePresence>
        <Button variant="ghost" size="icon" onClick={onToggle}>
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )
            }
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="border-t p-3">
        <div className={cn('flex items-center gap-3 mb-3', collapsed && 'justify-center')}>
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.profilePicture} alt={user?.name} />
            <AvatarFallback>{user?.name?.charAt(0)?.toUpperCase()}</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          className={cn('w-full justify-start gap-3', collapsed && 'justify-center px-0')}
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && 'Logout'}
        </Button>
      </div>
    </motion.aside>
  );
}
