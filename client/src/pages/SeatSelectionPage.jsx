import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  useGetScheduleByIdQuery,
  useGetSeatMapQuery,
  useLockSeatsMutation,
  useReleaseSeatsMutation,
} from '@/store/api/busApi';
import { useCreateBookingMutation } from '@/store/api/bookingApi';
import {
  setSchedule,
  toggleSeat,
  setSelectedSeats,
  clearSelectedSeats,
  setLockExpiry,
  setBooking,
} from '@/store/slices/bookingSlice';
import useSocket from '@/hooks/useSocket';
import SeatMap from '@/components/seats/SeatMap';
import BookingSummaryCard from '@/components/seats/BookingSummaryCard';
import { Skeleton } from '@/components/ui/Skeleton';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import toast from 'react-hot-toast';

function SeatSelectionContent() {
  const { id: scheduleId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { selectedSeats, selectedSeatIds, lockExpiresAt } = useSelector((state) => state.booking);

  const [localSeats, setLocalSeats] = useState([]);
  const socketRef = useSocket(scheduleId);

  const { data: scheduleData, isLoading: scheduleLoading } = useGetScheduleByIdQuery(scheduleId);
  const { data: seatData, isLoading: seatsLoading, refetch } = useGetSeatMapQuery(scheduleId);
  const [lockSeats, { isLoading: locking }] = useLockSeatsMutation();
  const [releaseSeats] = useReleaseSeatsMutation();
  const [createBooking, { isLoading: booking }] = useCreateBookingMutation();

  const schedule = scheduleData?.data?.schedule;
  const route = schedule?.routeId;
  const bus = schedule?.busId;

  useEffect(() => {
    if (schedule) {
      dispatch(setSchedule(schedule));
    }
  }, [schedule, dispatch]);

  useEffect(() => {
    if (seatData?.data?.seats) {
      setLocalSeats(seatData.data.seats);
    }
  }, [seatData]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return undefined;

    const handleLocked = ({ seatId, lockedBy }) => {
      setLocalSeats((prev) =>
        prev.map((s) =>
          s._id === seatId ? { ...s, status: 'locked', lockedBy } : s
        )
      );
    };

    const handleReleased = ({ seatId }) => {
      setLocalSeats((prev) =>
        prev.map((s) =>
          s._id === seatId
            ? { ...s, status: 'available', lockedBy: undefined, lockExpiresAt: undefined }
            : s
        )
      );
    };

    const handleBooked = ({ seatId }) => {
      setLocalSeats((prev) =>
        prev.map((s) => (s._id === seatId ? { ...s, status: 'booked' } : s))
      );
    };

    socket.on('seat-locked', handleLocked);
    socket.on('seat-released', handleReleased);
    socket.on('seat-booked', handleBooked);

    return () => {
      socket.off('seat-locked', handleLocked);
      socket.off('seat-released', handleReleased);
      socket.off('seat-booked', handleBooked);
    };
  }, [socketRef, scheduleId]);

  const handleSeatClick = useCallback(
    async (seat) => {
      if (seat.status === 'booked') return;
      if (seat.status === 'locked' && seat.lockedBy !== user?._id) {
        toast.error('This seat is locked by another user');
        return;
      }

      const isSelected = selectedSeats.includes(seat.seatNumber);

      if (isSelected) {
        dispatch(toggleSeat({ seatNumber: seat.seatNumber, seatId: seat._id }));
        try {
          await releaseSeats({
            scheduleId,
            seatIds: [seat._id],
          }).unwrap();
        } catch (err) {
          toast.error(err.data?.message || 'Failed to release seat');
          dispatch(toggleSeat({ seatNumber: seat.seatNumber, seatId: seat._id }));
        }
        return;
      }

      if (selectedSeats.length >= 6) {
        toast.error('Maximum 6 seats per booking');
        return;
      }

      dispatch(toggleSeat({ seatNumber: seat.seatNumber, seatId: seat._id }));

      try {
        const result = await lockSeats({
          scheduleId,
          seatIds: [seat._id],
        }).unwrap();
        dispatch(setLockExpiry(result.data.lockExpiresAt));
        refetch();
      } catch (err) {
        dispatch(toggleSeat({ seatNumber: seat.seatNumber, seatId: seat._id }));
        toast.error(err.data?.message || 'Failed to lock seat');
        refetch();
      }
    },
    [selectedSeats, dispatch, lockSeats, releaseSeats, scheduleId, user, refetch]
  );

  const handleProceed = async () => {
    if (selectedSeats.length === 0) {
      toast.error('Please select at least one seat');
      return;
    }

    try {
      const result = await createBooking({
        scheduleId,
        seats: selectedSeats,
      }).unwrap();

      dispatch(setBooking(result.data.booking));
      toast.success('Booking created! Proceed to payment.');
      navigate(`/checkout?bookingId=${result.data.booking._id}`);
    } catch (err) {
      toast.error(err.data?.message || 'Failed to create booking');
    }
  };

  useEffect(() => {
    return () => {
      if (selectedSeatIds.length > 0) {
        releaseSeats({ scheduleId, seatIds: selectedSeatIds });
      }
      dispatch(clearSelectedSeats());
    };
  }, []);

  if (scheduleLoading || seatsLoading) {
    return (
      <div className="container mx-auto px-4 py-24">
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-24">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Select Your Seats</h1>
        {route && (
          <p className="text-muted-foreground">
            {route.source} → {route.destination} · {schedule?.departureTime}
          </p>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SeatMap
            seats={localSeats}
            onSeatClick={handleSeatClick}
            currentUserId={user?._id}
          />
        </div>
        <BookingSummaryCard
          schedule={schedule}
          route={route}
          bus={bus}
          selectedSeats={selectedSeats}
          lockExpiresAt={lockExpiresAt}
          onProceed={handleProceed}
          isLoading={booking || locking}
        />
      </div>
    </div>
  );
}

export default function SeatSelectionPage() {
  return (
    <ProtectedRoute>
      <SeatSelectionContent />
    </ProtectedRoute>
  );
}
