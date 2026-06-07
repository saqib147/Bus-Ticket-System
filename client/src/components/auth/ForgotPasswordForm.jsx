import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { useForgotPasswordMutation } from '@/store/api/authApi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import toast from 'react-hot-toast';

const schema = z.object({
  email: z.string().email('Valid email is required'),
});

export default function ForgotPasswordForm() {
  const [forgotPassword, { isLoading, isSuccess }] = useForgotPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    try {
      await forgotPassword(data).unwrap();
      toast.success('If that email exists, a reset link has been sent');
    } catch (err) {
      toast.error(err.data?.message || 'Request failed');
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Forgot password</CardTitle>
        <CardDescription>
          Enter your email and we&apos;ll send you a reset link
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {isSuccess && (
            <p className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">
              Check your email for a password reset link.
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </Button>
          <Link to="/auth/login" className="text-sm text-primary hover:underline">
            Back to login
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}
