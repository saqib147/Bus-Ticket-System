import mongoose from 'mongoose';

const routeSchema = new mongoose.Schema(
  {
    operatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    source: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    stops: [
      {
        city: { type: String, required: true },
        order: { type: Number, required: true },
      },
    ],
    distanceKm: { type: Number, required: true, min: 0 },
    estimatedDuration: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Route = mongoose.model('Route', routeSchema);
export default Route;
