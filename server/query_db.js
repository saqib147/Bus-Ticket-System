import mongoose from 'mongoose';
import Stripe from 'stripe';
import Bus from './src/models/Bus.js';
import Route from './src/models/Route.js';
import Booking from './src/models/Booking.js';
import Payment from './src/models/Payment.js';
import Ticket from './src/models/Ticket.js';
import User from './src/models/User.js';
import Schedule from './src/models/Schedule.js';
import Seat from './src/models/Seat.js';
import { confirmBookingAfterPayment } from './src/controllers/booking.controller.js';

const MONGO_URI = 'mongodb://busTicketSystem:busTicketSystem@ac-lscl0wu-shard-00-00.qvggexs.mongodb.net:27017,ac-lscl0wu-shard-00-01.qvggexs.mongodb.net:27017,ac-lscl0wu-shard-00-02.qvggexs.mongodb.net:27017/?ssl=true&replicaSet=atlas-ekzcxb-shard-0&authSource=admin&appName=Cluster0';

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to DB');

  const bookingId = '6a4e8eb81b45b4c602621b54';

  const booking = await Booking.findById(bookingId);
  console.log('Current Booking Status in DB:', booking ? booking.status : 'not found');

  if (booking && booking.status === 'pending') {
    try {
      console.log('Attempting to confirm booking...');
      const mockIo = {
        emit: (event, data) => console.log('Socket Emit:', event, data),
        to: (room) => ({
          emit: (event, data) => console.log(`Socket Room ${room} Emit:`, event, data)
        })
      };
      const res = await confirmBookingAfterPayment(bookingId, 'mock_pi_test', mockIo);
      console.log('Confirmation Success! Result status:', res.status);
    } catch (err) {
      console.error('Confirmation Failed with Error:', err);
    }
  }

  await mongoose.disconnect();
}

run().catch(console.error);
