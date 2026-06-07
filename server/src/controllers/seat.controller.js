import Seat from '../models/Seat.js';
import { catchAsync } from '../utils/catchAsync.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { lockSeats, releaseSeats, LOCK_DURATION_MS } from '../services/socket.service.js';

export const getSeatMap = catchAsync(async (req, res) => {
  const seats = await Seat.find({ scheduleId: req.params.scheduleId }).sort({
    row: 1,
    column: 1,
  });

  await Seat.updateMany(
    { scheduleId: req.params.scheduleId, status: 'locked', lockExpiresAt: { $lt: new Date() } },
    { $set: { status: 'available' }, $unset: { lockedBy: 1, lockExpiresAt: 1 } }
  );

  const refreshedSeats = await Seat.find({ scheduleId: req.params.scheduleId }).sort({
    row: 1,
    column: 1,
  });

  return successResponse(res, 'Seat map fetched', { seats: refreshedSeats });
});

export const lockSeatHandler = catchAsync(async (req, res) => {
  const { scheduleId, seatIds } = req.body;
  const io = req.app.get('io');

  if (!scheduleId || !seatIds?.length) {
    return errorResponse(res, 'scheduleId and seatIds are required', 400);
  }

  try {
    const result = await lockSeats(scheduleId, seatIds, req.user._id, io);
    return successResponse(res, 'Seats locked', {
      ...result,
      lockDurationMs: LOCK_DURATION_MS,
    });
  } catch (error) {
    return errorResponse(res, error.message, 409);
  }
});

export const releaseSeatHandler = catchAsync(async (req, res) => {
  const { scheduleId, seatIds } = req.body;
  const io = req.app.get('io');

  if (!scheduleId || !seatIds?.length) {
    return errorResponse(res, 'scheduleId and seatIds are required', 400);
  }

  const released = await releaseSeats(scheduleId, seatIds, req.user._id, io);
  return successResponse(res, 'Seats released', { released });
});
