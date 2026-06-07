import './config/env.js';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import User from './models/User.js';
import Bus from './models/Bus.js';
import Route from './models/Route.js';
import Schedule from './models/Schedule.js';
import Seat from './models/Seat.js';
import Booking from './models/Booking.js';
import Payment from './models/Payment.js';
import Ticket from './models/Ticket.js';
import { generateQRCodeData, generateQRCodeImage } from './services/qr.service.js';

const createSeatLayout = (rows, columns) => {
  const config = [];
  for (let row = 1; row <= rows; row++) {
    for (let col = 1; col <= columns; col++) {
      config.push({
        row,
        column: col,
        type: col === 1 || col === columns ? 'window' : col === 2 || col === columns - 1 ? 'aisle' : 'middle',
      });
    }
  }
  return { rows, columns, config };
};

const generateSeats = async (schedule, bus) => {
  const seats = [];
  let seatNum = 1;
  const { rows, columns, config } = bus.seatLayout;

  for (let row = 1; row <= rows; row++) {
    for (let col = 1; col <= columns; col++) {
      const layoutConfig = config.find((c) => c.row === row && c.column === col);
      seats.push({
        scheduleId: schedule._id,
        seatNumber: String(seatNum),
        row,
        column: col,
        type: layoutConfig?.type || 'window',
        status: 'available',
      });
      seatNum++;
    }
  }

  return Seat.insertMany(seats);
};

const seed = async () => {
  await connectDB();

  console.log('Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Bus.deleteMany({}),
    Route.deleteMany({}),
    Schedule.deleteMany({}),
    Seat.deleteMany({}),
    Booking.deleteMany({}),
    Payment.deleteMany({}),
    Ticket.deleteMany({}),
  ]);

  console.log('Creating users...');
  // insertMany bypasses Mongoose pre-save hooks, so we use create() for all users
  // to ensure passwords are properly hashed by the pre-save hook.
  const admin = await User.create({
    name: 'BusGo Admin',
    email: 'admin@busgo.com',
    password: 'Admin@123',
    role: 'admin',
    isVerified: true,
    operatorStatus: 'approved',
  });

  const [operator1, operator2] = await Promise.all([
    User.create({
      name: 'FastTrack Transport',
      email: 'operator1@busgo.com',
      password: 'Op@123',
      role: 'operator',
      phone: '+923001234567',
      isVerified: true,
      operatorStatus: 'approved',
    }),
    User.create({
      name: 'GreenLine Buses',
      email: 'operator2@busgo.com',
      password: 'Op@123',
      role: 'operator',
      phone: '+923007654321',
      isVerified: true,
      operatorStatus: 'approved',
    }),
  ]);
  const operators = [operator1, operator2];

  const passengers = await Promise.all([
    User.create({ name: 'Ali Khan', email: 'user1@busgo.com', password: 'User@123', role: 'passenger', isVerified: true, operatorStatus: 'approved', phone: '+923001111111' }),
    User.create({ name: 'Sara Ahmed', email: 'user2@busgo.com', password: 'User@123', role: 'passenger', isVerified: true, operatorStatus: 'approved', phone: '+923002222222' }),
    User.create({ name: 'Usman Malik', email: 'user3@busgo.com', password: 'User@123', role: 'passenger', isVerified: true, operatorStatus: 'approved', phone: '+923003333333' }),
    User.create({ name: 'Fatima Noor', email: 'user4@busgo.com', password: 'User@123', role: 'passenger', isVerified: true, operatorStatus: 'approved', phone: '+923004444444' }),
    User.create({ name: 'Hassan Raza', email: 'user5@busgo.com', password: 'User@123', role: 'passenger', isVerified: true, operatorStatus: 'approved', phone: '+923005555555' }),
  ]);

  console.log('Creating buses...');
  const buses = await Bus.insertMany([
    {
      operatorId: operators[0]._id,
      busNumber: 'FT-001',
      name: 'FastTrack Express',
      type: 'AC',
      totalSeats: 40,
      seatLayout: createSeatLayout(10, 4),
      amenities: ['WiFi', 'USB Charging', 'Water Bottle', 'Blanket'],
      photos: ['https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800'],
      rating: 4.5,
      totalReviews: 12,
    },
    {
      operatorId: operators[0]._id,
      busNumber: 'FT-002',
      name: 'FastTrack Deluxe',
      type: 'Sleeper',
      totalSeats: 30,
      seatLayout: createSeatLayout(10, 3),
      amenities: ['WiFi', 'Blanket', 'Pillow', 'Reading Light'],
      photos: ['https://images.unsplash.com/photo-1570125909232-eb263c188fc7?w=800'],
      rating: 4.2,
      totalReviews: 8,
    },
    {
      operatorId: operators[0]._id,
      busNumber: 'FT-003',
      name: 'FastTrack Standard',
      type: 'Non-AC',
      totalSeats: 45,
      seatLayout: createSeatLayout(15, 3),
      amenities: ['Water Bottle'],
      photos: ['https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=800'],
      rating: 3.8,
      totalReviews: 5,
    },
    {
      operatorId: operators[1]._id,
      busNumber: 'GL-001',
      name: 'GreenLine Premium',
      type: 'AC',
      totalSeats: 40,
      seatLayout: createSeatLayout(10, 4),
      amenities: ['WiFi', 'USB Charging', 'Snacks', 'Entertainment'],
      photos: ['https://images.unsplash.com/photo-1464219789935-c9666a7d2383?w=800'],
      rating: 4.7,
      totalReviews: 20,
    },
    {
      operatorId: operators[1]._id,
      busNumber: 'GL-002',
      name: 'GreenLine Semi-Sleeper',
      type: 'Semi-Sleeper',
      totalSeats: 36,
      seatLayout: createSeatLayout(12, 3),
      amenities: ['WiFi', 'Blanket', 'Water Bottle'],
      photos: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'],
      rating: 4.0,
      totalReviews: 10,
    },
    {
      operatorId: operators[1]._id,
      busNumber: 'GL-003',
      name: 'GreenLine Economy',
      type: 'Non-AC',
      totalSeats: 50,
      seatLayout: createSeatLayout(10, 5),
      amenities: ['Water Bottle'],
      photos: ['https://images.unsplash.com/photo-1570125909232-eb263c188fc7?w=800'],
      rating: 3.5,
      totalReviews: 6,
    },
  ]);

  console.log('Creating routes...');
  const routes = await Route.insertMany([
    {
      operatorId: operators[0]._id,
      source: 'Lahore',
      destination: 'Karachi',
      stops: [{ city: 'Multan', order: 1 }, { city: 'Hyderabad', order: 2 }],
      distanceKm: 1210,
      estimatedDuration: 720,
    },
    {
      operatorId: operators[0]._id,
      source: 'Lahore',
      destination: 'Islamabad',
      stops: [{ city: 'Gujranwala', order: 1 }, { city: 'Rawalpindi', order: 2 }],
      distanceKm: 375,
      estimatedDuration: 300,
    },
    {
      operatorId: operators[1]._id,
      source: 'Karachi',
      destination: 'Lahore',
      stops: [{ city: 'Hyderabad', order: 1 }, { city: 'Multan', order: 2 }],
      distanceKm: 1210,
      estimatedDuration: 720,
    },
    {
      operatorId: operators[1]._id,
      source: 'Islamabad',
      destination: 'Peshawar',
      stops: [{ city: 'Taxila', order: 1 }, { city: 'Attock', order: 2 }],
      distanceKm: 185,
      estimatedDuration: 180,
    },
  ]);

  console.log('Creating schedules...');
  const schedules = [];
  const scheduleConfigs = [
    { bus: buses[0], route: routes[0], departure: '08:00', arrival: '20:00', fare: 4500 },
    { bus: buses[1], route: routes[0], departure: '20:00', arrival: '08:00', fare: 5500 },
    { bus: buses[2], route: routes[1], departure: '06:00', arrival: '11:00', fare: 1500 },
    { bus: buses[3], route: routes[2], departure: '09:00', arrival: '21:00', fare: 5000 },
    { bus: buses[4], route: routes[2], departure: '21:00', arrival: '09:00', fare: 6000 },
    { bus: buses[5], route: routes[3], departure: '07:00', arrival: '10:00', fare: 1200 },
    { bus: buses[0], route: routes[1], departure: '14:00', arrival: '19:00', fare: 1800 },
    { bus: buses[3], route: routes[0], departure: '10:00', arrival: '22:00', fare: 4800 },
    { bus: buses[1], route: routes[2], departure: '22:00', arrival: '10:00', fare: 5800 },
    { bus: buses[4], route: routes[1], departure: '16:00', arrival: '21:00', fare: 2000 },
  ];

  // Use dates starting from tomorrow and spread across the next 30 days
  // so the seeded data is always valid regardless of when seed is run.
  const tomorrow = new Date();
  tomorrow.setUTCHours(0, 0, 0, 0);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

  for (let i = 0; i < scheduleConfigs.length; i++) {
    const config = scheduleConfigs[i];
    const date = new Date(tomorrow);
    date.setUTCDate(tomorrow.getUTCDate() + (i % 14)); // spread over 2 weeks

    const schedule = await Schedule.create({
      busId: config.bus._id,
      routeId: config.route._id,
      operatorId: config.bus.operatorId,
      departureTime: config.departure,
      arrivalTime: config.arrival,
      fare: config.fare,
      availableSeats: config.bus.totalSeats,
      date,
      status: 'scheduled',
    });

    await generateSeats(schedule, config.bus);
    schedules.push(schedule);
  }

  console.log('Creating sample bookings...');
  const bookingConfigs = [
    { passenger: passengers[0], schedule: schedules[0], seats: ['1', '2'], amount: 9000 },
    { passenger: passengers[1], schedule: schedules[1], seats: ['5'], amount: 5500 },
    { passenger: passengers[2], schedule: schedules[2], seats: ['3', '4'], amount: 3000 },
    { passenger: passengers[3], schedule: schedules[3], seats: ['10'], amount: 5000 },
    { passenger: passengers[4], schedule: schedules[4], seats: ['7', '8'], amount: 12000 },
    { passenger: passengers[0], schedule: schedules[5], seats: ['2'], amount: 1200 },
    { passenger: passengers[1], schedule: schedules[6], seats: ['15'], amount: 1800 },
    { passenger: passengers[2], schedule: schedules[7], seats: ['20', '21'], amount: 9600 },
  ];

  for (const config of bookingConfigs) {
    const payment = await Payment.create({
      bookingId: new mongoose.Types.ObjectId(),
      amount: config.amount,
      currency: 'pkr',
      status: 'completed',
      stripePaymentIntentId: `pi_seed_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      paidAt: new Date(),
    });

    const booking = await Booking.create({
      passengerId: config.passenger._id,
      scheduleId: config.schedule._id,
      seats: config.seats,
      totalAmount: config.amount,
      paymentId: payment._id,
      status: 'confirmed',
    });

    payment.bookingId = booking._id;
    await payment.save();

    await Seat.updateMany(
      { scheduleId: config.schedule._id, seatNumber: { $in: config.seats } },
      { status: 'booked', bookingId: booking._id }
    );

    await Schedule.findByIdAndUpdate(config.schedule._id, {
      $inc: { availableSeats: -config.seats.length },
    });

    const qrCodeData = generateQRCodeData(booking._id, config.passenger._id);
    const qrCodeImage = await generateQRCodeImage(qrCodeData);

    await Ticket.create({
      bookingId: booking._id,
      passengerId: config.passenger._id,
      qrCodeData,
      qrCodeImage,
    });
  }

  console.log('Seed completed successfully!');

  // Print the seeded schedule dates so you know what to search for
  console.log('\nSeeded schedule dates (search within these):');
  const uniqueDates = [...new Set(schedules.map((s) => s.date.toISOString().slice(0, 10)))].sort();
  uniqueDates.forEach((d) => console.log(' ', d));

  console.log('\nSample search: Lahore → Karachi on', uniqueDates[0]);
  console.log('\nDefault credentials:');
  console.log('  Admin:     admin@busgo.com / Admin@123');
  console.log('  Operator:  operator1@busgo.com / Op@123');
  console.log('  Passenger: user1@busgo.com / User@123');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
