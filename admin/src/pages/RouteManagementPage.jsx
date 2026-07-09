import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, ArrowRight, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
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
import { selectCurrentUser } from '@/store/slices/authSlice';
import {
  useGetRoutesQuery,
  useCreateRouteMutation,
  useUpdateRouteMutation,
  useDeleteRouteMutation,
  useGetUsersQuery,
} from '@/store/api/adminApi';

const stopSchema = z.object({
  city: z.string().min(1, 'City name is required'),
});

const routeSchema = z.object({
  source: z.string().min(1, 'Source is required'),
  destination: z.string().min(1, 'Destination is required'),
  distanceKm: z.coerce.number().min(1, 'Distance must be at least 1 km'),
  estimatedDuration: z.coerce.number().min(1, 'Duration must be at least 1 minute'),
  operatorId: z.string().optional(),
  stops: z.array(stopSchema).default([]),
});

export default function RouteManagementPage() {
  const user = useSelector(selectCurrentUser);
  const isAdmin = user?.role === 'admin';

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [operatorFilter, setOperatorFilter] = useState('');

  const { data, isLoading } = useGetRoutesQuery(
    operatorFilter ? { operatorId: operatorFilter } : {}
  );
  const { data: operatorsData } = useGetUsersQuery(
    { role: 'operator' },
    { skip: !isAdmin }
  );

  const [createRoute, { isLoading: creating }] = useCreateRouteMutation();
  const [updateRoute, { isLoading: updating }] = useUpdateRouteMutation();
  const [deleteRoute, { isLoading: deleting }] = useDeleteRouteMutation();

  const routes = data?.data?.routes || [];
  const operators = (operatorsData?.data?.users || []).filter(
    (op) => op.operatorStatus === 'approved'
  );

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(routeSchema),
    defaultValues: {
      source: '',
      destination: '',
      distanceKm: 0,
      estimatedDuration: 0,
      operatorId: '',
      stops: [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'stops' });

  const openCreate = () => {
    setEditingRoute(null);
    reset({
      source: '',
      destination: '',
      distanceKm: 0,
      estimatedDuration: 0,
      operatorId: isAdmin ? '' : user?._id,
      stops: [{ city: '' }],
    });
    setDialogOpen(true);
  };

  const openEdit = (route) => {
    setEditingRoute(route);
    reset({
      source: route.source,
      destination: route.destination,
      distanceKm: route.distanceKm,
      estimatedDuration: route.estimatedDuration,
      operatorId: route.operatorId?._id || route.operatorId || '',
      stops: route.stops?.length
        ? route.stops.map((s) => ({ city: s.city }))
        : [{ city: '' }],
    });
    setDialogOpen(true);
  };

  const onSubmit = async (formData) => {
    if (isAdmin && !editingRoute && !formData.operatorId) {
      toast.error('Please select an operator');
      return;
    }

    const stops = formData.stops
      .filter((s) => s.city.trim())
      .map((s, i) => ({ city: s.city.trim(), order: i + 1 }));

    const payload = {
      source: formData.source,
      destination: formData.destination,
      distanceKm: formData.distanceKm,
      estimatedDuration: formData.estimatedDuration,
      stops,
    };

    if (isAdmin && formData.operatorId) {
      payload.operatorId = formData.operatorId;
    }

    try {
      if (editingRoute) {
        await updateRoute({ id: editingRoute._id, ...payload }).unwrap();
        toast.success('Route updated successfully');
      } else {
        await createRoute(payload).unwrap();
        toast.success('Route created successfully');
      }
      setDialogOpen(false);
    } catch (err) {
      toast.error(err.data?.message || 'Failed to save route');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this route?')) return;
    try {
      await deleteRoute(id).unwrap();
      toast.success('Route deactivated');
    } catch (err) {
      toast.error(err.data?.message || 'Failed to deactivate route');
    }
  };

  const handleReactivate = async (route) => {
    try {
      await updateRoute({ id: route._id, isActive: true }).unwrap();
      toast.success('Route reactivated');
    } catch (err) {
      toast.error(err.data?.message || 'Failed to reactivate route');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            {isAdmin ? 'Platform Routes' : 'Your Routes'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isAdmin
              ? 'Manage all bus routes across operators'
              : 'Create and manage routes for your fleet'}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Route
          </Button>
        )}
      </div>

      {isAdmin && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <Label className="shrink-0">Filter by operator</Label>
              <Select
                value={operatorFilter}
                onChange={(e) => setOperatorFilter(e.target.value)}
                className="max-w-xs"
              >
                <option value="">All operators</option>
                {operators.map((op) => (
                  <option key={op._id} value={op._id}>
                    {op.name}
                  </option>
                ))}
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Routes ({routes.length})
          </CardTitle>
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
                  <TableHead>Route</TableHead>
                  {isAdmin && <TableHead>Operator</TableHead>}
                  <TableHead>Distance</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Stops</TableHead>
                  <TableHead>Status</TableHead>
                  {isAdmin && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {routes.map((route) => (
                  <TableRow key={route._id}>
                    <TableCell>
                      <div className="flex items-center gap-2 font-medium">
                        {route.source}
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        {route.destination}
                      </div>
                    </TableCell>
                    {isAdmin && (
                      <TableCell>{route.operatorId?.name || '—'}</TableCell>
                    )}
                    <TableCell>{route.distanceKm} km</TableCell>
                    <TableCell>{route.estimatedDuration} min</TableCell>
                    <TableCell>{route.stops?.length || 0}</TableCell>
                    <TableCell>
                      <Badge variant={route.isActive ? 'success' : 'destructive'}>
                        {route.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => openEdit(route)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {route.isActive ? (
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={deleting}
                              onClick={() => handleDelete(route._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReactivate(route)}
                            >
                              Reactivate
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {routes.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={isAdmin ? 7 : 5}
                      className="text-center text-muted-foreground py-8"
                    >
                      No routes found. Add your first route to get started.
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
            <DialogTitle>{editingRoute ? 'Edit Route' : 'Add New Route'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {isAdmin && (
              <div className="space-y-2">
                <Label>Operator</Label>
                <Select {...register('operatorId')}>
                  <option value="">Select operator</option>
                  {operators.map((op) => (
                    <option key={op._id} value={op._id}>
                      {op.name}
                    </option>
                  ))}
                </Select>
                {errors.operatorId && (
                  <p className="text-sm text-destructive">{errors.operatorId.message}</p>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Source</Label>
                <Input placeholder="Lahore" {...register('source')} />
                {errors.source && (
                  <p className="text-sm text-destructive">{errors.source.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Destination</Label>
                <Input placeholder="Karachi" {...register('destination')} />
                {errors.destination && (
                  <p className="text-sm text-destructive">{errors.destination.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Distance (km)</Label>
                <Input type="number" min={1} {...register('distanceKm')} />
                {errors.distanceKm && (
                  <p className="text-sm text-destructive">{errors.distanceKm.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Duration (minutes)</Label>
                <Input type="number" min={1} {...register('estimatedDuration')} />
                {errors.estimatedDuration && (
                  <p className="text-sm text-destructive">{errors.estimatedDuration.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Intermediate Stops</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ city: '' })}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Stop
                </Button>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <Input
                      placeholder={`Stop ${index + 1}`}
                      {...register(`stops.${index}.city`)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={creating || updating}>
                {editingRoute ? 'Update Route' : 'Create Route'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
