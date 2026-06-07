import Schedule from '../models/Schedule.js';
import Bus from '../models/Bus.js';
import Seat from '../models/Seat.js';
import { catchAsync } from '../utils/catchAsync.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

const generateSeatsForSchedule = async (schedule, bus) => {
  const seats = [];
  const { rows, columns, config = [] } = bus.seatLayout;
  let seatNum = 1;

  for (let row = 1; row <= rows; row++) {
    for (let col = 1; col <= columns; col++) {
      const layoutConfig = config.find((c) => c.row === row && c.column === col);
      seats.push({
        scheduleId: schedule._id,
        seatNumber: String(seatNum),
        row,
        column: col,
        type: layoutConfig?.type || (col === 1 || col === columns ? 'window' : 'aisle'),
        status: 'available',
      });
      seatNum++;
    }
  }

  await Seat.insertMany(seats);
};

export const getSchedules = catchAsync(async (req, res) => {
  const filter = {};
  if (req.query.routeId) filter.routeId = req.query.routeId;
  if (req.query.busId) filter.busId = req.query.busId;
  if (req.query.date) {
    const d = new Date(req.query.date);
    filter.date = {
      $gte: new Date(d.setHours(0, 0, 0, 0)),
      $lte: new Date(d.setHours(23, 59, 59, 999)),
    };
  }
  if (req.query.operatorId) filter.operatorId = req.query.operatorId;
  if (req.user?.role === 'operator') filter.operatorId = req.user._id;

  const schedules = await Schedule.find(filter)
    .populate('busId')
    .populate('routeId')
    .sort({ date: 1, departureTime: 1 });

  return successResponse(res, 'Schedules fetched', { schedules });
});

export const getScheduleById = catchAsync(async (req, res) => {
  const schedule = await Schedule.findById(req.params.id)
    .populate('busId')
    .populate('routeId')
    .populate('operatorId', 'name email phone');

  if (!schedule) return errorResponse(res, 'Schedule not found', 404);
  return successResponse(res, 'Schedule fetched', { schedule });
});

export const createSchedule = catchAsync(async (req, res) => {
  const bus = await Bus.findOne({ _id: req.body.busId, operatorId: req.user._id });
  if (!bus) return errorResponse(res, 'Bus not found', 404);

  const schedule = await Schedule.create({
    ...req.body,
    operatorId: req.user._id,
    availableSeats: bus.totalSeats,
  });

  await generateSeatsForSchedule(schedule, bus);

  const populated = await Schedule.findById(schedule._id)
    .populate('busId')
    .populate('routeId');

  return successResponse(res, 'Schedule created', { schedule: populated }, 201);
});

export const updateSchedule = catchAsync(async (req, res) => {
  const schedule = await Schedule.findOne({ _id: req.params.id, operatorId: req.user._id });
  if (!schedule) return errorResponse(res, 'Schedule not found', 404);

  Object.assign(schedule, req.body);
  await schedule.save();

  const populated = await Schedule.findById(schedule._id)
    .populate('busId')
    .populate('routeId');

  return successResponse(res, 'Schedule updated', { schedule: populated });
});

export const deleteSchedule = catchAsync(async (req, res) => {
  const schedule = await Schedule.findOneAndUpdate(
    { _id: req.params.id, operatorId: req.user._id },
    { status: 'cancelled' },
    { new: true }
  );
  if (!schedule) return errorResponse(res, 'Schedule not found', 404);
  return successResponse(res, 'Schedule cancelled');
});

export const getSchedulePassengers = catchAsync(async (req, res) => {
  const schedule = await Schedule.findOne({
    _id: req.params.id,
    operatorId: req.user._id,
  }).populate('routeId');

  if (!schedule) return errorResponse(res, 'Schedule not found', 404);

  const Booking = (await import('../models/Booking.js')).default;
  const bookings = await Booking.find({
    scheduleId: schedule._id,
    status: 'confirmed',
  }).populate('passengerId', 'name email phone');

  return successResponse(res, 'Passenger manifest', { schedule, bookings });
});
