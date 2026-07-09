import { formatCurrency } from '@/utils/currency';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/store/slices/authSlice';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/Dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  useGetSchedulesQuery,
  useGetMyBusesQuery,
  useGetRoutesQuery,
  useCreateScheduleMutation,
  useUpdateScheduleMutation,
  useDeleteScheduleMutation,
} from '@/store/api/adminApi';

const scheduleSchema = z.object({
  busId: z.string().min(1, 'Bus is required'),
  routeId: z.string().min(1, 'Route is required'),
  departureTime: z.string().min(1, 'Departure time is required'),
  arrivalTime: z.string().min(1, 'Arrival time is required'),
  fare: z.coerce.number().min(0),
  date: z.string().min(1, 'Date is required'),
  status: z.enum(['scheduled', 'departed', 'arrived', 'cancelled']).optional(),
});

const statusVariant = {
  scheduled: 'default',
  departed: 'warning',
  arrived: 'success',
  cancelled: 'destructive',
};

export default function ScheduleManagementPage() {
  const user = useSelector(selectCurrentUser);
  const isAdmin = user?.role === 'admin';

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);

  const { data, isLoading } = useGetSchedulesQuery({});
  const { data: busesData } = useGetMyBusesQuery();
  const { data: routesData } = useGetRoutesQuery({});
  const [createSchedule, { isLoading: creating }] = useCreateScheduleMutation();
  const [updateSchedule, { isLoading: updating }] = useUpdateScheduleMutation();
  const [deleteSchedule, { isLoading: deleting }] = useDeleteScheduleMutation();

  const schedules = data?.data?.schedules || [];
  const buses = busesData?.data?.buses || [];
  const routes = routesData?.data?.routes || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      busId: '',
      routeId: '',
      departureTime: '',
      arrivalTime: '',
      fare: 0,
      date: '',
      status: 'scheduled',
    },
  });

  const openCreate = () => {
    setEditingSchedule(null);
    reset({
      busId: buses[0]?._id || '',
      routeId: routes[0]?._id || '',
      departureTime: '06:00',
      arrivalTime: '14:00',
      fare: 500,
      date: format(new Date(), 'yyyy-MM-dd'),
      status: 'scheduled',
    });
    setDialogOpen(true);
  };

  const openEdit = (schedule) => {
    setEditingSchedule(schedule);
    reset({
      busId: schedule.busId?._id || schedule.busId,
      routeId: schedule.routeId?._id || schedule.routeId,
      departureTime: schedule.departureTime,
      arrivalTime: schedule.arrivalTime,
      fare: schedule.fare,
      date: format(new Date(schedule.date), 'yyyy-MM-dd'),
      status: schedule.status,
    });
    setDialogOpen(true);
  };

  const onSubmit = async (formData) => {
    const payload = {
      ...formData,
      date: new Date(formData.date).toISOString(),
    };

    try {
      if (editingSchedule) {
        await updateSchedule({ id: editingSchedule._id, ...payload }).unwrap();
        toast.success('Schedule updated successfully');
      } else {
        await createSchedule(payload).unwrap();
        toast.success('Schedule created successfully');
      }
      setDialogOpen(false);
    } catch (err) {
      toast.error(err.data?.message || 'Failed to save schedule');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Cancel this schedule?')) return;
    try {
      await deleteSchedule(id).unwrap();
      toast.success('Schedule cancelled');
    } catch (err) {
      toast.error(err.data?.message || 'Failed to cancel schedule');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Manage Schedules</h2>
        {isAdmin && (
          <Button onClick={openCreate} disabled={!buses.length || !routes.length}>
            <Plus className="h-4 w-4 mr-2" />
            Add Schedule
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Schedules</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Bus</TableHead>
                  <TableHead>Departure</TableHead>
                  <TableHead>Fare</TableHead>
                  <TableHead>Seats</TableHead>
                  <TableHead>Status</TableHead>
                  {isAdmin && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.map((schedule) => (
                  <TableRow key={schedule._id}>
                    <TableCell>
                      {format(new Date(schedule.date), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      {schedule.routeId?.source} → {schedule.routeId?.destination}
                    </TableCell>
                    <TableCell>{schedule.busId?.name || schedule.busId?.busNumber}</TableCell>
                    <TableCell>{schedule.departureTime}</TableCell>
                    <TableCell>{formatCurrency(schedule.fare)}</TableCell>
                    <TableCell>{schedule.availableSeats}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[schedule.status] || 'outline'}>
                        {schedule.status}
                      </Badge>
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => openEdit(schedule)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {schedule.status !== 'cancelled' && (
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={deleting}
                              onClick={() => handleDelete(schedule._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {schedules.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 8 : 7} className="text-center text-muted-foreground">
                      No schedules yet. Add your first schedule.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent onClose={() => setDialogOpen(false)} className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingSchedule ? 'Edit Schedule' : 'Add New Schedule'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Bus</Label>
                <Select {...register('busId')}>
                  <option value="">Select bus</option>
                  {buses.map((bus) => (
                    <option key={bus._id} value={bus._id}>
                      {bus.busNumber} - {bus.name}
                    </option>
                  ))}
                </Select>
                {errors.busId && (
                  <p className="text-sm text-destructive">{errors.busId.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Route</Label>
                <Select {...register('routeId')}>
                  <option value="">Select route</option>
                  {routes.map((route) => (
                    <option key={route._id} value={route._id}>
                      {route.source} → {route.destination}
                    </option>
                  ))}
                </Select>
                {errors.routeId && (
                  <p className="text-sm text-destructive">{errors.routeId.message}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Departure Time</Label>
                <Input type="time" {...register('departureTime')} />
              </div>
              <div className="space-y-2">
                <Label>Arrival Time</Label>
                <Input type="time" {...register('arrivalTime')} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" {...register('date')} />
              </div>
              <div className="space-y-2">
                <Label>Fare (PKR)</Label>
                <Input type="number" {...register('fare')} />
              </div>
            </div>
            {editingSchedule && (
              <div className="space-y-2">
                <Label>Status</Label>
                <Select {...register('status')}>
                  <option value="scheduled">Scheduled</option>
                  <option value="departed">Departed</option>
                  <option value="arrived">Arrived</option>
                  <option value="cancelled">Cancelled</option>
                </Select>
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={creating || updating}>
                {editingSchedule ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
