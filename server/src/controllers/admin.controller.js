import User from '../models/User.js';
import Booking from '../models/Booking.js';
import Payment from '../models/Payment.js';
import Route from '../models/Route.js';
import Bus from '../models/Bus.js';
import Schedule from '../models/Schedule.js';
import Seat from '../models/Seat.js';
import Review from '../models/Review.js';
import { catchAsync } from '../utils/catchAsync.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { sendOperatorApprovalEmail } from '../services/email.service.js';

export const getAdminStats = catchAsync(async (req, res) => {
  const [totalUsers, totalBookings, totalRevenue, activeRoutes] = await Promise.all([
    User.countDocuments({ isActive: true }),
    Booking.countDocuments({ status: 'confirmed' }),
    Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Route.countDocuments({ isActive: true }),
  ]);

  const recentBookings = await Booking.find()
    .populate('passengerId', 'name email')
    .populate({ path: 'scheduleId', populate: { path: 'routeId' } })
    .sort({ createdAt: -1 })
    .limit(10);

  const pendingOperators = await User.find({
    role: 'operator',
    operatorStatus: 'pending',
  }).select('-password -refreshToken');

  return successResponse(res, 'Admin stats', {
    stats: {
      totalRevenue: totalRevenue[0]?.total || 0,
      totalBookings,
      activeUsers: totalUsers,
      activeRoutes,
    },
    recentBookings,
    pendingOperators,
  });
});

export const getUsers = catchAsync(async (req, res) => {
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.status === 'active') filter.isActive = true;
  if (req.query.status === 'inactive') filter.isActive = false;

  const users = await User.find(filter)
    .select('-password -refreshToken')
    .sort({ createdAt: -1 });

  return successResponse(res, 'Users fetched', { users });
});

export const toggleUserStatus = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return errorResponse(res, 'User not found', 404);
  if (user.role === 'admin') return errorResponse(res, 'Cannot modify admin account', 403);

  user.isActive = !user.isActive;
  await user.save();

  return successResponse(res, `User ${user.isActive ? 'activated' : 'suspended'}`, { user });
});

export const getPendingOperators = catchAsync(async (req, res) => {
  const operators = await User.find({ role: 'operator', operatorStatus: 'pending' })
    .select('-password -refreshToken')
    .sort({ createdAt: -1 });

  return successResponse(res, 'Pending operators', { operators });
});

export const approveOperator = catchAsync(async (req, res) => {
  const operator = await User.findOneAndUpdate(
    { _id: req.params.id, role: 'operator' },
    { operatorStatus: 'approved', isVerified: true },
    { new: true }
  ).select('-password -refreshToken');

  if (!operator) return errorResponse(res, 'Operator not found', 404);
  await sendOperatorApprovalEmail(operator, true);

  return successResponse(res, 'Operator approved', { operator });
});

export const rejectOperator = catchAsync(async (req, res) => {
  const operator = await User.findOneAndUpdate(
    { _id: req.params.id, role: 'operator' },
    { operatorStatus: 'rejected' },
    { new: true }
  ).select('-password -refreshToken');

  if (!operator) return errorResponse(res, 'Operator not found', 404);
  await sendOperatorApprovalEmail(operator, false);

  return successResponse(res, 'Operator rejected', { operator });
});

export const getAllBookings = catchAsync(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  if (req.user?.role === 'operator') {
    const schedules = await Schedule.find({ operatorId: req.user._id }).select('_id');
    const scheduleIds = schedules.map((s) => s._id);
    filter.scheduleId = { $in: scheduleIds };
  }

  const bookings = await Booking.find(filter)
    .populate('passengerId', 'name email phone')
    .populate({
      path: 'scheduleId',
      populate: [{ path: 'busId' }, { path: 'routeId' }],
    })
    .populate('paymentId')
    .sort({ createdAt: -1 });

  return successResponse(res, 'Bookings fetched', { bookings });
});

export const updateBookingStatus = catchAsync(async (req, res) => {
  const { status, cancellationReason } = req.body;

  const allowed = ['pending', 'confirmed', 'cancelled', 'refunded'];
  if (!allowed.includes(status)) {
    return errorResponse(res, `Status must be one of: ${allowed.join(', ')}`, 400);
  }

  const booking = await Booking.findById(req.params.id)
    .populate('passengerId', 'name email')
    .populate({ path: 'scheduleId', populate: [{ path: 'busId' }, { path: 'routeId' }] })
    .populate('paymentId');

  if (!booking) return errorResponse(res, 'Booking not found', 404);

  const previousStatus = booking.status;
  booking.status = status;

  if (['cancelled', 'refunded'].includes(status)) {
    booking.cancellationReason = cancellationReason || `Cancelled by admin`;

    // Free up seats if going from a non-cancelled state
    if (!['cancelled', 'refunded'].includes(previousStatus)) {
      await Seat.updateMany(
        { scheduleId: booking.scheduleId._id, seatNumber: { $in: booking.seats } },
        { $set: { status: 'available' }, $unset: { bookingId: 1 } }
      );
      await Schedule.findByIdAndUpdate(booking.scheduleId._id, {
        $inc: { availableSeats: booking.seats.length },
      });
    }

    // Update payment status
    if (booking.paymentId) {
      await Payment.findByIdAndUpdate(booking.paymentId._id, {
        status: status === 'refunded' ? 'refunded' : 'cancelled',
      });
    }
  }

  if (status === 'confirmed' && previousStatus !== 'confirmed') {
    // Re-decrement seats if re-confirming a cancelled booking
    if (['cancelled', 'refunded'].includes(previousStatus)) {
      await Seat.updateMany(
        { scheduleId: booking.scheduleId._id, seatNumber: { $in: booking.seats } },
        { $set: { status: 'booked', bookingId: booking._id } }
      );
      await Schedule.findByIdAndUpdate(booking.scheduleId._id, {
        $inc: { availableSeats: -booking.seats.length },
      });
    }
    if (booking.paymentId) {
      await Payment.findByIdAndUpdate(booking.paymentId._id, { status: 'completed' });
    }
  }

  await booking.save();

  const updated = await Booking.findById(booking._id)
    .populate('passengerId', 'name email phone')
    .populate({ path: 'scheduleId', populate: [{ path: 'busId' }, { path: 'routeId' }] })
    .populate('paymentId');

  return successResponse(res, 'Booking updated', { booking: updated });
});

export const getRevenueReport = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;
  const match = { status: 'completed' };

  if (startDate || endDate) {
    match.paidAt = {};
    if (startDate) match.paidAt.$gte = new Date(startDate);
    if (endDate) match.paidAt.$lte = new Date(endDate);
  }

  const revenue = await Payment.aggregate([
    { $match: match },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$paidAt' } },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return successResponse(res, 'Revenue report', { revenue });
});

export const getBookingsReport = catchAsync(async (req, res) => {
  const breakdown = await Booking.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  return successResponse(res, 'Bookings report', { breakdown });
});

export const getOperatorStats = catchAsync(async (req, res) => {
  const operatorId = req.user._id;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [todaySchedules, fleetSize, todayBookings] = await Promise.all([
    Schedule.find({
      operatorId,
      date: { $gte: today, $lt: tomorrow },
      status: 'scheduled',
    }).populate('busId routeId'),
    Bus.countDocuments({ operatorId, isActive: true }),
    Booking.find({
      status: 'confirmed',
    }).populate({
      path: 'scheduleId',
      match: { operatorId },
    }),
  ]);

  const operatorBookings = todayBookings.filter((b) => b.scheduleId);
  const todayRevenue = operatorBookings.reduce((sum, b) => sum + b.totalAmount, 0);

  return successResponse(res, 'Operator stats', {
    stats: {
      todayRevenue,
      todayPassengers: operatorBookings.reduce((sum, b) => sum + b.seats.length, 0),
      activeSchedules: todaySchedules.length,
      fleetSize,
    },
    todaySchedules,
  });
});

export const getOperatorRevenueReport = catchAsync(async (req, res) => {
  const bookings = await Booking.find({ status: 'confirmed' })
    .populate({ path: 'scheduleId', match: { operatorId: req.user._id } })
    .populate('paymentId');

  const operatorBookings = bookings.filter((b) => b.scheduleId);

  const weeklyRevenue = operatorBookings.reduce((acc, booking) => {
    const week = new Date(booking.createdAt).toISOString().slice(0, 10);
    acc[week] = (acc[week] || 0) + booking.totalAmount;
    return acc;
  }, {});

  return successResponse(res, 'Operator revenue report', {
    revenue: Object.entries(weeklyRevenue).map(([date, total]) => ({ date, total })),
  });
});

export const createReview = catchAsync(async (req, res) => {
  const { busId, scheduleId, rating, comment } = req.body;

  const review = await Review.create({
    passengerId: req.user._id,
    busId,
    scheduleId,
    rating,
    comment,
  });

  const stats = await Review.aggregate([
    { $match: { busId: review.busId } },
    { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  if (stats.length) {
    await Bus.findByIdAndUpdate(busId, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      totalReviews: stats[0].count,
    });
  }

  return successResponse(res, 'Review submitted', { review }, 201);
});

export const getBusReviews = catchAsync(async (req, res) => {
  const reviews = await Review.find({ busId: req.params.busId })
    .populate('passengerId', 'name profilePicture')
    .sort({ createdAt: -1 });

  return successResponse(res, 'Reviews fetched', { reviews });
});
