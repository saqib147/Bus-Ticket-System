import Bus from '../models/Bus.js';
import Schedule from '../models/Schedule.js';
import Route from '../models/Route.js';
import { catchAsync } from '../utils/catchAsync.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import cloudinary from '../config/cloudinary.js';

export const searchBuses = catchAsync(async (req, res) => {
  const { from, to, date, type } = req.query;

  if (!from || !to || !date) {
    return errorResponse(res, 'from, to, and date are required', 400);
  }

  // Always work in UTC to match how MongoDB stores dates from the seed.
  // "2026-06-09" → UTC midnight → UTC end of day
  const [year, month, day] = date.split('-').map(Number);
  const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

  const routes = await Route.find({
    source: new RegExp(from, 'i'),
    destination: new RegExp(to, 'i'),
    isActive: true,
  });

  if (!routes.length) {
    return successResponse(res, 'No buses found', { results: [] });
  }

  const routeIds = routes.map((r) => r._id);
  const scheduleQuery = {
    routeId: { $in: routeIds },
    date: { $gte: startOfDay, $lte: endOfDay },
    status: 'scheduled',
    availableSeats: { $gt: 0 },
  };

  let schedules = await Schedule.find(scheduleQuery)
    .populate('busId')
    .populate('routeId')
    .populate('operatorId', 'name email')
    .sort({ departureTime: 1 });

  if (type) {
    schedules = schedules.filter((s) => s.busId?.type === type);
  }

  const results = schedules.map((schedule) => ({
    schedule,
    bus: schedule.busId,
    route: schedule.routeId,
    operator: schedule.operatorId,
  }));

  return successResponse(res, 'Search results', { results });
});

export const getBusById = catchAsync(async (req, res) => {
  const bus = await Bus.findById(req.params.id).populate('operatorId', 'name email phone');
  if (!bus) return errorResponse(res, 'Bus not found', 404);
  return successResponse(res, 'Bus fetched', { bus });
});

export const createBus = catchAsync(async (req, res) => {
  const photos = [];
  if (req.files?.length) {
    for (const file of req.files) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'busgo/buses' },
          (error, result) => (error ? reject(error) : resolve(result))
        );
        stream.end(file.buffer);
      });
      photos.push(result.secure_url);
    }
  }

  const bus = await Bus.create({
    ...req.body,
    operatorId: req.user._id,
    photos,
    seatLayout: typeof req.body.seatLayout === 'string'
      ? JSON.parse(req.body.seatLayout)
      : req.body.seatLayout,
    amenities: typeof req.body.amenities === 'string'
      ? JSON.parse(req.body.amenities)
      : req.body.amenities || [],
  });

  return successResponse(res, 'Bus created', { bus }, 201);
});

export const updateBus = catchAsync(async (req, res) => {
  const bus = await Bus.findOne({ _id: req.params.id, operatorId: req.user._id });
  if (!bus) return errorResponse(res, 'Bus not found', 404);

  const updates = { ...req.body };
  if (typeof updates.seatLayout === 'string') updates.seatLayout = JSON.parse(updates.seatLayout);
  if (typeof updates.amenities === 'string') updates.amenities = JSON.parse(updates.amenities);

  if (req.files?.length) {
    const photos = [...(bus.photos || [])];
    for (const file of req.files) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'busgo/buses' },
          (error, result) => (error ? reject(error) : resolve(result))
        );
        stream.end(file.buffer);
      });
      photos.push(result.secure_url);
    }
    updates.photos = photos;
  }

  Object.assign(bus, updates);
  await bus.save();

  return successResponse(res, 'Bus updated', { bus });
});

export const deleteBus = catchAsync(async (req, res) => {
  const bus = await Bus.findOneAndUpdate(
    { _id: req.params.id, operatorId: req.user._id },
    { isActive: false },
    { new: true }
  );
  if (!bus) return errorResponse(res, 'Bus not found', 404);
  return successResponse(res, 'Bus deactivated');
});

export const getMyBuses = catchAsync(async (req, res) => {
  const buses = await Bus.find({ operatorId: req.user._id }).sort({ createdAt: -1 });
  return successResponse(res, 'Buses fetched', { buses });
});
