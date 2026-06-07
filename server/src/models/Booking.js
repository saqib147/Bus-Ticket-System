import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    passengerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    scheduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Schedule', required: true },
    seats: [{ type: String, required: true }],
    totalAmount: { type: Number, required: true, min: 0 },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'refunded'],
      default: 'pending',
    },
    cancellationReason: { type: String },
    refundAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
