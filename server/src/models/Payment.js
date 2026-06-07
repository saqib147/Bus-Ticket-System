import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    stripeSessionId: { type: String },
    stripePaymentIntentId: { type: String },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'pkr' },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    stripeRefundId: { type: String },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
