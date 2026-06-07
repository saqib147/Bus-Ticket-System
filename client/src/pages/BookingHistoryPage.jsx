import { useCancelBookingMutation, useGetUserBookingsQuery } from '@/store/api/bookingApi';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import BookingCard from '@/components/dashboard/BookingCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';
import toast from 'react-hot-toast';

function BookingHistoryContent() {
  const { data, isLoading, refetch } = useGetUserBookingsQuery();
  const [cancelBooking, { isLoading: cancelling }] = useCancelBookingMutation();
  const [cancelId, setCancelId] = useState(null);

  const bookings = data?.data?.bookings || [];

  const handleCancel = async () => {
    if (!cancelId) return;
    try {
      await cancelBooking({ id: cancelId, reason: 'Cancelled by passenger' }).unwrap();
      toast.success('Booking cancelled');
      setCancelId(null);
      refetch();
    } catch (err) {
      toast.error(err.data?.message || 'Cancellation failed');
    }
  };

  return (
    <div className="container mx-auto px-4 py-24">
      <h1 className="mb-2 text-2xl font-bold">Booking History</h1>
      <p className="mb-8 text-muted-foreground">View and manage all your bookings</p>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)}
        </div>
      ) : bookings.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center text-muted-foreground">
          No bookings found
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <BookingCard
              key={booking._id}
              booking={booking}
              onCancel={setCancelId}
            />
          ))}
        </div>
      )}

      <Dialog open={!!cancelId} onOpenChange={() => setCancelId(null)}>
        <DialogContent onClose={() => setCancelId(null)}>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking? Refunds apply for completed payments.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelId(null)}>Keep Booking</Button>
            <Button variant="destructive" onClick={handleCancel} disabled={cancelling}>
              {cancelling ? 'Cancelling...' : 'Confirm Cancel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function BookingHistoryPage() {
  return (
    <ProtectedRoute>
      <BookingHistoryContent />
    </ProtectedRoute>
  );
}
