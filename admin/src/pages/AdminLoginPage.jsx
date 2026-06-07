import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Bus, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { setCredentials } from '@/store/slices/authSlice';
import { useLoginMutation } from '@/store/api/adminApi';
import { setAuthToken } from '@/utils/axios';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const from = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    document.title = 'Login - BusGo Admin';
  }, []);

  const onSubmit = async (data) => {
    try {
      const result = await login(data).unwrap();
      const { user, accessToken } = result.data;

      if (user.role !== 'admin' && user.role !== 'operator') {
        toast.error('Access denied. Admin or operator account required.');
        return;
      }

      dispatch(setCredentials({ user, accessToken }));
      setAuthToken(accessToken);

      if (user.role === 'operator' && user.operatorStatus === 'pending') {
        toast('Your operator account is pending admin approval.', { icon: '⏳' });
      } else if (user.role === 'operator' && user.operatorStatus === 'rejected') {
        toast.error('Your operator application was rejected.');
        return;
      } else {
        toast.success(`Welcome back, ${user.name}!`);
      }

      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Bus className="h-7 w-7 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">BusGo Admin</CardTitle>
            <CardDescription>Sign in to manage your bus operations</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@busgo.com"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Demo: admin@busgo.com / Admin@123 or operator1@busgo.com / Op@123
            <br />
            Operators &amp; admins: use the admin panel at {import.meta.env.VITE_ADMIN_URL || 'http://localhost:5174'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
