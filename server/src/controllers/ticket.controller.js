import Booking from '../models/Booking.js';
import Ticket from '../models/Ticket.js';
import User from '../models/User.js';
import { catchAsync } from '../utils/catchAsync.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { generateTicketPDF } from '../services/pdf.service.js';

export const downloadTicket = catchAsync(async (req, res) => {
  const booking = await Booking.findOne({
    _id: req.params.bookingId,
    passengerId: req.user._id,
    status: 'confirmed',
  }).populate({
    path: 'scheduleId',
    populate: [{ path: 'busId' }, { path: 'routeId' }],
  });

  if (!booking) return errorResponse(res, 'Confirmed booking not found', 404);

  const ticket = await Ticket.findOne({ bookingId: booking._id });
  const passenger = await User.findById(req.user._id);

  const pdfBuffer = await generateTicketPDF({
    passenger,
    booking,
    schedule: booking.scheduleId,
    route: booking.scheduleId.routeId,
    bus: booking.scheduleId.busId,
    qrCodeImage: ticket?.qrCodeImage,
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=ticket-${booking._id}.pdf`);
  res.send(pdfBuffer);
});

export const getTicketByBooking = catchAsync(async (req, res) => {
  const booking = await Booking.findOne({
    _id: req.params.bookingId,
    passengerId: req.user._id,
    status: 'confirmed',
  }).populate({
    path: 'scheduleId',
    populate: [{ path: 'busId' }, { path: 'routeId' }],
  });

  if (!booking) return errorResponse(res, 'Confirmed booking not found', 404);

  const ticket = await Ticket.findOne({ bookingId: booking._id });
  return successResponse(res, 'Ticket fetched', { ticket, booking });
});

export const verifyTicket = catchAsync(async (req, res) => {
  const ticket = await Ticket.findOne({ qrCodeData: req.params.qrData })
    .populate('bookingId')
    .populate('passengerId', 'name email phone');

  if (!ticket) return errorResponse(res, 'Invalid ticket', 404);

  if (!ticket.isScanned) {
    ticket.isScanned = true;
    ticket.scannedAt = new Date();
    await ticket.save();
  }

  return successResponse(res, 'Ticket verified', {
    ticket,
    valid: true,
    alreadyScanned: ticket.isScanned,
  });
});
