import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bus, Menu, User, LogOut, LayoutDashboard, Ticket } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Sheet, SheetHeader, SheetContent } from '@/components/ui/Sheet';
import { Dropdown, DropdownItem, DropdownTrigger } from '@/components/ui/Dropdown';
import { useLogoutMutation } from '@/store/api/authApi';
import { logout as logoutAction } from '@/store/slices/authSlice';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/search', label: 'Search Buses' },
  { to: '/dashboard', label: 'Dashboard', auth: true },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutApi] = useLogoutMutation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch {
      // still clear local state
    }
    dispatch(logoutAction());
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      className={cn(
        'fixed top-0 z-40 w-full transition-all duration-300',
        scrolled ? 'bg-background/95 shadow-md backdrop-blur-md' : 'bg-transparent'
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-primary">
          <Bus className="h-7 w-7" />
          <span className="text-xl">BusGo</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks
            .filter((link) => !link.auth || isAuthenticated)
            .map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    'text-sm font-medium transition-colors hover:text-primary',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <Dropdown
              trigger={
                <button className="flex items-center gap-2 rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar
                    src={user?.profilePicture}
                    fallback={user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  />
                  <span className="text-sm font-medium">{user?.name?.split(' ')[0]}</span>
                </button>
              }
              align="end"
            >
              {({ close }) => (
                <>
                  <DropdownItem
                    onClick={() => {
                      navigate('/dashboard');
                      close();
                    }}
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4 inline" />
                    Dashboard
                  </DropdownItem>
                  <DropdownItem
                    onClick={() => {
                      navigate('/dashboard/bookings');
                      close();
                    }}
                  >
                    <Ticket className="mr-2 h-4 w-4 inline" />
                    My Bookings
                  </DropdownItem>
                  <DropdownItem
                    onClick={() => {
                      navigate('/dashboard/profile');
                      close();
                    }}
                  >
                    <User className="mr-2 h-4 w-4 inline" />
                    Profile
                  </DropdownItem>
                  <DropdownItem onClick={() => { handleLogout(); close(); }}>
                    <LogOut className="mr-2 h-4 w-4 inline" />
                    Logout
                  </DropdownItem>
                </>
              )}
            </Dropdown>
          ) : (
            <>
              <Link to="/auth/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/auth/register">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </div>

        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(true)}>
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen} side="right">
        <SheetHeader
          title="Menu"
          onClose={() => setMobileOpen(false)}
        />
        <SheetContent className="flex flex-col gap-4">
          {navLinks
            .filter((link) => !link.auth || isAuthenticated)
            .map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-lg font-medium"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          {!isAuthenticated ? (
            <>
              <Link to="/auth/login" onClick={() => setMobileOpen(false)}>
                <Button variant="outline" className="w-full">Login</Button>
              </Link>
              <Link to="/auth/register" onClick={() => setMobileOpen(false)}>
                <Button className="w-full">Sign Up</Button>
              </Link>
            </>
          ) : (
            <Button variant="destructive" className="w-full" onClick={handleLogout}>
              Logout
            </Button>
          )}
        </SheetContent>
      </Sheet>
    </motion.header>
  );
}
