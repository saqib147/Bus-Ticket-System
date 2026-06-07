import './src/config/env.js';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import connectDB from './src/config/db.js';
import { errorHandler, notFound } from './src/middleware/error.middleware.js';
import { initSocketHandlers } from './src/services/socket.service.js';

import authRoutes from './src/routes/auth.routes.js';
import userRoutes from './src/routes/user.routes.js';
import busRoutes from './src/routes/bus.routes.js';
import routeRoutes from './src/routes/route.routes.js';
import scheduleRoutes from './src/routes/schedule.routes.js';
import seatRoutes from './src/routes/seat.routes.js';
import bookingRoutes from './src/routes/booking.routes.js';
import paymentRoutes from './src/routes/payment.routes.js';
import ticketRoutes from './src/routes/ticket.routes.js';
import adminRoutes, { operatorRouter, reviewRouter } from './src/routes/admin.routes.js';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [process.env.CLIENT_URL, process.env.ADMIN_URL],
    credentials: true,
  },
});

app.set('io', io);
initSocketHandlers(io);

connectDB();

app.use(helmet());
app.use(
  cors({
    origin: [process.env.CLIENT_URL, process.env.ADMIN_URL],
    credentials: true,
  })
);
app.use(compression());
app.use(morgan('dev'));
app.use(cookieParser());
app.use((req, res, next) => {
  if (req.originalUrl === '/api/v1/payments/webhook') {
    express.raw({ type: 'application/json' })(req, res, next);
  } else {
    next();
  }
});
app.use((req, res, next) => {
  if (req.originalUrl === '/api/v1/payments/webhook') {
    next();
  } else {
    express.json({ limit: '10mb' })(req, res, next);
  }
});
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later' },
});
app.use('/api', limiter);

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'BusGo API is running' });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/buses', busRoutes);
app.use('/api/v1/routes', routeRoutes);
app.use('/api/v1/schedules', scheduleRoutes);
app.use('/api/v1/seats', seatRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/tickets', ticketRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/operator', operatorRouter);
app.use('/api/v1/reviews', reviewRouter);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`BusGo server running on port ${PORT}`);
});

export default app;
