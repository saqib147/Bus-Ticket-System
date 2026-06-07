import Seat from '../models/Seat.js';

const LOCK_DURATION_MS = 5 * 60 * 1000;

export const initSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    socket.on('join-schedule', (scheduleId) => {
      socket.join(`schedule:${scheduleId}`);
    });

    socket.on('leave-schedule', (scheduleId) => {
      socket.leave(`schedule:${scheduleId}`);
    });

    socket.on('disconnect', async () => {
      // Locks expire via TTL index; no manual cleanup needed on disconnect
    });
  });
};

export const emitSeatLocked = (io, scheduleId, data) => {
  io.to(`schedule:${scheduleId}`).emit('seat-locked', data);
};

export const emitSeatReleased = (io, scheduleId, data) => {
  io.to(`schedule:${scheduleId}`).emit('seat-released', data);
};

export const emitSeatBooked = (io, scheduleId, data) => {
  io.to(`schedule:${scheduleId}`).emit('seat-booked', data);
};

export const lockSeats = async (scheduleId, seatIds, userId, io) => {
  const lockExpiresAt = new Date(Date.now() + LOCK_DURATION_MS);

  const seats = await Seat.find({
    _id: { $in: seatIds },
    scheduleId,
    status: 'available',
  });

  if (seats.length !== seatIds.length) {
    throw new Error('One or more seats are not available');
  }

  const updated = await Seat.updateMany(
    { _id: { $in: seatIds }, status: 'available' },
    {
      $set: {
        status: 'locked',
        lockedBy: userId,
        lockExpiresAt,
      },
    }
  );

  if (updated.modifiedCount !== seatIds.length) {
    throw new Error('Failed to lock all seats');
  }

  for (const seatId of seatIds) {
    emitSeatLocked(io, scheduleId, {
      seatId,
      lockedBy: userId,
      expiresAt: lockExpiresAt,
    });
  }

  return { lockExpiresAt, lockedCount: seatIds.length };
};

export const releaseSeats = async (scheduleId, seatIds, userId, io) => {
  const result = await Seat.updateMany(
    {
      _id: { $in: seatIds },
      scheduleId,
      status: 'locked',
      lockedBy: userId,
    },
    {
      $set: { status: 'available' },
      $unset: { lockedBy: 1, lockExpiresAt: 1 },
    }
  );

  for (const seatId of seatIds) {
    emitSeatReleased(io, scheduleId, { seatId });
  }

  return result.modifiedCount;
};

export const markSeatsBooked = async (scheduleId, seatNumbers, bookingId, io) => {
  const seats = await Seat.find({ scheduleId, seatNumber: { $in: seatNumbers } });

  await Seat.updateMany(
    { scheduleId, seatNumber: { $in: seatNumbers } },
    {
      $set: { status: 'booked', bookingId },
      $unset: { lockedBy: 1, lockExpiresAt: 1 },
    }
  );

  for (const seat of seats) {
    emitSeatBooked(io, scheduleId, { seatId: seat._id.toString() });
  }
};

export const releaseExpiredLocks = async () => {
  const now = new Date();
  await Seat.updateMany(
    { status: 'locked', lockExpiresAt: { $lt: now } },
    {
      $set: { status: 'available' },
      $unset: { lockedBy: 1, lockExpiresAt: 1 },
    }
  );
};

export { LOCK_DURATION_MS };
