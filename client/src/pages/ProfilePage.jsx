import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSelector, useDispatch } from 'react-redux';
import api from '@/utils/axios';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { updateUser } from '@/store/slices/authSlice';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import toast from 'react-hot-toast';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

function ProfileContent() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name || '', phone: user?.phone || '' },
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSubmit = async (data) => {
    try {
      const response = await api.patch('/users/profile', data);
      dispatch(updateUser(response.data.data.user));
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const onPasswordSubmit = async ({ currentPassword, newPassword }) => {
    try {
      await api.patch('/users/change-password', { currentPassword, newPassword });
      toast.success('Password changed');
      passwordForm.reset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password change failed');
    }
  };

  const onAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await api.patch('/users/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      dispatch(updateUser(response.data.data.user));
      toast.success('Avatar updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Avatar upload failed');
    }
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-24">
      <h1 className="mb-8 text-2xl font-bold">Profile Settings</h1>

      <div className="mb-8 flex items-center gap-4">
        <Avatar
          src={user?.profilePicture}
          fallback={user?.name?.charAt(0)?.toUpperCase()}
          className="h-20 w-20"
        />
        <div>
          <p className="font-semibold">{user?.name}</p>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          <label className="mt-2 inline-block cursor-pointer text-sm text-primary hover:underline">
            Change photo
            <input type="file" accept="image/*" className="hidden" onChange={onAvatarChange} />
          </label>
        </div>
      </div>

      <Tabs defaultValue="profile">
        {({ active, setActive }) => (
          <>
            <TabsList>
              <TabsTrigger value="profile" active={active} setActive={setActive}>Profile</TabsTrigger>
              <TabsTrigger value="password" active={active} setActive={setActive}>Password</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" active={active} className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your account details</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" {...profileForm.register('name')} />
                      {profileForm.formState.errors.name && (
                        <p className="text-sm text-destructive">{profileForm.formState.errors.name.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" {...profileForm.register('phone')} />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input value={user?.email} disabled />
                    </div>
                    <Button type="submit">Save Changes</Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="password" active={active} className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Ensure your account stays secure</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input id="currentPassword" type="password" {...passwordForm.register('currentPassword')} />
                      {passwordForm.formState.errors.currentPassword && (
                        <p className="text-sm text-destructive">{passwordForm.formState.errors.currentPassword.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input id="newPassword" type="password" {...passwordForm.register('newPassword')} />
                      {passwordForm.formState.errors.newPassword && (
                        <p className="text-sm text-destructive">{passwordForm.formState.errors.newPassword.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input id="confirmPassword" type="password" {...passwordForm.register('confirmPassword')} />
                      {passwordForm.formState.errors.confirmPassword && (
                        <p className="text-sm text-destructive">{passwordForm.formState.errors.confirmPassword.message}</p>
                      )}
                    </div>
                    <Button type="submit">Update Password</Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
