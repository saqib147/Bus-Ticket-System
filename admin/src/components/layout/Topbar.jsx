import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Bell, ChevronDown, Settings, User } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/Button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { selectCurrentUser } from '@/store/slices/authSlice';
import { useGetPendingOperatorsQuery } from '@/store/api/adminApi';

export default function Topbar({ title, sidebarCollapsed }) {
  const user = useSelector(selectCurrentUser);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const { data: pendingData } = useGetPendingOperatorsQuery(undefined, {
    skip: user?.role !== 'admin',
  });

  const pendingCount = pendingData?.data?.operators?.length || 0;

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur px-6 transition-all',
        sidebarCollapsed ? 'left-[72px]' : 'left-64'
      )}
    >
      <h1 className="text-xl font-semibold">{title}</h1>

      <div className="flex items-center gap-4">
        {user?.role === 'admin' && (
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => navigate('/operators')}
          >
            <Bell className="h-5 w-5" />
            {pendingCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
              >
                {pendingCount}
              </Badge>
            )}
          </Button>
        )}

        <div className="relative">
          <Button
            variant="ghost"
            className="flex items-center gap-2"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.profilePicture} alt={user?.name} />
              <AvatarFallback>{user?.name?.charAt(0)?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="hidden sm:inline text-sm font-medium">{user?.name}</span>
            <ChevronDown className="h-4 w-4" />
          </Button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-48 rounded-md border bg-popover bg-background shadow-lg z-50 py-1">
                <button
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-accent"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate('/settings');
                  }}
                >
                  <User className="h-4 w-4" />
                  Profile
                </button>
                <button
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-accent"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate('/settings');
                  }}
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
