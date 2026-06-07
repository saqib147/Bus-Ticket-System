import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    passengerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    busId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', required: true },
    scheduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Schedule' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true },
  },
  { timestamps: true }
);

reviewSchema.index({ busId: 1, passengerId: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);
export default Review;
