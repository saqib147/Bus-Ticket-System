import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useLoginMutation, useLogoutMutation } from '@/store/api/authApi';
import { logout } from '@/store/slices/authSlice';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import toast from 'react-hot-toast';

const schema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required'),
});

export default function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const [logoutApi] = useLogoutMutation();
  const from = location.state?.from?.pathname || '/dashboard';
  const wrongRole = location.state?.wrongRole;
  const adminUrl = import.meta.env.VITE_ADMIN_URL || 'http://localhost:5174';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    try {
      const result = await login(data).unwrap();
      const user = result.data?.user;

      if (user?.role === 'admin' || user?.role === 'operator') {
        try {
          await logoutApi().unwrap();
        } catch {
          // ignore
        }
        dispatch(logout());
        toast.error(
          user.role === 'operator'
            ? `Operators must sign in at the admin panel: ${adminUrl}`
            : `Admins must sign in at the admin panel: ${adminUrl}`
        );
        return;
      }

      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.data?.message || 'Login failed');
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Sign in to your BusGo account</CardDescription>
      </CardHeader>
      {wrongRole && (
        <div className="mx-6 mb-2 rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          You&apos;re signed in as an <strong>{wrongRole}</strong>. Please sign in with a passenger account to continue.
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>
          <Link to="/auth/forgot-password" className="text-sm text-primary hover:underline">
            Forgot password?
          </Link>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link to="/auth/register" className="text-primary hover:underline">Sign up</Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
