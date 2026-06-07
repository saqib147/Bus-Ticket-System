import { useState } from 'react';
import { formatCurrency } from '@/utils/currency';
import { format } from 'date-fns';
import { useSelector } from 'react-redux';
import { Search, Pencil } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
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
import { selectUserRole } from '@/store/slices/authSlice';
import {
  useGetAdminBookingsQuery,
  useGetOperatorBookingsQuery,
  useUpdateAdminBookingMutation,
} from '@/store/api/adminApi';
import toast from 'react-hot-toast';

const statusVariant = {
  pending: 'warning',
  confirmed: 'success',
  cancelled: 'destructive',
  refunded: 'secondary',
};

const STATUSES = ['pending', 'confirmed', 'cancelled', 'refunded'];

function EditBookingDialog({ booking, open, onClose }) {
  const [status, setStatus] = useState(booking?.status || 'pending');
  const [reason, setReason] = useState('');
  const [updateBooking, { isLoading }] = useUpdateAdminBookingMutation();

  const showReason = ['cancelled', 'refunded'].includes(status);

  const handleSave = async () => {
    try {
      await updateBooking({
        id: booking._id,
        status,
        ...(showReason && reason && { cancellationReason: reason }),
      }).unwrap();
      toast.success('Booking updated');
      onClose();
    } catch (err) {
      toast.error(err.data?.message || 'Failed to update booking');
    }
  };

  if (!booking) return null;

  const route = booking.scheduleId?.routeId;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent onClose={onClose}>
        <DialogHeader>
          <DialogTitle>Update Booking</DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {/* Booking summary */}
          <div className="rounded-md border bg-muted/40 p-4 text-sm space-y-1">
            <p>
              <span className="text-muted-foreground">ID: </span>
              <span className="font-mono">{booking._id.slice(-8).toUpperCase()}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Passenger: </span>
              <span className="font-medium">{booking.passengerId?.name}</span>
              {' '}
              <span className="text-muted-foreground text-xs">{booking.passengerId?.email}</span>
            </p>
            {route && (
              <p>
                <span className="text-muted-foreground">Route: </span>
                {route.source} → {route.destination}
              </p>
            )}
            <p>
              <span className="text-muted-foreground">Seats: </span>
              {booking.seats?.join(', ')}
            </p>
            <p>
              <span className="text-muted-foreground">Amount: </span>
              {formatCurrency(booking.totalAmount)}
            </p>
          </div>

          {/* Status selector */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </Select>
          </div>

          {/* Cancellation reason (only when cancelling/refunding) */}
          {showReason && (
            <div className="space-y-2">
              <Label htmlFor="reason">Reason (optional)</Label>
              <Input
                id="reason"
                placeholder="e.g. Schedule cancelled by operator"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading || status === booking.status}>
            {isLoading ? 'Saving...' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function BookingsPage() {
  const role = useSelector(selectUserRole);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [editingBooking, setEditingBooking] = useState(null);

  const adminQuery = useGetAdminBookingsQuery(
    { ...(statusFilter && { status: statusFilter }) },
    { skip: role !== 'admin' }
  );
  const operatorQuery = useGetOperatorBookingsQuery(
    { ...(statusFilter && { status: statusFilter }) },
    { skip: role !== 'operator' }
  );

  const { data, isLoading } = role === 'admin' ? adminQuery : operatorQuery;

  const bookings = (data?.data?.bookings || []).filter((b) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      b.passengerId?.name?.toLowerCase().includes(term) ||
      b.passengerId?.email?.toLowerCase().includes(term) ||
      b._id?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by passenger or booking ID..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </Select>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Passenger</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Seats</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  {role === 'admin' && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking._id}>
                    <TableCell className="font-mono text-xs">
                      {booking._id.slice(-8).toUpperCase()}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{booking.passengerId?.name || 'N/A'}</p>
                        <p className="text-xs text-muted-foreground">
                          {booking.passengerId?.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {booking.scheduleId?.routeId
                        ? `${booking.scheduleId.routeId.source} → ${booking.scheduleId.routeId.destination}`
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {booking.createdAt
                        ? format(new Date(booking.createdAt), 'MMM d, yyyy')
                        : 'N/A'}
                    </TableCell>
                    <TableCell>{booking.seats?.length || 0}</TableCell>
                    <TableCell>{formatCurrency(booking.totalAmount)}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[booking.status] || 'outline'}>
                        {booking.status}
                      </Badge>
                    </TableCell>
                    {role === 'admin' && (
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingBooking(booking)}
                          title="Edit booking"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {bookings.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={role === 'admin' ? 8 : 7} className="text-center text-muted-foreground">
                      No bookings found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <EditBookingDialog
        booking={editingBooking}
        open={!!editingBooking}
        onClose={() => setEditingBooking(null)}
      />
    </div>
  );
}
