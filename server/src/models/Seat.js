import mongoose from 'mongoose';

const seatSchema = new mongoose.Schema(
  {
    scheduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Schedule', required: true },
    seatNumber: { type: String, required: true },
    row: { type: Number, required: true },
    column: { type: Number, required: true },
    type: { type: String, enum: ['window', 'aisle', 'middle'], default: 'window' },
    status: {
      type: String,
      enum: ['available', 'locked', 'booked'],
      default: 'available',
    },
    lockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lockExpiresAt: { type: Date },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  },
  { timestamps: true }
);

seatSchema.index({ scheduleId: 1, seatNumber: 1 }, { unique: true });
seatSchema.index({ lockExpiresAt: 1 }, { expireAfterSeconds: 0 });

const Seat = mongoose.model('Seat', seatSchema);
export default Seat;
