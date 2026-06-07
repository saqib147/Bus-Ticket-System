import mongoose from 'mongoose';

const busSchema = new mongoose.Schema(
  {
    operatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    busNumber: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['AC', 'Non-AC', 'Sleeper', 'Semi-Sleeper'],
      required: true,
    },
    totalSeats: { type: Number, required: true, min: 1 },
    seatLayout: {
      rows: { type: Number, required: true },
      columns: { type: Number, required: true },
      config: [
        {
          row: Number,
          column: Number,
          type: { type: String, enum: ['window', 'aisle', 'middle'], default: 'window' },
        },
      ],
    },
    amenities: [{ type: String }],
    photos: [{ type: String }],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Bus = mongoose.model('Bus', busSchema);
export default Bus;
