import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    passengerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    qrCodeData: { type: String, required: true, unique: true },
    qrCodeImage: { type: String, required: true },
    isScanned: { type: Boolean, default: false },
    scannedAt: { type: Date },
    issuedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Ticket = mongoose.model('Ticket', ticketSchema);
export default Ticket;
