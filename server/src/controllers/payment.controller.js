import Booking from '../models/Booking.js';
import Payment from '../models/Payment.js';
import getStripe from '../config/stripe.js';
import { catchAsync } from '../utils/catchAsync.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { confirmBookingAfterPayment } from './booking.controller.js';
import { CURRENCY_CODE } from '../utils/currency.js';

export const createCheckoutSession = catchAsync(async (req, res) => {
  const { bookingId } = req.body;

  const booking = await Booking.findOne({
    _id: bookingId,
    passengerId: req.user._id,
    status: 'pending',
  });

  if (!booking) return errorResponse(res, 'Pending booking not found', 404);

  const session = await getStripe().checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: req.user.email,
    line_items: [
      {
        price_data: {
          currency: CURRENCY_CODE,
          product_data: {
            name: `BusGo Ticket - ${booking.seats.length} seat(s)`,
            description: `Seats: ${booking.seats.join(', ')}`,
          },
          unit_amount: Math.round((booking.totalAmount / booking.seats.length) * 100),
        },
        quantity: booking.seats.length,
      },
    ],
    metadata: { bookingId: booking._id.toString() },
    success_url: `${process.env.CLIENT_URL}/booking/success?bookingId=${booking._id}`,
    cancel_url: `${process.env.CLIENT_URL}/checkout?bookingId=${booking._id}`,
  });

  await Payment.findByIdAndUpdate(booking.paymentId, {
    stripeSessionId: session.id,
    currency: CURRENCY_CODE,
  });

  return successResponse(res, 'Checkout session created', {
    sessionId: session.id,
    url: session.url,
  });
});

export const stripeWebhook = catchAsync(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = getStripe().webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const io = req.app.get('io');

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const bookingId = session.metadata.bookingId;
    const paymentIntentId = session.payment_intent;

    await confirmBookingAfterPayment(bookingId, paymentIntentId, io);
  }

  res.json({ received: true });
});

export const getPaymentByBooking = catchAsync(async (req, res) => {
  const booking = await Booking.findOne({
    _id: req.params.bookingId,
    passengerId: req.user._id,
  });

  if (!booking) return errorResponse(res, 'Booking not found', 404);

  const payment = await Payment.findById(booking.paymentId);
  return successResponse(res, 'Payment fetched', { payment });
});
