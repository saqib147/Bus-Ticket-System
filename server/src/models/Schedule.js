import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema(
  {
    busId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', required: true },
    routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
    operatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    departureTime: { type: String, required: true },
    arrivalTime: { type: String, required: true },
    fare: { type: Number, required: true, min: 0 },
    availableSeats: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['scheduled', 'departed', 'arrived', 'cancelled'],
      default: 'scheduled',
    },
    date: { type: Date, required: true },
  },
  { timestamps: true }
);

scheduleSchema.index({ date: 1, routeId: 1 });

const Schedule = mongoose.model('Schedule', scheduleSchema);
export default Schedule;
