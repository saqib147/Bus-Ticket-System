import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Home, LayoutDashboard } from 'lucide-react';
import { useGetBookingByIdQuery } from '@/store/api/bookingApi';
import { useGetTicketByBookingQuery, useLazyDownloadTicketPdfQuery } from '@/store/api/ticketApi';
import ETicketCard, { ConfettiEffect } from '@/components/booking/ETicketCard';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import toast from 'react-hot-toast';

function BookingSuccessContent() {
  const [params] = useSearchParams();
  const bookingId = params.get('bookingId');
  const [pollingInterval, setPollingInterval] = useState(3000);

  const { data: bookingData, isLoading: bookingLoading } = useGetBookingByIdQuery(
    { id: bookingId, confirm: true },
    {
      skip: !bookingId,
      pollingInterval,
    }
  );

  useEffect(() => {
    if (bookingData?.data?.booking?.status && bookingData.data.booking.status !== 'pending') {
      setPollingInterval(0);
    }
  }, [bookingData]);

  const { data: ticketData, isLoading: ticketLoading } = useGetTicketByBookingQuery(bookingId, {
    skip: !bookingId || bookingData?.data?.booking?.status !== 'confirmed',
  });
  const [downloadPdf] = useLazyDownloadTicketPdfQuery();

  const booking = bookingData?.data?.booking;
  const ticket = ticketData?.data?.ticket;
  const schedule = booking?.scheduleId;
  const route = schedule?.routeId;
  const bus = schedule?.busId;

  const handleDownload = async () => {
    try {
      const blob = await downloadPdf(bookingId).unwrap();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ticket-${bookingId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to download ticket');
    }
  };

  if (bookingLoading) {
    return (
      <div className="container mx-auto px-4 py-24">
        <Skeleton className="mx-auto h-96 max-w-lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-24">
      {booking?.status === 'confirmed' && <ConfettiEffect />}

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-auto max-w-lg text-center"
      >
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle className="h-10 w-10 text-emerald-600" />
          </div>
        </div>

        <h1 className="text-3xl font-bold">
          {booking?.status === 'confirmed' ? 'Booking Confirmed!' : 'Payment Processing...'}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {booking?.status === 'confirmed'
            ? 'Your e-ticket is ready. A confirmation email has been sent.'
            : 'Please wait while we confirm your payment...'}
        </p>
      </motion.div>

      <div className="mx-auto mt-10 max-w-lg">
        {ticketLoading || !ticket ? (
          <Skeleton className="h-96 w-full" />
        ) : (
          <ETicketCard
            ticket={ticket}
            booking={booking}
            schedule={schedule}
            route={route}
            bus={bus}
            onDownload={handleDownload}
          />
        )}
      </div>

      <div className="mx-auto mt-8 flex max-w-lg justify-center gap-4">
        <Link to="/">
          <Button variant="outline" className="gap-2">
            <Home className="h-4 w-4" /> Home
          </Button>
        </Link>
        <Link to="/dashboard">
          <Button className="gap-2">
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <ProtectedRoute>
      <BookingSuccessContent />
    </ProtectedRoute>
  );
}
