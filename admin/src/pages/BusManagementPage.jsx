import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
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
  useGetMyBusesQuery,
  useCreateBusMutation,
  useUpdateBusMutation,
  useDeleteBusMutation,
} from '@/store/api/adminApi';

const busSchema = z.object({
  busNumber: z.string().min(1, 'Bus number is required'),
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['AC', 'Non-AC', 'Sleeper', 'Semi-Sleeper']),
  totalSeats: z.coerce.number().min(1, 'At least 1 seat required'),
  rows: z.coerce.number().min(1),
  columns: z.coerce.number().min(1),
  amenities: z.string().optional(),
});

const buildFormData = (data) => {
  const formData = new FormData();
  formData.append('busNumber', data.busNumber);
  formData.append('name', data.name);
  formData.append('type', data.type);
  formData.append('totalSeats', String(data.totalSeats));
  formData.append(
    'seatLayout',
    JSON.stringify({ rows: data.rows, columns: data.columns, config: [] })
  );
  const amenities = data.amenities
    ? data.amenities.split(',').map((a) => a.trim()).filter(Boolean)
    : [];
  formData.append('amenities', JSON.stringify(amenities));
  return formData;
};

export default function BusManagementPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBus, setEditingBus] = useState(null);

  const { data, isLoading } = useGetMyBusesQuery();
  const [createBus, { isLoading: creating }] = useCreateBusMutation();
  const [updateBus, { isLoading: updating }] = useUpdateBusMutation();
  const [deleteBus, { isLoading: deleting }] = useDeleteBusMutation();

  const buses = data?.data?.buses || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(busSchema),
    defaultValues: {
      busNumber: '',
      name: '',
      type: 'AC',
      totalSeats: 40,
      rows: 10,
      columns: 4,
      amenities: '',
    },
  });

  const openCreate = () => {
    setEditingBus(null);
    reset({
      busNumber: '',
      name: '',
      type: 'AC',
      totalSeats: 40,
      rows: 10,
      columns: 4,
      amenities: '',
    });
    setDialogOpen(true);
  };

  const openEdit = (bus) => {
    setEditingBus(bus);
    reset({
      busNumber: bus.busNumber,
      name: bus.name,
      type: bus.type,
      totalSeats: bus.totalSeats,
      rows: bus.seatLayout?.rows || 10,
      columns: bus.seatLayout?.columns || 4,
      amenities: (bus.amenities || []).join(', '),
    });
    setDialogOpen(true);
  };

  const onSubmit = async (formData) => {
    try {
      const payload = buildFormData(formData);
      if (editingBus) {
        await updateBus({ id: editingBus._id, formData: payload }).unwrap();
        toast.success('Bus updated successfully');
      } else {
        await createBus(payload).unwrap();
        toast.success('Bus created successfully');
      }
      setDialogOpen(false);
    } catch (err) {
      toast.error(err.data?.message || 'Failed to save bus');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this bus?')) return;
    try {
      await deleteBus(id).unwrap();
      toast.success('Bus deactivated');
    } catch (err) {
      toast.error(err.data?.message || 'Failed to deactivate bus');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Manage Fleet</h2>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Bus
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Buses</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Number</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Seats</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {buses.map((bus) => (
                  <TableRow key={bus._id}>
                    <TableCell className="font-medium">{bus.busNumber}</TableCell>
                    <TableCell>{bus.name}</TableCell>
                    <TableCell>{bus.type}</TableCell>
                    <TableCell>{bus.totalSeats}</TableCell>
                    <TableCell>
                      <Badge variant={bus.isActive ? 'success' : 'destructive'}>
                        {bus.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEdit(bus)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={deleting}
                          onClick={() => handleDelete(bus._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {buses.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No buses yet. Add your first bus.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent onClose={() => setDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>{editingBus ? 'Edit Bus' : 'Add New Bus'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Bus Number</Label>
                <Input {...register('busNumber')} />
                {errors.busNumber && (
                  <p className="text-sm text-destructive">{errors.busNumber.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Name</Label>
                <Input {...register('name')} />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select {...register('type')}>
                  <option value="AC">AC</option>
                  <option value="Non-AC">Non-AC</option>
                  <option value="Sleeper">Sleeper</option>
                  <option value="Semi-Sleeper">Semi-Sleeper</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Total Seats</Label>
                <Input type="number" {...register('totalSeats')} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Seat Rows</Label>
                <Input type="number" {...register('rows')} />
              </div>
              <div className="space-y-2">
                <Label>Seat Columns</Label>
                <Input type="number" {...register('columns')} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Amenities (comma-separated)</Label>
              <Input placeholder="WiFi, Charging, Blanket" {...register('amenities')} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={creating || updating}>
                {editingBus ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
