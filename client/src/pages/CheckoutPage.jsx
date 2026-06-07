import { useSearchParams, useNavigate } from 'react-router-dom';
import { useGetBookingByIdQuery } from '@/store/api/bookingApi';
import { useCreateCheckoutSessionMutation } from '@/store/api/paymentApi';
import OrderSummaryCard from '@/components/checkout/OrderSummaryCard';
import PaymentForm from '@/components/checkout/PaymentForm';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Skeleton } from '@/components/ui/Skeleton';
import toast from 'react-hot-toast';

function CheckoutContent() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = params.get('bookingId');

  const { data, isLoading } = useGetBookingByIdQuery(bookingId, { skip: !bookingId });
  const [createSession, { isLoading: paying }] = useCreateCheckoutSessionMutation();

  const booking = data?.data?.booking;
  const schedule = booking?.scheduleId;
  const route = schedule?.routeId;
  const bus = schedule?.busId;

  const handlePay = async () => {
    if (!bookingId) return;

    try {
      const result = await createSession({ bookingId }).unwrap();
      if (result.data?.url) {
        window.location.href = result.data.url;
      } else {
        toast.error('Failed to get checkout URL');
      }
    } catch (err) {
      toast.error(err.data?.message || 'Payment session failed');
    }
  };

  if (!bookingId) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <p>No booking found. Please select seats first.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-24">
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <p>Booking not found</p>
      </div>
    );
  }

  if (booking.status === 'confirmed') {
    navigate(`/booking/success?bookingId=${bookingId}`, { replace: true });
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-24">
      <h1 className="mb-8 text-2xl font-bold">Checkout</h1>
      <div className="grid gap-8 lg:grid-cols-2">
        <OrderSummaryCard booking={booking} schedule={schedule} route={route} bus={bus} />
        <PaymentForm onPay={handlePay} isLoading={paying} disabled={booking.status !== 'pending'} />
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <ProtectedRoute>
      <CheckoutContent />
    </ProtectedRoute>
  );
}
