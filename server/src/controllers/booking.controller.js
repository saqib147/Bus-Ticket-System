import Booking from '../models/Booking.js';
import Schedule from '../models/Schedule.js';
import Seat from '../models/Seat.js';
import Payment from '../models/Payment.js';
import Ticket from '../models/Ticket.js';
import User from '../models/User.js';
import getStripe from '../config/stripe.js';
import { catchAsync } from '../utils/catchAsync.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { markSeatsBooked } from '../services/socket.service.js';
import { generateQRCodeData, generateQRCodeImage } from '../services/qr.service.js';
import { generateTicketPDF } from '../services/pdf.service.js';
import {
  sendBookingConfirmationEmail,
  sendCancellationEmail,
} from '../services/email.service.js';

export const createBooking = catchAsync(async (req, res) => {
  const { scheduleId, seats } = req.body;

  const schedule = await Schedule.findById(scheduleId).populate('busId routeId');
  if (!schedule) return errorResponse(res, 'Schedule not found', 404);
  if (schedule.status !== 'scheduled') return errorResponse(res, 'Schedule not available', 400);

  const lockedSeats = await Seat.find({
    scheduleId,
    seatNumber: { $in: seats },
    status: 'locked',
    lockedBy: req.user._id,
  });

  if (lockedSeats.length !== seats.length) {
    return errorResponse(res, 'Seats must be locked before booking', 400);
  }

  const totalAmount = schedule.fare * seats.length;

  const booking = await Booking.create({
    passengerId: req.user._id,
    scheduleId,
    seats,
    totalAmount,
    status: 'pending',
  });

  const payment = await Payment.create({
    bookingId: booking._id,
    amount: totalAmount,
    status: 'pending',
  });

  booking.paymentId = payment._id;
  await booking.save();

  return successResponse(
    res,
    'Booking created. Proceed to payment.',
    { booking, payment },
    201
  );
});

export const getBookings = catchAsync(async (req, res) => {
  const bookings = await Booking.find({ passengerId: req.user._id })
    .populate({
      path: 'scheduleId',
      populate: [{ path: 'busId' }, { path: 'routeId' }],
    })
    .populate('paymentId')
    .sort({ createdAt: -1 });

  return successResponse(res, 'Bookings fetched', { bookings });
});

export const getBookingById = catchAsync(async (req, res) => {
  const booking = await Booking.findOne({
    _id: req.params.id,
    passengerId: req.user._id,
  })
    .populate({
      path: 'scheduleId',
      populate: [{ path: 'busId' }, { path: 'routeId' }],
    })
    .populate('paymentId');

  if (!booking) return errorResponse(res, 'Booking not found', 404);
  return successResponse(res, 'Booking fetched', { booking });
});

export const cancelBooking = catchAsync(async (req, res) => {
  const booking = await Booking.findOne({
    _id: req.params.id,
    passengerId: req.user._id,
  }).populate('paymentId');

  if (!booking) return errorResponse(res, 'Booking not found', 404);
  if (['cancelled', 'refunded'].includes(booking.status)) {
    return errorResponse(res, 'Booking already cancelled', 400);
  }

  let refundAmount = 0;
  const payment = booking.paymentId;

  if (payment?.status === 'completed' && payment.stripePaymentIntentId) {
    const refund = await getStripe().refunds.create({
      payment_intent: payment.stripePaymentIntentId,
    });
    refundAmount = refund.amount / 100;
    payment.status = 'refunded';
    payment.stripeRefundId = refund.id;
    await payment.save();
    booking.status = 'refunded';
  } else {
    booking.status = 'cancelled';
  }

  booking.cancellationReason = req.body.reason || 'Cancelled by passenger';
  booking.refundAmount = refundAmount;
  await booking.save();

  await Seat.updateMany(
    { scheduleId: booking.scheduleId, seatNumber: { $in: booking.seats } },
    { $set: { status: 'available' }, $unset: { bookingId: 1 } }
  );

  await Schedule.findByIdAndUpdate(booking.scheduleId, {
    $inc: { availableSeats: booking.seats.length },
  });

  const user = await User.findById(req.user._id);
  await sendCancellationEmail(user, booking, refundAmount);

  return successResponse(res, 'Booking cancelled', { booking, refundAmount });
});

export const confirmBookingAfterPayment = async (bookingId, paymentIntentId, io) => {
  const booking = await Booking.findById(bookingId).populate({
    path: 'scheduleId',
    populate: [{ path: 'busId' }, { path: 'routeId' }],
  });

  if (!booking || booking.status === 'confirmed') return booking;

  const payment = await Payment.findById(booking.paymentId);
  payment.status = 'completed';
  payment.stripePaymentIntentId = paymentIntentId;
  payment.paidAt = new Date();
  await payment.save();

  booking.status = 'confirmed';
  await booking.save();

  await markSeatsBooked(booking.scheduleId._id, booking.seats, booking._id, io);

  await Schedule.findByIdAndUpdate(booking.scheduleId._id, {
    $inc: { availableSeats: -booking.seats.length },
  });

  const qrCodeData = generateQRCodeData(booking._id, booking.passengerId);
  const qrCodeImage = await generateQRCodeImage(qrCodeData);

  await Ticket.create({
    bookingId: booking._id,
    passengerId: booking.passengerId,
    qrCodeData,
    qrCodeImage,
  });

  const passenger = await User.findById(booking.passengerId);
  const pdfBuffer = await generateTicketPDF({
    passenger,
    booking,
    schedule: booking.scheduleId,
    route: booking.scheduleId.routeId,
    bus: booking.scheduleId.busId,
    qrCodeImage,
  });

  await sendBookingConfirmationEmail(passenger, booking, pdfBuffer);

  return booking;
};
